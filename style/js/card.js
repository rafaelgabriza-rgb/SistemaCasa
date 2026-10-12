(() => {
  "use strict";

  const chave = document.getElementById("chave-tela");
  const botao = document.getElementById("chave-toque");
  const titulo = document.getElementById("chave-titulo");
  const subtitulo = document.getElementById("chave-subtitulo");
  const instrucao = document.getElementById("chave-instrucao");
  const status = document.getElementById("chave-status");
  let temporizadorFechamento;
  let lendo = false;

  botao.addEventListener("click", () => {
    if (lendo) return;
    clearTimeout(temporizadorFechamento);
    if (chave.dataset.estado === "liberada") {
      chave.dataset.estado = "pronta";
      titulo.textContent = "Casa do Rafael";
      subtitulo.textContent = "A porta foi trancada novamente.";
      instrucao.textContent = "Toque na tela para aproximar do leitor";
      status.textContent = "Porta trancada · chave pronta";
      return;
    }
    lendo = true;
    chave.dataset.estado = "lendo";
    titulo.textContent = "Lendo credencial…";
    subtitulo.textContent = "Encostando a chave digital no leitor NFC.";
    instrucao.textContent = "Aguarde a validação do acesso";
    status.textContent = "Verificando chave digital";

    window.setTimeout(() => {
      chave.dataset.estado = "liberada";
      titulo.textContent = "Acesso liberado";
      subtitulo.textContent = "Olá, Rafael. A porta está destrancada.";
      instrucao.textContent = "Toque novamente para trancar a porta";
      status.textContent = "Porta destrancada · toque para trancar";
      lendo = false;

      temporizadorFechamento = window.setTimeout(() => {
        chave.dataset.estado = "pronta";
        titulo.textContent = "Casa do Rafael";
        subtitulo.textContent = "A chave da sua casa está pronta.";
        instrucao.textContent = "Toque na tela para aproximar do leitor";
        status.textContent = "Pronta para usar";
      }, 4500);
    }, 1100);
  });
})();
