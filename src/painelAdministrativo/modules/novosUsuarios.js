import { db } from "/src/config.js";
import { mostrarAlerta } from "/src/common/common.js";

export async function criarStaff(e) {
  e.preventDefault(); // agora é um SubmitEvent de verdade

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const papelUI = document.getElementById("papel").value;
  const avatarUrl = document.getElementById("avatar_url").value.trim();

  const papel =
    papelUI === "administrador"
      ? "admin"
      : papelUI === "bibliotecario"
        ? "bibliotecario"
        : null;

  if (!papel) return mostrarAlerta("Papel inválido.", "erro");

  const { data, error } = await db.functions.invoke("criar-staff", {
    body: { nome, email, papel, avatar_url: avatarUrl || null },
  });

  if (error) {
    console.error(error);
    let msg = "Erro ao criar usuário.";
    try {
      const corpo = await error.context?.json?.();
      msg = corpo?.error ?? error.message ?? msg;
    } catch {
      /* ignore */
    }
    return mostrarAlerta(msg, "erro");
  }

  if (!data?.ok) {
    console.error("Resposta inesperada:", data);
    return mostrarAlerta(
      data?.error ?? "Resposta inesperada da função.",
      "erro",
    );
  }

  mostrarAlerta(data.mensagem ?? "Usuário criado!", "sucesso");

  e.target.reset(); // reseta o próprio form que disparou o submit
}
