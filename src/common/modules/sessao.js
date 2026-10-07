export const Sessao = {
  CHAVE_MSG: "biblioteca_mensagem",

  // Guarda uma mensagem para ser exibida na próxima página
  guardarMensagem(texto, tipo) {
    sessionStorage.setItem(
      this.CHAVE_MSG,
      JSON.stringify({
        texto,
        tipo,
      }),
    );
  },

  // Exibe e apaga a mensagem guardada
  exibirMensagemGuardada() {
    const bruto = sessionStorage.getItem(this.CHAVE_MSG);

    if (!bruto) return;

    sessionStorage.removeItem(this.CHAVE_MSG);

    try {
      const { texto, tipo } = JSON.parse(bruto);

      mostrarAlerta(texto, tipo);
    } catch (e) {
      console.error("Erro ao ler mensagem guardada:", e);
    }
  },
};