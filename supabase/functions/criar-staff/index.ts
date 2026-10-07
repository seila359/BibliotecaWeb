// =====================================================================
// Edge Function: criar-staff
//
// Cria um usuário em auth.users + define papel
// ('bibliotecario' | 'admin')
//
// Chamada:
// supabase.functions.invoke('criar-staff', { body: {...} })
//
// Autorização:
// APENAS admin (validado pelo JWT do caller)
// =====================================================================

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------

type Papel = "bibliotecario" | "admin";

interface Payload {
  email: string;
  nome: string;
  papel: Papel;
  senha?: string;
  avatar_url?: string;
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function resposta(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function gerarSenhaAleatoria(tamanho = 24): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

  const bytes = new Uint8Array(tamanho);

  crypto.getRandomValues(bytes);

  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // -------------------------------------------------------------------
  // Preflight CORS
  // -------------------------------------------------------------------

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // -------------------------------------------------------------------
  // Aceita apenas POST
  // -------------------------------------------------------------------

  if (req.method !== "POST") {
    return resposta(405, {
      error: "Método não permitido.",
    });
  }

  // -------------------------------------------------------------------
  // 1) Obtém JWT do caller
  // -------------------------------------------------------------------

  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return resposta(401, {
      error: "Não autenticado.",
    });
  }

  // -------------------------------------------------------------------
  // Variáveis de ambiente
  // -------------------------------------------------------------------

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return resposta(500, {
      error: "Variáveis de ambiente não configuradas.",
    });
  }

  // -------------------------------------------------------------------
  // Client usando o JWT do caller
  // -------------------------------------------------------------------

  const dbCaller = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  // -------------------------------------------------------------------
  // Client usando service_role
  // -------------------------------------------------------------------

  const dbAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // -------------------------------------------------------------------
  // 2) Valida que o caller é admin
  // -------------------------------------------------------------------

  const {
    data: { user: caller },
    error: authError,
  } = await dbCaller.auth.getUser();

  if (authError || !caller) {
    return resposta(401, {
      error: "Sessão inválida.",
    });
  }

  // -------------------------------------------------------------------
  // Busca o perfil do usuário que está chamando a função
  // -------------------------------------------------------------------

  const { data: callerPerfil, error: perfilError } = await dbAdmin
    .from("profiles")
    .select("papel")
    .eq("id", caller.id)
    .single();

  if (perfilError || callerPerfil?.papel !== "admin") {
    return resposta(403, {
      error: "Apenas administradores podem cadastrar membros da equipe.",
    });
  }

  // -------------------------------------------------------------------
  // 3) Valida payload
  // -------------------------------------------------------------------

  let body: Payload;

  try {
    body = await req.json();
  } catch {
    return resposta(400, {
      error: "JSON inválido.",
    });
  }

  const email = body.email?.trim().toLowerCase();
  const nome = body.nome?.trim();
  const papel = body.papel;

  // -------------------------------------------------------------------
  // Validação do e-mail
  // -------------------------------------------------------------------

  if (!email || !emailValido(email)) {
    return resposta(400, {
      error: "E-mail inválido.",
    });
  }

  // -------------------------------------------------------------------
  // Validação do nome
  // -------------------------------------------------------------------

  if (!nome || nome.length < 2) {
    return resposta(400, {
      error: "Nome inválido.",
    });
  }

  // -------------------------------------------------------------------
  // Validação do papel
  // -------------------------------------------------------------------

  if (papel !== "bibliotecario" && papel !== "admin") {
    return resposta(400, {
      error: "Papel deve ser 'bibliotecario' ou 'admin'.",
    });
  }

  // -------------------------------------------------------------------
  // Validação da senha
  // -------------------------------------------------------------------

  if (body.senha !== undefined && body.senha.length < 8) {
    return resposta(400, {
      error: "A senha deve possuir pelo menos 8 caracteres.",
    });
  }

  const senha = body.senha ?? gerarSenhaAleatoria();

  // -------------------------------------------------------------------
  // 4) Cria usuário em auth.users
  // -------------------------------------------------------------------

  const { data: novo, error: criarError } = await dbAdmin.auth.admin.createUser(
    {
      email,
      password: senha,
      email_confirm: true,

      user_metadata: {
        full_name: nome,
        avatar_url: body.avatar_url ?? null,
      },
    },
  );

  if (criarError || !novo.user) {
    const msg = criarError?.message ?? "Erro ao criar usuário.";

    if (msg.toLowerCase().includes("already")) {
      return resposta(409, {
        error: "Já existe um usuário com este e-mail.",
      });
    }

    return resposta(400, {
      error: msg,
    });
  }

  const novoUserId = novo.user.id;

  // -------------------------------------------------------------------
  // 5) Define o papel no profile
  // -------------------------------------------------------------------

  const { data: atualizado, error: papelError } = await dbAdmin
    .from("profiles")
    .update({ papel, nome, avatar_url: body.avatar_url ?? null })
    .eq("id", novoUserId)
    .select("id, nome, email, papel")
    .single();

  if (papelError || !atualizado) {
    await dbAdmin.auth.admin.deleteUser(novoUserId).catch(() => {});
    return resposta(500, {
      error: "Erro ao definir o papel. Usuário não foi criado.",
      detalhe: papelError?.message ?? "Perfil não encontrado.",
    });
  }

  // -------------------------------------------------------------------
  // 6) Se a senha foi gerada automaticamente,
  //    envia e-mail para redefinição
  // -------------------------------------------------------------------

  if (!body.senha) {
    const origin = req.headers.get("origin");

    if (origin) {
      await dbAdmin.auth
        .resetPasswordForEmail(email, {
          redirectTo: `${origin}/login.html`,
        })
        .catch(() => {
          // Não interrompe a criação caso o e-mail não seja enviado
        });
    }
  }

  // -------------------------------------------------------------------
  // 7) Resposta
  // -------------------------------------------------------------------

  return resposta(201, {
    ok: true,

    user: {
      id: novoUserId,
      email,
      nome,
      papel,
    },

    mensagem: body.senha
      ? "Usuário criado com sucesso."
      : "Usuário criado. Um e-mail para definir a senha foi enviado.",
  });
});
