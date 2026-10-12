import { navigate } from "../common/modules/navigate.js";
import { verificarAtraso, fecharDevolucao } from "./modules/devolucao.js";
import { handleCadastroLivro } from "./modules/cadastroLivro.js";
import { estaLogado } from "../auth/checarSessao.js";
import { exigirPapel } from "../auth/exigirPapel.js";
import { criarStaff } from "./modules/novosUsuarios.js";
import { sair } from "../auth/sair.js";
import { carregarSolicitacoes } from "./modules/processarPedidoEmprestimo.js";

// -------- Proteção de rota --------
if (!(await estaLogado())) {
  window.location.replace("login.html");
  throw new Error("Usuário não logado");
}

if (!(await exigirPapel(["admin", "bibliotecario"]))) {
  window.location.replace("login.html");
  throw new Error("Papel não permitido");
}

// -------- Ações a executar ao entrar em cada view --------
// Centraliza aqui em vez de if/else soltos: fica fácil adicionar
// outras views que precisam carregar dados ao navegar pra elas.
const aoEntrarNaView = {
  "view-processar-emprestimo": carregarSolicitacoes,
  // "view-outra-coisa": carregarOutraCoisa,
};

// -------- Delegação de clicks (NAV + ações que NÃO são submit) --------
document.addEventListener("click", async (e) => {
  const nav = e.target.closest("[data-navigate]");
  if (nav) {
    e.preventDefault();

    const destino = nav.dataset.navigate;
    const carregar = aoEntrarNaView[destino];
    if (carregar) await carregar();

    navigate(destino);
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
