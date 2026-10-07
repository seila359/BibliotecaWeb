export function navigate(viewId) {
  const alvo = document.getElementById(viewId);
  if (!alvo) return; // evita esconder tudo se o id estiver errado

  document.querySelectorAll(".view").forEach((el) => {
    el.classList.toggle("active", el === alvo);
  });

  document.querySelectorAll("nav [data-navigate]").forEach((link) => {
    link.classList.toggle("active", link.dataset.navigate === viewId);
  });
}
