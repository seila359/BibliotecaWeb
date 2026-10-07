import { db } from "../config.js";

export async function obter() {
  const { data, error } = await db.auth.getUser();

  if (error) {
    console.error("Erro ao obter usuário logado:", error);
    return null;
  }

  return data.user;
}
