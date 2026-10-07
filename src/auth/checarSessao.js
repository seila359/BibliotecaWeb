import { db } from "../config.js";

export async function estaLogado() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    console.error("Erro ao verificar sessão:", error);
    return false;
  }

  return data.session !== null;
}
