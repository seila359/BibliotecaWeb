import { db } from "../../config.js";

// ---------------------------------------------------------------------
// Carrega o histórico do leitor logado e popula a tabela
// Chame carregarHistorico() ao entrar em view-tab-historico
// (igual fizemos com carregarSolicitacoes em admin.js)
// ---------------------------------------------------------------------
export async function carregarHistorico() {
  const tbody = document.getElementById("lista-historico");
  tbody.innerHTML = `<tr><td colspan="5" style="padding:12px; color:#666;">Carregando...</td></tr>`;

  const { data, error } = await db.rpc("meu_historico");

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:12px; color:#c0392b;">Erro ao carregar: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:12px; color:#666;">Você ainda não tem empréstimos devolvidos.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  data.forEach((item) => {
    tbody.appendChild(criarLinhaHistorico(item));
  });
}

function criarLinhaHistorico(item) {
  const tr = document.createElement("tr");

  const dataDevolucao = new Date(item.data_devolucao).toLocaleDateString(
    "pt-BR",
  );

  const statusBadge = item.teve_atraso
    ? `<span class="badge badge-warning">Devolvido c/ Atraso</span>`
    : `<span class="badge badge-success">Devolvido</span>`;

  const celulaMulta = montarCelulaMulta(item);

  tr.innerHTML = `
    <td><strong>${item.livro_titulo}</strong></td>
    <td>${item.livro_autor}</td>
    <td>${dataDevolucao}</td>
    <td>${statusBadge}</td>
    <td>${celulaMulta}</td>
  `;

  return tr;
}

function montarCelulaMulta(item) {
  if (!item.teve_atraso) {
    return "R$ 0,00";
  }

  const valorFormatado = Number(item.multa_valor).toFixed(2).replace(".", ",");

  if (item.multa_status === "paga") {
    return `<span class="multa-paga">R$ ${valorFormatado} (Paga)</span>`;
  }
  if (item.multa_status === "cancelada") {
    return `<span>R$ ${valorFormatado} (Cancelada)</span>`;
  }
  // pendente
  return `<span class="multa-pendente">R$ ${valorFormatado} (Pendente)</span>`;
}
