// Protecao do manual contra copia: sem download de videos e imagens, sem menu do botao direito, arrastar, salvar,
// imprimir ou ver o codigo; imagens ampliadas na propria pagina; marca d'agua com o usuario logado no sistema.
// Nenhuma pagina web impede uma captura de tela ou uma foto da tela: a marca d'agua identifica a origem da copia.
(function () {
  'use strict'

  // ---------- Bloqueios ----------
  document.addEventListener('contextmenu', function (e) { e.preventDefault() })
  document.addEventListener('dragstart', function (e) { e.preventDefault() })
  document.addEventListener('keydown', function (e) {
    var tecla = (e.key || '').toLowerCase()
    var ctrl = e.ctrlKey || e.metaKey
    if ((ctrl && (tecla === 's' || tecla === 'p' || tecla === 'u')) || (ctrl && e.shiftKey && (tecla === 'i' || tecla === 's'))) {
      e.preventDefault(); e.stopPropagation()
    }
    if (tecla === 'printscreen') ocultarMomentaneamente()
  }, true)
  document.addEventListener('keyup', function (e) {
    if ((e.key || '').toLowerCase() === 'printscreen') {
      ocultarMomentaneamente()
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('').catch(function () {})
    }
  }, true)
  // Ao sair da janela (ferramenta de recorte, troca de programa), o conteudo fica coberto.
  window.addEventListener('blur', function () { document.body.classList.add('manual-coberto') })
  window.addEventListener('focus', function () { document.body.classList.remove('manual-coberto') })

  function ocultarMomentaneamente() {
    document.body.classList.add('manual-coberto')
    setTimeout(function () { if (document.hasFocus()) document.body.classList.remove('manual-coberto') }, 1500)
  }

  function preparar() {
    // Videos: sem download, sem janela flutuante, sem transmitir.
    Array.prototype.forEach.call(document.querySelectorAll('video'), function (v) {
      v.setAttribute('controlslist', 'nodownload noremoteplayback noplaybackrate')
      v.setAttribute('disablepictureinpicture', '')
      v.setAttribute('disableremoteplayback', '')
    })

    // Imagens: sem link para o arquivo; clique amplia na propria pagina.
    var ampliada = document.createElement('div')
    ampliada.className = 'manual-ampliada'
    ampliada.hidden = true
    ampliada.setAttribute('role', 'dialog')
    ampliada.setAttribute('aria-label', 'Imagem ampliada. Clique ou tecle Esc para fechar.')
    var imagemAmpliada = document.createElement('img')
    imagemAmpliada.alt = ''
    ampliada.appendChild(imagemAmpliada)
    document.body.appendChild(ampliada)
    ampliada.addEventListener('click', function () { ampliada.hidden = true })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ampliada.hidden = true })

    Array.prototype.forEach.call(document.querySelectorAll('figure img'), function (img) {
      img.setAttribute('draggable', 'false')
      img.addEventListener('click', function () {
        imagemAmpliada.src = img.currentSrc || img.src
        imagemAmpliada.alt = img.alt
        ampliada.hidden = false
      })
    })

    marcaDagua()
  }

  // ---------- Marca d'agua ----------
  function marcaDagua() {
    var camada = document.createElement('div')
    camada.className = 'manual-marca'
    camada.setAttribute('aria-hidden', 'true')
    document.body.appendChild(camada)

    function preencher(texto) {
      camada.textContent = ''
      for (var i = 0; i < 60; i++) {
        var item = document.createElement('span')
        item.textContent = texto
        camada.appendChild(item)
      }
    }

    var hoje = new Date().toLocaleDateString('pt-BR')
    preencher('WebRural · uso interno · ' + hoje)
    // Dentro do sistema: identifica quem esta vendo.
    fetch('/api/auth/sessao', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null })
      .then(function (s) { if (s && s.login) preencher(s.nome + ' · ' + s.login + ' · ' + (s.empresaNome || '') + ' · ' + hoje) })
      .catch(function () {})
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', preparar)
  else preparar()
})()
