import { db } from "../../config.js";
export async function solicitarEmprestimo(livroId) {
  console.log(
    `Solicitando empréstimo para o livro ID: ${livroId} \nTipo: ${typeof livroId}`,
  );

  const { data, error } = await db.rpc("solicitar_emprestimo", {
    p_livro_id: livroId,
    p_dias: 14, // opcional, padrão já é 14
    p_observacoes: null, // opcional
  });

  if (error) {
    alert(error.message);
    console.log("status HTTP:", error.code); // ex: "P0001"
    console.log("mensagem:", error.message); // a mensagem do RAISE
    console.log("detalhes:", error.details);
    console.log("hint:", error.hint);
  } else {
    console.log("Empréstimo criado:", data);
  }
}
