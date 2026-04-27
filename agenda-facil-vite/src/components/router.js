import { renderDashboard }    from '../pages/dashboard.js'
import { renderCalendar }     from '../pages/calendar.js'
import { renderAppointments } from '../pages/appointments.js'
import { renderServices }     from '../pages/services.js'
import { renderClients }      from '../pages/clients.js'
import { renderSettings }     from '../pages/settings.js'

export let currentPage = 'dashboard'

const PAGE_RENDERERS = {
  dashboard:    renderDashboard,
  calendar:     renderCalendar,
  appointments: renderAppointments,
  services:     renderServices,
  clients:      renderClients,
  settings:     renderSettings,
}

export function navigate(page) {
  currentPage = page

  // swap active page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.getElementById('page-' + page)?.classList.add('active')

  // highlight nav link
  document.querySelectorAll('nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page)
  })

  closeSidebar()

  // call the page renderer
  PAGE_RENDERERS[page]?.()
}

export function initRouter() {
  // nav link clicks
  document.querySelectorAll('nav a[data-page]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      navigate(a.dataset.page)
    })
  })
}

// ─── Sidebar mobile ───────────────────────────────────────────
export function openSidebar() {
  document.getElementById('sidebar').classList.add('open')
  document.getElementById('sidebar-overlay').classList.add('open')
}

export function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open')
  document.getElementById('sidebar-overlay').classList.remove('open')
}
