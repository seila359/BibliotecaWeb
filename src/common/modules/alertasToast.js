let _alertaTimer;

export function mostrarAlerta(mensagem, tipo) {
  const box = document.getElementById("alert-box");

  if (!box) return;

  box.textContent = mensagem;

  box.classList.toggle("alert-error", tipo === "erro");

  box.style.display = "block";

  clearTimeout(_alertaTimer);

  _alertaTimer = setTimeout(
    () => {
      box.style.display = "none";
    },
    tipo === "erro" ? 6000 : 3500,
  );
}