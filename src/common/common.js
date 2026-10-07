/* ==========================================================
   SESSÃO
   ========================================================== */
  export {Sessao} from "./modules/sessao.js";

/* ==========================================================
   ALERTAS / TOAST
   ========================================================== */
  export { mostrarAlerta } from "./modules/alertasToast.js";


  
/* ==========================================================
   SEGURANÇA
   ========================================================== */

// Escapa texto vindo do banco antes de colocar em innerHTML.
// Ajuda a evitar XSS.
export { esc } from "./modules/esc.js";

/* ==========================================================
   FORMATAÇÃO
   ========================================================== */
export { dataBR, dataHoraBR, moeda, plural } from "./modules/formatacao.js";

/* ==========================================================
   BUSCA / TEXTO
   ========================================================== */

// Remove acentos para comparação.
// Exemplo:
// "São Paulo" -> "sao paulo"
export { normalizar } from "./modules/buscaTexto.js";

/* ==========================================================
   CAPA DO LIVRO
   ========================================================== */

// Usa a imagem cadastrada (capa_url)
// ou um emoji como alternativa visual.
//
// "classe" pode ser:
// "azul"
// "laranja"
export { capaHtml } from "./modules/capaHtml.js";
