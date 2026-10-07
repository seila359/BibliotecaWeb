import { navigate } from "../common/modules/navigate.js";
import { verificarAtraso, fecharDevolucao } from "./modules/devolucao.js";
import { handleCadastroLivro } from "./modules/cadastroLivro.js";
import { estaLogado } from "../auth/checarSessao.js";
import { exigirPapel } from "../auth/exigirPapel.js";
import { criarStaff } from "./modules/novosUsuarios.js";
import { sair } from "../auth/sair.js";

// -------- Proteção de rota --------
if (!(await estaLogado())) {
  window.location.replace("login.html");
  throw new Error("Usuário não logado");
}

if (!(await exigirPapel(["admin", "bibliotecario"]))) {
  window.location.replace("login.html");
  throw new Error("Papel não permitido");
}

// -------- Delegação de clicks (NAV + ações que NÃO são submit) --------
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-navigate]");
  if (nav) {
    e.preventDefault();
    navigate(nav.dataset.navigate);
    return;
  }

  const acao = e.target.closest("[data-action]");
  if (!acao) return;

  // Deixa o form cuidar dos submits — não prevenimos aqui
  if (acao.dataset.action === "criar-staff") return;
  if (acao.dataset.action === "cadastrar-livro") return;

  e.preventDefault();
  if (acao.dataset.action === "logout") sair();
  if (acao.dataset.action === "verificar-atraso") verificarAtraso();
  if (acao.dataset.action === "fechar-devolucao") fecharDevolucao();
});

// -------- Forms --------
document
  .getElementById("form-cadastrar")
  ?.addEventListener("submit", handleCadastroLivro);

document
  .getElementById("form-staff") // 👈 id DIFERENTE pro form de staff
  ?.addEventListener("submit", criarStaff);
