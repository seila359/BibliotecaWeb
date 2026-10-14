import { db } from "../../config.js";
import { showToast } from "./toast.js";
import { navigate } from "../../common/modules/navigate.js";

// Mesma taxa usada no banco (c_valor_dia dentro de registrar_devolucao).
// Serve só pra mostrar uma ESTIMATIVA antes da devolução -- o valor
// final de verdade é sempre calculado no servidor, na hora de devolver.
const VALOR_MULTA_POR_DIA = 1.0;

let emprestimoAtual = null; // guarda o registro carregado por verificarAtraso()

// ---------------------------------------------------------------------
// Busca o empréstimo pelo código informado e mostra o status na tela
// ---------------------------------------------------------------------
export async function verificarAtraso() {
  const codigo = document.getElementById("codigo-emprestimo").value.trim();

  if (!codigo) {
    showToast("Por favor, digite ou escaneie um código válido.", "error");
    return;
  }

  const { data: emprestimo, error } = await db
    .from("emprestimos_detalhados")
    .select("*")
    .eq("id", codigo)
    .maybeSingle();

  if (error) {
    showToast("Erro ao buscar empréstimo: " + error.message, "error");
    return;
  }

  if (!emprestimo) {
    showToast("Nenhum empréstimo encontrado com esse código.", "error");
    return;
  }

  if (emprestimo.status === "devolvido") {
    showToast(
      `Este empréstimo já foi devolvido em ${new Date(emprestimo.data_devolucao).toLocaleDateString("pt-BR")}.`,
      "info",
    );
    return;
  }

  emprestimoAtual = emprestimo;
  document.getElementById("resultado-devolucao").style.display = "block";

  const badge = document.getElementById("devolucao-badge");
  const detalhes = document.getElementById("devolucao-detalhes");
  const acoes = document.getElementById("devolucao-acoes");

  if (emprestimo.atrasado) {
    const diasAtraso = Math.floor(
      (Date.now() - new Date(emprestimo.data_prevista_devolucao)) / 86400000,
    );
    const valorEstimado = (diasAtraso * VALOR_MULTA_POR_DIA)
      .toFixed(2)
      .replace(".", ",");

    badge.className = "status-badge badge-late";
    badge.innerText = "⚠️ Atrasado - Multa Pendente";

    detalhes.innerHTML = `
      <strong>Livro:</strong> ${emprestimo.livro_titulo}<br>
      <strong>Leitor:</strong> ${emprestimo.usuario_nome}<br>
      <strong>ID Empréstimo:</strong> ${emprestimo.id}<br>
      <strong>Dias de Atraso (até agora):</strong> ${diasAtraso} dias<br>
      <strong style="color: #e74c3c;">Multa estimada: R$ ${valorEstimado}</strong>
      <br><small style="color:#999;">O valor final é calculado automaticamente ao confirmar a devolução.</small>
    `;

    // "Registrar Multa" não existe mais como ação separada: a multa é
    // criada automaticamente dentro de registrar_devolucao quando o
    // status muda para "devolvido". Só resta confirmar a devolução.
    acoes.innerHTML = `
      <button type="button" class="btn btn-danger" data-acao="atualizar-status">Confirmar Devolução e Gerar Multa</button>
    `;

    showToast(
      `Empréstimo localizado. O exemplar está com ${diasAtraso} dias de atraso.`,
      "error",
    );
  } else {
    badge.className = "status-badge badge-ok";
    badge.innerText = "✅ Devolução no Prazo";

    detalhes.innerHTML = `
      <strong>Livro:</strong> ${emprestimo.livro_titulo}<br>
      <strong>Leitor:</strong> ${emprestimo.usuario_nome}<br>
      <strong>ID Empréstimo:</strong> ${emprestimo.id}<br>
      <span style="color: #27ae60;">Dentro do prazo (até ${new Date(emprestimo.data_prevista_devolucao).toLocaleDateString("pt-BR")}).</span>
    `;

    acoes.innerHTML = `
      <button type="button" class="btn btn-success" data-acao="atualizar-status">Confirmar Devolução</button>
    `;

    showToast("Empréstimo localizado. Devolução regular.", "success");
  }

  ligarAcoes(acoes);
}

// ---------------------------------------------------------------------
// Confirma a devolução no banco (status, estoque e multa -- tudo numa
// chamada só, dentro de registrar_devolucao)
// ---------------------------------------------------------------------
export async function atualizarStatusDevolucao() {
  if (!emprestimoAtual) {
    showToast("Nenhum empréstimo carregado.", "error");
    return;
  }

  const { error } = await db.rpc("registrar_devolucao", {
    p_emprestimo_id: emprestimoAtual.id,
  });

  if (error) {
    showToast(error.message, "error");
    return;
  }

  showToast(
    emprestimoAtual.atrasado
      ? 'Devolução confirmada e multa gerada. Tabelas "emprestimos", "livros" e "multas" sincronizadas.'
      : 'Devolução confirmada. Tabelas "emprestimos" e "livros" sincronizadas.',
    "success",
  );

  limparDevolucao();
}

// ---------------------------------------------------------------------
// Ação puramente física (não mexe no banco) -- continua como estava
// ---------------------------------------------------------------------
export function liberarExemplar() {
  showToast(
    "Exemplar liberado fisicamente. Pronto para retornar à estante.",
    "info",
  );
}

export function fecharDevolucao() {
  limparDevolucao();
  navigate("view-dashboard");
}

export function limparDevolucao() {
  emprestimoAtual = null;
  document.getElementById("codigo-emprestimo").value = "";
  document.getElementById("resultado-devolucao").style.display = "none";
}

const acoesDevolucao = {
  "liberar-exemplar": liberarExemplar,
  "atualizar-status": atualizarStatusDevolucao,
};

export function ligarAcoes(container) {
  container.querySelectorAll("[data-acao]").forEach((btn) => {
    btn.addEventListener("click", acoesDevolucao[btn.dataset.acao]);
  });
}
