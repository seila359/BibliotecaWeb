/* ==========================================================
   common.js — utilitários compartilhados
   Ordem dos scripts:
   1) supabase-js (CDN)
   2) config.js
   3) common.js
   4) login.js / painel.js
   ========================================================== */


/* ==========================================================
   SUPABASE
   ========================================================== */

// "window.supabase" é a biblioteca carregada pelo CDN.
// O cliente fica em "db" para não conflitar com esse nome.
const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* ==========================================================
   SESSÃO
   ========================================================== */

const Sessao = {

    CHAVE: 'biblioteca_usuario',

    CHAVE_MSG: 'biblioteca_mensagem',


    // Retorna o usuário logado ou null
    obter() {
        try {
            return JSON.parse(
                sessionStorage.getItem(this.CHAVE)
            );
        } catch (e) {
            return null;
        }
    },


    // Verifica se existe usuário logado
    estaLogado() {
        return this.obter() !== null;
    },


    // Inicia a sessão
    iniciar(usuario) {
        sessionStorage.setItem(
            this.CHAVE,
            JSON.stringify(usuario)
        );
    },


    // Encerra a sessão
    encerrar() {
        sessionStorage.removeItem(this.CHAVE);
    },


    // Guarda uma mensagem para ser exibida na próxima página
    guardarMensagem(texto, tipo) {
        sessionStorage.setItem(
            this.CHAVE_MSG,
            JSON.stringify({
                texto,
                tipo
            })
        );
    },


    // Exibe e apaga a mensagem guardada
    exibirMensagemGuardada() {

        const bruto = sessionStorage.getItem(
            this.CHAVE_MSG
        );

        if (!bruto) return;

        sessionStorage.removeItem(
            this.CHAVE_MSG
        );

        try {

            const {
                texto,
                tipo
            } = JSON.parse(bruto);

            mostrarAlerta(texto, tipo);

        } catch (e) {

            console.error(
                'Erro ao ler mensagem guardada:',
                e
            );
        }
    }
};


/* ==========================================================
   ALERTAS / TOAST
   ========================================================== */

let _alertaTimer;

function mostrarAlerta(mensagem, tipo) {

    const box = document.getElementById('alert-box');

    if (!box) return;

    box.textContent = mensagem;

    box.classList.toggle(
        'alert-error',
        tipo === 'erro'
    );

    box.style.display = 'block';

    clearTimeout(_alertaTimer);

    _alertaTimer = setTimeout(() => {

        box.style.display = 'none';

    }, tipo === 'erro' ? 6000 : 3500);
}


/* ==========================================================
   SEGURANÇA
   ========================================================== */

// Escapa texto vindo do banco antes de colocar em innerHTML.
// Ajuda a evitar XSS.
function esc(valor) {

    return String(valor ?? '').replace(
        /[&<>"']/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c])
    );
}


/* ==========================================================
   FORMATAÇÃO
   ========================================================== */

// Data: 23/09/2026
const dataBR = iso =>
    new Date(iso).toLocaleDateString('pt-BR');


// Data + hora: 23/09/2026 10:30:00
const dataHoraBR = iso =>
    new Date(iso).toLocaleString('pt-BR');


// Moeda: R$ 50,00
const moeda = valor =>
    Number(valor).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );


// Singular/plural
const plural = (
    n,
    singular,
    pluralTxt
) => `${n} ${n === 1 ? singular : pluralTxt}`;


/* ==========================================================
   BUSCA / TEXTO
   ========================================================== */

// Remove acentos para comparação.
// Exemplo:
// "São Paulo" -> "sao paulo"
const normalizar = txt =>
    String(txt ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');


/* ==========================================================
   CAPA DO LIVRO
   ========================================================== */

// Usa a imagem cadastrada (capa_url)
// ou um emoji como alternativa visual.
//
// "classe" pode ser:
// "azul"
// "laranja"

function capaHtml(url, emoji, classe) {

    if (url) {

        return `
            <div class="book-cover">
                <img
                    src="${esc(url)}"
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                >
            </div>
        `;
    }

    return `
        <div class="book-cover ${classe}">
            ${emoji}
        </div>
    `;
}