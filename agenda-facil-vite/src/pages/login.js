import { toast } from '../lib/helpers.js'
import { updateSidebarProfile } from '../components/sidebar.js'
import { navigate } from '../components/router.js'

export function initLogin() {
  document.getElementById('login-btn')?.addEventListener('click', doLogin)
  document.getElementById('login-demo-btn')?.addEventListener('click', doLogin)

  // allow Enter key on password field
  document.getElementById('login-pass')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin()
  })
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim()
  const pass  = document.getElementById('login-pass').value
  if (!email || !pass) { toast('Preencha e-mail e senha.', 'error'); return }

  // Demo: any credentials work
  const screen = document.getElementById('login-screen')
  screen.style.opacity = '0'
  setTimeout(() => {
    screen.classList.add('hidden')
    updateSidebarProfile()
    navigate('dashboard')
  }, 300)
}
