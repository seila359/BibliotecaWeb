export function carregarUsuario(usuario) {
  if (!usuario) return;

  const iniciais = usuario.nome
    .split(" ")
    .filter((p) => p.length > 2)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  document.getElementById("avatar").innerText = iniciais;
  document.getElementById("perfil-nome").innerText = usuario.nome;
  document.getElementById("perfil-matricula").innerText = usuario.matricula;
  document.getElementById("perfil-categoria").innerText = usuario.categoria;
  document.getElementById("email").value = usuario.email;
  document.getElementById("telefone").value = usuario.telefone;
}

export function salvarPerfil(e, usuario) {
  e.preventDefault();

  usuario.email = document.getElementById("email").value;
  usuario.telefone = document.getElementById("telefone").value;
  Sessao.iniciar(usuario);

  mostrarAlerta("Seus dados foram atualizados com sucesso!");
}
