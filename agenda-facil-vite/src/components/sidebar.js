import { getAppts, getClients, getSettings } from '../lib/db.js'
import { todayStr } from '../lib/helpers.js'
import { openPublicPage } from '../pages/public.js'

export function updateSidebarProfile() {
  const s = getSettings()
  const initials = (s.bizName || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  document.getElementById('sb-avatar').textContent = initials
  document.getElementById('sb-biz-name').textContent = s.bizName || 'Meu Negócio'
  document.getElementById('sb-biz-type').textContent = s.bizType || ''
  updateSidebarStatus()
}

export function updateSidebarStatus() {
  const appts = getAppts()
  const today = todayStr()
  const todayAppts = appts
    .filter(a => a.date === today && a.status === 'scheduled')
    .sort((a, b) => a.time.localeCompare(b.time))

  const el = document.getElementById('sb-status-text')
  if (todayAppts.length === 0) {
    el.innerHTML = '<strong>Dia livre</strong>Nenhum agendamento hoje'
  } else {
    const next = todayAppts[0]
    el.innerHTML = `<strong>${todayAppts.length} agend. hoje</strong>Próx: ${next.client_name.split(' ')[0]} às ${next.time}`
  }
}

export function initSidebar() {
  document.getElementById('sb-pub-link-btn')?.addEventListener('click', openPublicPage)
}
