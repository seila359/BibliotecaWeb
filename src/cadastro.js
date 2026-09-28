document.addEventListener("DOMContentLoaded", () => {

  const cadastroForm = document.getElementById("cadastro-form");
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("user-login");
  const passwordInput = document.getElementById("user-pass");
  const messageDiv = document.getElementById("message");
  const submitBtn = document.getElementById("btn-submit");
  const googleBtn = document.getElementById("btn-google");

  cadastroForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    messageDiv.textContent = "";
    messageDiv.className = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Cadastrando...";

    const nome = nomeInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await db.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      messageDiv.textContent = "Erro ao cadastrar: " + error.message;
      messageDiv.className = "error";
      submitBtn.disabled = false;
      submitBtn.textContent = "Cadastrar";
      return;
    }

    const authId = data.user.id;

    if (erroInsert) {
      messageDiv.textContent = "Erro ao salvar perfil: " + erroInsert.message;
      messageDiv.className = "error";
      submitBtn.disabled = false;
      submitBtn.textContent = "Cadastrar";
      return;
    }

    messageDiv.textContent =
      "Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.";
    messageDiv.className = "success";
    submitBtn.disabled = false;
    submitBtn.textContent = "Cadastrar";

    cadastroForm.reset();
  })

  googleBtn.addEventListener("click", async ()=>{

    googleBtn.disabled = true;

    const{data, error} = await db.auth.signInWithOAuth({
      provider: "google",
      options:{
        redirectTo: 'http://localhost:5500/html/painel.html'
      }
    })

    if (error) {
      messageDiv.textContent = "Erro ao conectar com Google: " + error.message;
      messageDiv.className = "error";
      googleBtn.disabled = false;
    }

  })
  
});