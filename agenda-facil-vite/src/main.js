// ── Styles ────────────────────────────────────────────────────
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/calendar.css'

// ── Lib ───────────────────────────────────────────────────────
import { seedDemo }           from './seed.js'
import { updateSidebarProfile } from './components/sidebar.js'
import { initSidebar }        from './components/sidebar.js'
import { initRouter, navigate } from './components/router.js'
import { initLogin }          from './pages/login.js'
import { openSidebar, closeSidebar } from './components/router.js'

// ── Bootstrap ────────────────────────────────────────────────
seedDemo()
initLogin()
initRouter()
initSidebar()
updateSidebarProfile()

// ── Mobile sidebar burger ─────────────────────────────────────
document.getElementById('burger')?.addEventListener('click', openSidebar)
document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar)
