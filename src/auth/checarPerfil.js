import { db } from "../config.js";
import { obter } from "./checarUsuario.js"

export async function checarPerfil() {
  const usuario = await obter();

  if (!usuario) {
    return null;
  }

  const { data, error } = await db
    .from("profiles")
    .select("papel")
    .eq("id", usuario.id)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }

  return data;
}
