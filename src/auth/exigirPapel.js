import { checarPerfil } from "./checarPerfil.js";

export async function exigirPapel(papeisPermitidos) {
  const perfil = await checarPerfil();

  if (!perfil) {
    return false;
  }

  return papeisPermitidos.includes(perfil.papel);
}
