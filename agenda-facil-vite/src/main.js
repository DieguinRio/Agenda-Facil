// ── Styles ────────────────────────────────────────────────────
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/calendar.css'

// ── Lib ───────────────────────────────────────────────────────
import { seedDemo }                          from './seed.js'
import { updateSidebarProfile, initSidebar } from './components/sidebar.js'
import { initRouter, navigate, openSidebar, closeSidebar } from './components/router.js'
import { initLogin }                         from './pages/login.js'
import { openOnboarding, shouldShowOnboarding } from './pages/onboarding.js'
import { initTheme }                         from './pages/theme.js'
import { renderBadge, clearBadge }           from './lib/badge.js'

// ── Expose navigate globally (used by 404 inline button) ──────
window._navigate = navigate

// ── Bootstrap ────────────────────────────────────────────────
seedDemo()
initTheme()
initRouter()
initSidebar()
updateSidebarProfile()
renderBadge()

// ── Login → onboarding or dashboard ──────────────────────────
initLogin({
  onSuccess() {
    updateSidebarProfile()
    if (shouldShowOnboarding()) {
      openOnboarding()
    } else {
      navigate('dashboard')
    }
  }
})

// ── Clear badge when appointments page is visited ─────────────
document.querySelector('[data-page="appointments"]')?.addEventListener('click', () => {
  clearBadge()
})

// ── Mobile sidebar ────────────────────────────────────────────
document.getElementById('burger')?.addEventListener('click', openSidebar)
document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar)