async function fazerLogin(e) {
  e.preventDefault();

  const login = document.getElementById("user-login").value.trim();
  const senha = document.getElementById("user-pass").value;

  if (!login || !senha) {
    mostrarAlerta("Preencha e-mail e senha.", "erro");
    return;
  }

  // Login REAL pelo Supabase Auth
  const { data, error } = await db.auth.signInWithPassword({
    email: login,
    password: senha,
  });

  if (error) {
    console.error("Erro no login:", error);

    mostrarAlerta("E-mail ou senha inválidos.", "erro");

    return;
  }

  console.log("Login realizado:", data.user);

  mostrarAlerta("Login realizado com sucesso!", "sucesso");

  await redirecionarPorPapel(data.user.id);
}