import { plural } from "../../common/common.js";
import { db } from "../../config.js";
import { mostrarAlerta } from "../../common/common.js";

let listaBancoEmprestimos = [];

const ELEMENTOS = {
  grid: "bookGridEmprestimosAtivos",
  contador: "results-count-emprestimos",
};

/**
 * Inicializa a seção de empréstimos ativos.
 */
export async function iniciarEmprestimosAtivos() {
  await carregarEmprestimos();
}

/**
 * Busca os empréstimos ativos do usuário autenticado.
 */
export async function carregarEmprestimos() {
  const grid = document.getElementById(ELEMENTOS.grid);

  if (!grid) {
    console.error("Elemento da lista de empréstimos não encontrado.");
    return;
  }

  grid.innerHTML = '<p class="vazio">Carregando...</p>';

  const { data, error } = await db.rpc("meus_emprestimos_ativos");

  if (error) {
    console.error("Erro ao carregar empréstimos:", error);

    grid.innerHTML =
      '<p class="vazio">Não foi possível carregar seus empréstimos.</p>';

    return;
  }

  listaBancoEmprestimos = data ?? [];

  renderizarEmprestimos(listaBancoEmprestimos);
}

/**
 * Verifica se a data prevista já passou.
 */
function estaAtrasado(dataPrevista) {
  if (!dataPrevista) return false;

  const data = new Date(dataPrevista);

  if (Number.isNaN(data.getTime())) return false;

  return data.getTime() < Date.now();
}

/**
 * Formata uma data para exibição.
 */
function formatarData(data) {
  if (!data) return "Não informada";

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "Não informada";
  }

  return dataConvertida.toLocaleDateString("pt-BR");
}

/**
 * Renderiza os empréstimos na tela.
 */
function renderizarEmprestimos(emprestimos) {
  const grid = document.getElementById(ELEMENTOS.grid);
  const contador = document.getElementById(ELEMENTOS.contador);

  if (!grid) return;

  const total = emprestimos.length;

  if (contador) {
    contador.textContent = `Total: ${plural(total, "livro", "livros")}`;
  }

  if (total === 0) {
    grid.innerHTML = '<p class="vazio">Você não possui empréstimos ativos.</p>';
    return;
  }

  const cardsHTML = emprestimos
    .map((item) => {
      const atrasado =
        item.status === "ativo" && estaAtrasado(item.data_prevista_devolucao);

      const capaCor = item.capaCor || "azul";

      const classeData = atrasado ? "data-atraso" : "data-ok";
      const classeBadge = atrasado ? "badge-danger" : "badge-success";
      // Calculando dias de atraso se necessário (opcional, para igualar ao seu HTML estático)
      const textoBadge = atrasado ? "Atrasado" : "Em dia";

      const botaoHTML = atrasado
        ? `
        <button
          class="button button-disabled"
          disabled
          title="Livro em atraso não pode ser renovado online"
        >
          Renovação Indisponível
        </button>
      `
        : `
        <button
          class="button"
          data-action="renovar-livro"
          data-livro-id="${item.livro_id}"
          data-emprestimo-id="${item.id}"
          data-livro="${item.titulo ?? ""}"
        >
          Renovar Empréstimo
        </button>
      `;

      return `
      <article class="book">
        <div class="book-cover ${capaCor}">📕 Livro</div>

        <div class="book-info">
          <div>
            <h3>${item.titulo ?? "Título não informado"}</h3>
            <p>${item.autor ?? "Autor não informado"}</p>

            <div class="loan-dates">
              <div>
                <strong>Retirada:</strong>
                ${formatarData(item.dataRetirada ?? item.data_emprestimo)}
              </div>

              <div>
                <strong>Devolução:</strong>
                <span class="${classeData}">
                  ${formatarData(item.dataDevolucao ?? item.data_prevista_devolucao)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <span class="badge ${classeBadge}">
              ${textoBadge}
            </span>

            ${botaoHTML}
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  // Substitui todo o conteúdo do grid apenas pelos cartões gerados
  grid.innerHTML = cardsHTML;
}
