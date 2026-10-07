import { db } from "../config.js";

export async function sair() {
  const { error } = await db.auth.signOut();

  if (error) {
    console.error("Erro ao sair:", error);
    mostrarAlerta("Erro ao sair do sistema.", "erro");
    return;
  }

  window.location.replace("../index.html");
}
