export function handleCadastroLivro(e) {
  const form = document.getElementById("form-cadastrar");
  const mensagemDiv = document.getElementById("mensagem");
  const btnSalvar = document.getElementById("btnSalvar");

  function mostrarMensagem(texto, tipo) {
    mensagemDiv.textContent = texto;
    mensagemDiv.className = tipo;
    mensagemDiv.style.display = "block";
    setTimeout(() => {
      mensagemDiv.style.display = "none";
    }, 5000);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Agora isso vai funcionar e impedir a recarga da página!
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;

    // Capturando os dados
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const isbn = document.getElementById("isbn").value;
    const ano_publicacao = document.getElementById("ano").value;
    const quantidade_total = document.getElementById("quantidade").value;

    if (!titulo || !autor) {
      mostrarMensagem("Título e Autor são obrigatórios!", "erro");
      btnSalvar.textContent = "Salvar Livro";
      btnSalvar.disabled = false;
      return;
    }

    try {
      // CORREÇÃO: Usando db.from(...)
      const { data, error } = await db.from("livros").insert([
        {
          titulo: titulo,
          autor: autor,
          isbn: isbn || null,
          ano_publicacao: ano_publicacao ? parseInt(ano_publicacao) : null,
          quantidade_total: parseInt(quantidade_total),
        },
      ]);

      if (error) throw error;

      // Sucesso
      mostrarMensagem("Livro cadastrado com sucesso!", "sucesso");
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      if (error.code === "42501" || error.message.includes("RLS")) {
        mostrarMensagem(
          "Erro de Permissão (RLS). Você precisa estar logado como Admin ou desativar o RLS para testes.",
          "erro",
        );
      } else {
        mostrarMensagem("Erro ao cadastrar livro: " + error.message, "erro");
      }
    } finally {
      btnSalvar.textContent = "Salvar Livro";
      btnSalvar.disabled = false;
    }
  });
}
