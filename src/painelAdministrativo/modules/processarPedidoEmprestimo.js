import { db } from "../../config.js";

// ---------------------------------------------------------------------
// Estado local
// ---------------------------------------------------------------------
let solicitacaoAtual = null; // id da solicitação em processo de recusa

// ---------------------------------------------------------------------
// Carrega as solicitações pendentes e popula a tabela
// Chame carregarSolicitacoes() quando a view for aberta
// (ex: no seu handler de data-navigate="view-processar-emprestimo")
// ---------------------------------------------------------------------
export async function carregarSolicitacoes() {
  const tbody = document.getElementById("lista-solicitacoes");
  tbody.innerHTML = `<tr><td colspan="6" style="padding:12px; color:#666;">Carregando...</td></tr>`;

  const { data, error } = await db
    .from("solicitacoes_detalhadas")
    .select("*")
    .eq("status", "pendente");

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:12px; color:#c0392b;">Erro ao carregar: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:12px; color:#666;">Nenhuma solicitação pendente.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  data.forEach((solicitacao) => {
    tbody.appendChild(criarLinhaSolicitacao(solicitacao));
  });
}

function criarLinhaSolicitacao(solicitacao) {
  const tr = document.createElement("tr");
  tr.style.borderBottom = "1px solid #eee";
  tr.dataset.id = solicitacao.id;

  const dataFormatada = new Date(
    solicitacao.data_solicitacao,
  ).toLocaleDateString("pt-BR");

  tr.innerHTML = `
    <td style="padding: 12px">
      <div>${solicitacao.usuario_nome}</div>
      <div style="font-size: 12px; color: #666">${solicitacao.usuario_email}</div>
    </td>
    <td style="padding: 12px">
      <div>${solicitacao.livro_titulo}</div>
      <div style="font-size: 12px; color: #666">${solicitacao.livro_autor}</div>
    </td>
    <td style="padding: 12px">${solicitacao.dias_solicitados}</td>
    <td style="padding: 12px">${dataFormatada}</td>
    <td style="padding: 12px; font-size: 12px; color: #666">${solicitacao.observacoes ?? "—"}</td>
    <td style="padding: 12px; text-align: center; display: flex; gap: 8px; justify-content: center">
      <button
        class="btn btn-aprovar"
        style="background-color: #27ae60; padding: 6px 12px; font-size: 12px; color: white; border: none; border-radius: 4px;"
      >
        Aprovar
      </button>
      <button
        class="btn btn-recusar"
        style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; font-size: 12px; border-radius: 4px;"
      >
        Recusar
      </button>
    </td>
  `;

  tr.querySelector(".btn-aprovar").addEventListener("click", (e) =>
    aprovar_solicitacao(solicitacao.id, e.target),
  );
  tr.querySelector(".btn-recusar").addEventListener("click", () =>
    mostrar_modal_recusa(solicitacao.id),
  );

  return tr;
}

// ---------------------------------------------------------------------
// Aprovar
// ---------------------------------------------------------------------
async function aprovar_solicitacao(id, botao) {
  botao.disabled = true;
  botao.textContent = "Aprovando...";

  const { error } = await db.rpc("aprovar_solicitacao", {
    p_solicitacao_id: id,
  });

  if (error) {
    // mensagens como "Livro sem exemplares disponíveis." ou
    // "O usuário já possui 5 empréstimos ativos/atrasados" vêm prontas
    // do banco, em português
    alert(error.message);
    botao.disabled = false;
    botao.textContent = "Aprovar";
    return;
  }

  alert("Solicitação aprovada com sucesso! Empréstimo criado.");
  carregarSolicitacoes();
}

// ---------------------------------------------------------------------
// Recusar (abre o formulário de motivo)
// ---------------------------------------------------------------------
function mostrar_modal_recusa(id) {
  solicitacaoAtual = id;
  document.getElementById("id-recusa-atual").innerText = id;
  document.getElementById("motivo_rejeicao").value = "";
  document.getElementById("area-recusa").style.display = "block";
}

function cancelar_recusa() {
  solicitacaoAtual = null;
  document.getElementById("area-recusa").style.display = "none";
}

async function confirmar_recusa() {
  const motivo = document.getElementById("motivo_rejeicao").value.trim();
  if (!motivo) {
    alert("Por favor, preencha o motivo da rejeição.");
    return;
  }

  const btnConfirmar = document.querySelector(
    '#area-recusa button[onclick="confirmar_recusa()"]',
  );
  if (btnConfirmar) btnConfirmar.disabled = true;

  const { error } = await db.rpc("rejeitar_solicitacao", {
    p_solicitacao_id: solicitacaoAtual,
    p_motivo: motivo,
  });

  if (btnConfirmar) btnConfirmar.disabled = false;

  if (error) {
    alert(error.message);
    return;
  }

  alert("Solicitação recusada.");
  cancelar_recusa();
  carregarSolicitacoes();
}

// ---------------------------------------------------------------------
// Expondo no escopo global, já que o HTML chama via onclick="..."
// Se preferir, troque os onclick do HTML por addEventListener e
// remova este bloco.
// ---------------------------------------------------------------------
window.mostrar_modal_recusa = mostrar_modal_recusa;
window.cancelar_recusa = cancelar_recusa;
window.confirmar_recusa = confirmar_recusa;
