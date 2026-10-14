import { db } from "../../config.js";

const CAMPOS = {
  nome: "#perfil-nome",
  matricula: "#perfil-matricula",
  papel: "#perfilPapel",
  avatar: "#avatar",
  email: "#email",
  telefone: "#telefone",
  formulario: "#formPerfil",
};

function preencher(campo, valor) {
  const elemento = document.querySelector(campo);

  if (elemento) {
    elemento.value = valor ?? "";
  }
}

function exibirTexto(campo, valor) {
  const elemento = document.querySelector(campo);

  if (elemento) {
    elemento.textContent = valor ?? "";
  }
}

export async function carregarPerfil() {
  try {
    // Obtém o usuário autenticado, seja por senha ou Google.
    const {
      data: { user },
      error: erroAuth,
    } = await db.auth.getUser();

    if (erroAuth || !user) {
      throw new Error("Usuário não autenticado.");
    }

    // Busca os dados complementares no banco.
    const { data: perfil, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Dados do Google ou de outro provedor OAuth.
    const metadata = user.user_metadata ?? {};

    const nome = perfil?.nome ?? metadata.full_name ?? metadata.name ?? "";
    const email = perfil?.email ?? user.email ?? "";
    const avatar =
      perfil?.avatar_url ?? metadata.avatar_url ?? metadata.picture ?? "";

    // Preenche os campos da interface.

    // O nome é um <h3> no HTML, portanto usamos exibirTexto
    exibirTexto(CAMPOS.nome, nome);

    // Inputs usam preencher
    preencher(CAMPOS.email, email);
    preencher(CAMPOS.telefone, perfil?.telefone ?? "");

    // Textos fixos ("Matrícula:" e "Categoria:") já estão no HTML,
    // então passamos apenas os valores dinâmicos
    exibirTexto(CAMPOS.matricula, perfil?.matricula ?? "Não informada");
    exibirTexto(CAMPOS.papel, perfil?.papel ?? "Não informada");

    // Atualiza a foto, caso exista.
    const elementoAvatar = document.querySelector(CAMPOS.avatar);

    if (elementoAvatar && avatar) {
      if (elementoAvatar instanceof HTMLImageElement) {
        elementoAvatar.src = avatar;
        elementoAvatar.alt = `Foto de ${nome || "usuário"}`;
      } else {
        elementoAvatar.style.backgroundImage = `url("${avatar.replace(/["\\]/g, "")}")`;
        elementoAvatar.style.backgroundSize = "cover";
        elementoAvatar.style.backgroundPosition = "center";
      }
    }

    return perfil;
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
    alert("Não foi possível carregar os dados do perfil.");
    return null;
  }
}

export async function salvarPerfil(event) {
  event?.preventDefault();

  try {
    const {
      data: { user },
      error: erroAuth,
    } = await db.auth.getUser();

    if (erroAuth || !user) {
      throw new Error("Sessão inválida. Faça login novamente.");
    }

    const telefone = document.querySelector(CAMPOS.telefone)?.value.trim();

    const { error } = await db
      .from("profiles")
      .update({
        telefone: telefone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }

    alert("Perfil atualizado com sucesso!");
    await carregarPerfil();
  } catch (erro) {
    console.error("Erro ao salvar perfil:", erro);
    alert("Não foi possível salvar as alterações.");
  }
}
