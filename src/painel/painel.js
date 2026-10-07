import { estaLogado } from "../auth/checarSessao.js";
import { obter } from "../auth/checarUsuario.js";
import { sair } from "../auth/sair.js"
import { exigirPapel } from "../auth/exigirPapel.js";
import { navigate } from "../common/modules/navigate.js";
import { salvarPerfil } from "./modules/perfil.js";
import { iniciarCatalogo } from "./modules/catalogo.js";
import { tratarCliques } from "./modules/catalogo.js";

// Proteção: sem sessão ou sem papel, volta para o login
if (!(await estaLogado())) {
  window.location.href = "login.html";
  throw new Error("Usuário não logado");
}

if (!(await exigirPapel(["leitor"]))) {
  window.location.href = "login.html";
  throw new Error("Papel não permitido");
}

const usuario = obter();
//carregarUsuario(usuario);

iniciarCatalogo();


document.addEventListener("click", async (e) => {

  const nav = e.target.closest("[data-navigate]");
  if (nav) {
    e.preventDefault();
    navigate(nav.dataset.navigate);
    return;
  }

  tratarCliques(e);
  
  const acao = e.target.closest("[data-action]");
  if (!acao) return;

  switch (acao.dataset.action) {
    case "logout":
      await sair();
      break;
    case "verificar-atraso":
      await verificarAtraso();
      break;
    case "confirmar-devolucao":
      await confirmarDevolucao(acao.dataset.id, acao);
      break;
    case "fechar-devolucao":
      fecharDevolucao();
      break;
  }

});

document
  .getElementById("form-perfil")
  .addEventListener("submit", (e) => salvarPerfil(e, usuario));
