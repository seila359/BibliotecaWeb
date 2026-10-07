import { db } from "../config.js"; 
import { mostrarAlerta } from "../common/common.js"

async function redirecionarPorPapel(userId) { 
  const { data, error } = await db 
    .from("profiles") 
    .select("papel") 
    .eq("id", userId) 
    .single(); 

  if (error || !data) { 
    console.error("Erro ao ler perfil:", error); 
    mostrarAlerta("Login efetuado, mas perfil não encontrado.", "erro"); 
    return; 
  } 

  if (data.papel === "admin" || data.papel === "bibliotecario") { 
    window.location.replace("painelAdministrativo.html"); 
  } else { 
    window.location.replace("painel.html"); 
  } 
} 

// Se já estiver logado, redireciona direto
async function verificarSessao() { 
  const { 
    data: { session }, 
  } = await db.auth.getSession(); 

  if (session) { 
    await redirecionarPorPapel(session.user.id); 
  } 
} 

// Função de login
async function fazerLogin(e) { 
  e.preventDefault(); 

  const login = document.getElementById("user-login").value.trim(); 
  const senha = document.getElementById("user-pass").value; 

  if (!login || !senha) { 
    mostrarAlerta("Preencha e-mail e senha.", "erro"); 
    return; 
  } 

  const { data, error } = await db.auth.signInWithPassword({ 
    email: login, 
    password: senha, 
  }); 

  if (error) { 
    console.error("Erro no login:", error); 
    mostrarAlerta("E-mail ou senha inválidos.", "erro"); 
    return; 
  } 

  mostrarAlerta("Login realizado com sucesso!", "sucesso"); 
  await redirecionarPorPapel(data.user.id); 
} 

// Inicialização dos eventos ao carregar o script
verificarSessao(); 

const formLogin = document.getElementById("login-form"); 
if (formLogin) { 
  formLogin.addEventListener("submit", fazerLogin); 
}