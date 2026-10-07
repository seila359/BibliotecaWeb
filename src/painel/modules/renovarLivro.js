export function renovarLivro(titulo, btn) {
  btn.innerText = "Renovado com Sucesso!";
  btn.classList.add("button-disabled");
  btn.disabled = true;

  mostrarAlerta(
    `O empréstimo do livro "${titulo}" foi renovado por mais 14 dias!`,
  );
}
