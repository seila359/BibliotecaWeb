/* ==========================================================
   catalogo.js — busca e detalhes de livros (Supabase)
   Substitui o antigo array "bancoLivros" por dados reais da
   view public.livros_cadastrados.

   Uso (na entrada de cada página):
     import { iniciarCatalogo } from ".../catalogo.js";
     iniciarCatalogo();
   ========================================================== */

import { db } from "../../config.js";
import { esc, plural, dataHoraBR, normalizar, mostrarAlerta} from "../../common/common.js";

let bancoLivros = []; // livros carregados do Supabase (filtro é feito no cliente)

const SELETOR_FILTROS = ".filter-card .form-input, .filter-card .form-select";

/* ---------- Inicialização ---------- */

export async function iniciarCatalogo() {
  document.body.classList.remove("carregando");

  document
    .querySelectorAll(SELETOR_FILTROS)
    .forEach((el) => el.addEventListener("input", aplicarFiltros));

  document.addEventListener("click", tratarCliques);

  await carregarLivros();
}

export async function carregarLivros() {
  const grid = document.getElementById("bookGrid");
  grid.innerHTML = '<p class="vazio">Carregando...</p>';

  // "livros_cadastrados" já filtra pela RLS e traz "disponivel" pronto
  const { data, error } = await db
    .from("livros_cadastrados")
    .select("*")
    .order("titulo");

  if (error) {
    grid.innerHTML =
      '<p class="vazio">Não foi possível carregar o catálogo.</p>';
    return mostrarAlerta("Erro ao carregar catálogo: " + error.message, "erro");
  }

  bancoLivros = data;
  popularCategorias(data);
  renderizarLivros(bancoLivros);
}

// Preenche o <select> de categorias com os valores realmente cadastrados
export function popularCategorias(livros) {
  const select = document.getElementById("filter-categoria");
  const atual = select.value;

  const categorias = [
    ...new Set(livros.map((l) => l.categoria).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  select.innerHTML =
    '<option value="">Todas as categorias</option>' +
    categorias
      .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`)
      .join("");

  select.value = atual;
}

//

export function tratarCliques(ev) {
  if (!ev || !ev.target) return;

  const detalhes = ev.target.closest('[data-action="detalhes"]');
  if (detalhes) return abrirModal(detalhes.dataset.id);

  const btn = ev.target.closest("[data-action]");
  switch (btn?.dataset.action) {
    case "limpar-filtros":
      limparFiltros();
      break;
    case "fechar-modal":
      fecharModal();
      break;
  }

  // Clique no fundo escuro fecha o modal
  if (ev.target.id === "bookModal") fecharModal();
}

/* ---------- Filtros (client-side, sobre os dados já carregados) ---------- */

export function aplicarFiltros() {
  const titulo = normalizar(document.getElementById("filter-titulo").value);
  const autor = normalizar(document.getElementById("filter-autor").value);
  const isbn = normalizar(document.getElementById("filter-isbn").value);
  const editora = normalizar(document.getElementById("filter-editora").value);
  const ano = document.getElementById("filter-ano").value;
  const categoria = document.getElementById("filter-categoria").value;
  const descricao = normalizar(
    document.getElementById("filter-descricao").value,
  );
  const disponivel = document.getElementById("filter-disponivel").value;

  const resultados = bancoLivros.filter((livro) => {
    const matchTitulo = normalizar(livro.titulo).includes(titulo);
    const matchAutor = normalizar(livro.autor).includes(autor);
    const matchIsbn = normalizar(livro.isbn).includes(isbn);
    const matchEditora = normalizar(livro.editora).includes(editora);
    const matchAno = !ano || String(livro.ano_publicacao) === ano;
    const matchCategoria = !categoria || livro.categoria === categoria;
    const matchDescricao = normalizar(livro.descricao).includes(descricao);

    let matchDisponivel = true;
    if (disponivel === "disponivel")
      matchDisponivel = livro.quantidade_disponivel > 0;
    if (disponivel === "indisponivel")
      matchDisponivel = livro.quantidade_disponivel === 0;

    return (
      matchTitulo &&
      matchAutor &&
      matchIsbn &&
      matchEditora &&
      matchAno &&
      matchCategoria &&
      matchDescricao &&
      matchDisponivel
    );
  });

  renderizarLivros(resultados);
}

export function limparFiltros() {
  document.querySelectorAll(SELETOR_FILTROS).forEach((el) => {
    el.value = "";
  });
  renderizarLivros(bancoLivros);
}

/* ---------- Renderização do grid ---------- */

// Emoji de capa quando o livro não tem capa_url cadastrada
const EMOJI_POR_INDICE = ["📕", "📘", "📗", "📙", "📓"];

export function renderizarLivros(livros) {
  const grid = document.getElementById("bookGrid");
  const countLabel = document.getElementById("results-count");

  countLabel.innerText = `Exibindo ${plural(livros.length, "livro", "livros")} de ${bancoLivros.length}`;
  grid.innerHTML = "";

  if (livros.length === 0) {
    grid.innerHTML = `
            <div class="no-results">
                <h3>Nenhum livro encontrado</h3>
                <p style="margin-top: 8px;">Tente ajustar os parâmetros de busca no painel de filtros.</p>
            </div>
        `;
    return;
  }

  livros.forEach((livro, i) => {
    const isDisponivel = livro.quantidade_disponivel > 0;
    const badgeClass = isDisponivel ? "badge-success" : "badge-danger";
    const badgeText = isDisponivel
      ? `${livro.quantidade_disponivel} Disp.`
      : "Esgotado";
    const emoji = EMOJI_POR_INDICE[i % EMOJI_POR_INDICE.length];

    const card = document.createElement("article");
    card.className = "book";
    card.innerHTML = `
            <div>
                <div class="book-cover">
                    ${livro.capa_url ? `<img src="${esc(livro.capa_url)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : emoji}
                    <span class="badge ${badgeClass} book-cover-badge">${esc(badgeText)}</span>
                </div>
                <div class="book-info">
                    <div>
                        ${livro.categoria ? `<span class="badge badge-category" style="margin-bottom: 8px;">${esc(livro.categoria)}</span>` : ""}
                        <h3>${esc(livro.titulo)}</h3>
                        <div class="book-author">${esc(livro.autor)}</div>
                        <div class="book-meta">
                            <strong>Editora:</strong> ${esc(livro.editora ?? "—")} ${livro.ano_publicacao ? `(${esc(livro.ano_publicacao)})` : ""}<br>
                            <strong>ISBN:</strong> ${esc(livro.isbn ?? "—")}
                        </div>
                        ${livro.descricao ? `<p class="book-description-snippet">${esc(livro.descricao)}</p>` : ""}
                    </div>
                </div>
            </div>
            <div style="padding: 0 18px 18px 18px;">
                <button class="button button-outline" style="width: 100%;" data-action="detalhes" data-id="${esc(livro.id)}">
                    Ver Todos Detalhes
                </button>
            </div>
        `;
    grid.appendChild(card);
  });
}

/* ---------- Modal de detalhes ---------- */

export function abrirModal(id) {
  const livro = bancoLivros.find((l) => l.id === id);
  if (!livro) return;

  document.getElementById("modal-title").innerText = livro.titulo;

  document.getElementById("modal-body-content").innerHTML = `
        <div class="detail-row">
            <div class="detail-label">ID (UUID):</div>
            <div class="detail-value"><code>${esc(livro.id)}</code></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Título:</div>
            <div class="detail-value"><strong>${esc(livro.titulo)}</strong></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Autor:</div>
            <div class="detail-value">${esc(livro.autor)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">ISBN:</div>
            <div class="detail-value">${esc(livro.isbn ?? "—")}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Editora:</div>
            <div class="detail-value">${esc(livro.editora ?? "—")}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Ano de Publicação:</div>
            <div class="detail-value">${esc(livro.ano_publicacao ?? "—")}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Categoria:</div>
            <div class="detail-value">${livro.categoria ? `<span class="badge badge-category">${esc(livro.categoria)}</span>` : "—"}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Estoque Total:</div>
            <div class="detail-value">${plural(livro.quantidade_total, "exemplar", "exemplares")}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Estoque Disponível:</div>
            <div class="detail-value">
                <span class="badge ${livro.quantidade_disponivel > 0 ? "badge-success" : "badge-danger"}">
                    ${plural(livro.quantidade_disponivel, "disponível", "disponíveis")}
                </span>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Descrição Completa:</div>
            <div class="detail-value" style="line-height: 1.6;">${esc(livro.descricao ?? "—")}</div>
        </div>
        <div class="detail-row" style="border-bottom: none;">
            <div class="detail-label">Cadastrado em:</div>
            <div class="detail-value">${dataHoraBR(livro.created_at)}</div>
        </div>
    `;

  document.getElementById("bookModal").classList.add("active");
}

export function fecharModal() {
  document.getElementById("bookModal").classList.remove("active");
}