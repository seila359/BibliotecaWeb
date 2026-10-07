import { showToast } from "./toast.js";
import { navigate } from "../../common/modules/navigate.js";

export function registrarMulta() {
  showToast("Multa registrada no sistema (Tabela perfis/financeiro).", "info");
}

export function liberarExemplar() {
  showToast(
    "Exemplar liberado fisicamente. Pronto para retornar à estante.",
    "info",
  );
}

export function atualizarStatusDevolucao() {
  showToast(
    'Status atualizado! Tabela "emprestimos" e "livros" sincronizadas.',
    "success",
  );
  limparDevolucao();
}

export function fecharDevolucao() {
  limparDevolucao();
  navigate("view-dashboard");
}

export function limparDevolucao() {
  document.getElementById("codigo-emprestimo").value = "";
  document.getElementById("resultado-devolucao").style.display = "none";
}

const acoesDevolucao = {
  "registrar-multa": registrarMulta,
  "liberar-exemplar": liberarExemplar,
  "atualizar-status": atualizarStatusDevolucao,
};

export function ligarAcoes(container) {
  container.querySelectorAll("[data-acao]").forEach((btn) => {
    btn.addEventListener("click", acoesDevolucao[btn.dataset.acao]);
  });
}

export function verificarAtraso() {
  const codigo = document.getElementById("codigo-emprestimo").value.trim();

  if (!codigo) {
    showToast("Por favor, digite ou escaneie um código válido.", "error");
    return;
  }

  document.getElementById("resultado-devolucao").style.display = "block";

  const mockTitulos = [
    "Clean Code",
    "Design Patterns",
    "O Senhor dos Anéis",
    "1984",
  ];
  const tituloSorteado =
    mockTitulos[Math.floor(Math.random() * mockTitulos.length)];
  const isLate = Math.random() > 0.5;

  const badge = document.getElementById("devolucao-badge");
  const detalhes = document.getElementById("devolucao-detalhes");
  const acoes = document.getElementById("devolucao-acoes");

  if (isLate) {
    const diasAtraso = Math.floor(Math.random() * 15) + 1;
    const valorMulta = (diasAtraso * 2.5).toFixed(2).replace(".", ",");

    badge.className = "status-badge badge-late";
    badge.innerText = "⚠️ Atrasado - Multa Pendente";

    detalhes.innerHTML = `
      <strong>Livro:</strong> ${tituloSorteado}<br>
      <strong>ID Empréstimo:</strong> ${codigo}<br>
      <strong>Dias de Atraso:</strong> ${diasAtraso} dias<br>
      <strong style="color: #e74c3c;">Valor da Multa: R$ ${valorMulta}</strong>
    `;

    acoes.innerHTML = `
      <button type="button" class="btn btn-danger" data-acao="registrar-multa">Registrar Multa</button>
      <button type="button" class="btn" data-acao="atualizar-status">Atualizar Status</button>
    `;

    showToast(
      `Empréstimo localizado. O exemplar está com ${diasAtraso} dias de atraso.`,
      "error",
    );
  } else {
    badge.className = "status-badge badge-ok";
    badge.innerText = "✅ Devolução no Prazo";

    detalhes.innerHTML = `
      <strong>Livro:</strong> ${tituloSorteado}<br>
      <strong>ID Empréstimo:</strong> ${codigo}<br>
      <span style="color: #27ae60;">O exemplar foi devolvido dentro da data limite estipulada.</span>
    `;

    acoes.innerHTML = `
      <button type="button" class="btn btn-success" data-acao="liberar-exemplar">Liberar Exemplar</button>
      <button type="button" class="btn" data-acao="atualizar-status">Atualizar Status</button>
    `;

    showToast("Empréstimo localizado. Devolução regular.", "success");
  }

  ligarAcoes(acoes);
}
