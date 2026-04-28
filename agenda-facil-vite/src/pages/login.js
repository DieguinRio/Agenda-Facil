import { toast } from '../lib/helpers.js'

export function initLogin({ onSuccess } = {}) {
  document.getElementById('login-btn')?.addEventListener('click',      () => doLogin(onSuccess))
  document.getElementById('login-demo-btn')?.addEventListener('click', () => doLogin(onSuccess))
  document.getElementById('login-pass')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin(onSuccess)
  })
}

function doLogin(onSuccess) {
  const email = document.getElementById('login-email').value.trim()
  const pass  = document.getElementById('login-pass').value
  if (!email || !pass) { toast('Preencha e-mail e senha.', 'error'); return }

  const screen = document.getElementById('login-screen')
  screen.style.opacity = '0'
  setTimeout(() => {
    screen.classList.add('hidden')
    onSuccess?.()
  }, 300)
}