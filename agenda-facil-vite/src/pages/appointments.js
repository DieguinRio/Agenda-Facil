// appointments.js
import { getAppts, saveAppts } from '../lib/db.js'
import { fmtDate, fmtMoney, toast } from '../lib/helpers.js'
import { openApptModal, changeStatus } from '../components/apptModal.js'
import { apptCardHTML, bindCardButtons } from './dashboard.js'

export function renderAppointments() {
  const el = document.getElementById('page-appointments')
  el.innerHTML = `
    <div class="row-between mb20">
      <h1 class="page-title">Agendamentos</h1>
      <button class="btn btn-primary" id="ap-new-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo
      </button>
    </div>
    <div class="row mb16" style="gap:10px">
      <div class="search-wrap" style="flex:1;min-width:200px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="appt-search" placeholder="Buscar cliente ou serviço…"/>
      </div>
      <select id="appt-filter" style="width:150px;flex-shrink:0">
        <option value="all">Todos</option>
        <option value="scheduled">Agendados</option>
        <option value="completed">Concluídos</option>
        <option value="cancelled">Cancelados</option>
      </select>
      <select id="appt-sort" style="width:150px;flex-shrink:0">
        <option value="date-desc">Mais recente</option>
        <option value="date-asc">Mais antigo</option>
      </select>
    </div>
    <div id="appt-list"></div>`

  document.getElementById('ap-new-btn').addEventListener('click', () => openApptModal())
  document.getElementById('appt-search').addEventListener('input', drawList)
  document.getElementById('appt-filter').addEventListener('change', drawList)
  document.getElementById('appt-sort').addEventListener('change', drawList)
  drawList()
}

function drawList() {
  const search = (document.getElementById('appt-search')?.value || '').toLowerCase()
  const filter = document.getElementById('appt-filter')?.value || 'all'
  const sort   = document.getElementById('appt-sort')?.value || 'date-desc'

  let appts = getAppts().filter(a => {
    const ms = (a.client_name || '').toLowerCase().includes(search) || (a.service_name || '').toLowerCase().includes(search)
    return ms && (filter === 'all' || a.status === filter)
  })
  appts.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    return sort === 'date-desc' ? -cmp : cmp
  })

  const el = document.getElementById('appt-list')
  if (!appts.length) {
    el.innerHTML = `<div class="empty"><p>Nenhum agendamento encontrado.</p></div>`
    return
  }
  el.innerHTML = `<div class="grid-cards">${appts.map(apptCardHTML).join('')}</div>`
  bindCardButtons(el)
}
