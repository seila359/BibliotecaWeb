/* ==========================================================
   catalogo.js — busca e detalhes de livros (Supabase)
   Substitui o antigo array "bancoLivros" por dados reais da
   view public.livros_cadastrados.

   Uso (na entrada de cada página):
     import { iniciarCatalogo } from ".../catalogo.js";
     iniciarCatalogo();
   ========================================================== */

import { iniciarCatalogo, aplicarFiltros } from "../painel/modules/catalogo.js";

await iniciarCatalogo();

// opcional: pré-preencher filtros via query string
const params = new URLSearchParams(location.search);
if (params.get("titulo")) {
  document.getElementById("filter-titulo").value = params.get("titulo");
  aplicarFiltros();
}
