/* ==========================================================
   painel.js — lógica do painel do leitor
   ========================================================== */

// Proteção: sem sessão, volta para o login
async function verificarUsuario() {
    const {
        data: { user },
        error
    } = await db.auth.getUser();

    if (error || !user) {
        window.location.replace('login.html');
        return null;
    }

    return user;
}

// Preenche os dados do usuário na tela
function carregarUsuario() {
    if (!usuario) return;

    const iniciais = usuario.nome
        .split(' ')
        .filter(p => p.length > 2)
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    document.getElementById('avatar').innerText = iniciais;
    document.getElementById('perfil-nome').innerText = usuario.nome;
    document.getElementById('perfil-matricula').innerText = usuario.matricula;
    document.getElementById('perfil-categoria').innerText = usuario.categoria;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefone').value = usuario.telefone;
}

// Alternar entre abas
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('nav a').forEach(nav => {
        nav.classList.remove('active');
    });

    const targetTab = document.getElementById('tab-' + tabName);
    const targetNav = document.getElementById('nav-' + tabName);

    if (targetTab) targetTab.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
}

// Simulação de renovação de livro
function renovarLivro(titulo, btn) {
    btn.innerText = 'Renovado com Sucesso!';
    btn.classList.add('button-disabled');
    btn.disabled = true;

    mostrarAlerta(`O empréstimo do livro "${titulo}" foi renovado por mais 14 dias!`);
}

// Salvar perfil
function salvarPerfil(e) {
    e.preventDefault();

    usuario.email = document.getElementById('email').value;
    usuario.telefone = document.getElementById('telefone').value;
    Sessao.iniciar(usuario);

    mostrarAlerta('Seus dados foram atualizados com sucesso!');
}

// Sair do sistema
async function sair() {
    const { error } = await db.auth.signOut();

    if (error) {
        console.error('Erro ao sair:', error);
        mostrarAlerta('Erro ao sair do sistema.', 'erro');
        return;
    }

    window.location.replace('login.html');
}

carregarUsuario();
Sessao.exibirMensagemGuardada();