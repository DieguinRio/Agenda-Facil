import { getAppts, getSvcs, getClients } from '../lib/db.js'
import { PT_MONTHS, PT_DAYS, todayStr, fmtDate, fmtMoney, icon, statCard } from '../lib/helpers.js'
import { openApptModal, changeStatus } from '../components/apptModal.js'

export function renderDashboard() {
  const now    = new Date()
  const today  = todayStr()
  const appts  = getAppts()
  const svcs   = getSvcs()
  const clients = getClients()
  const mn = now.getMonth(), yr = now.getFullYear()

  const todayAppts = appts.filter(a => a.date === today && a.status === 'scheduled')
    .sort((a, b) => a.time.localeCompare(b.time))
  const allScheduled    = appts.filter(a => a.status === 'scheduled').length
  const monthCompleted  = appts.filter(a => {
    const d = new Date(a.date + 'T00:00')
    return a.status === 'completed' && d.getMonth() === mn && d.getFullYear() === yr
  })
  const monthRevenue    = monthCompleted.reduce((s, a) => s + (a.price || 0), 0)
  const pendingRevenue  = appts.filter(a => a.status === 'scheduled').reduce((s, a) => s + (a.price || 0), 0)

  const el = document.getElementById('page-dashboard')
  el.innerHTML = `
    <div class="row-between mb28">
      <div>
        <h1 class="page-title">Painel</h1>
        <p class="page-sub">${PT_DAYS[now.getDay()]}, ${String(now.getDate()).padStart(2,'0')} de ${PT_MONTHS[now.getMonth()]} de ${now.getFullYear()}</p>
      </div>
      <button class="btn btn-primary" id="dash-new-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Agendamento
      </button>
    </div>

    <div class="grid-4 mb24">
      ${statCard('blue',  icon.clock(),  'Hoje',        todayAppts.length)}
      ${statCard('green', icon.trend(),  'Agendados',   allScheduled)}
      ${statCard('amber', icon.dollar(), 'Receita Mês', fmtMoney(monthRevenue))}
      ${statCard('muted', icon.users(),  'Clientes',    clients.length)}
    </div>

    <div id="dash-grid" style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h2 style="font-weight:700;font-size:15px;color:var(--fg)">Agendamentos de Hoje</h2>
          <button class="btn btn-ghost btn-sm" id="dash-view-all">Ver todos →</button>
        </div>
        <div id="dash-today-list">
          ${todayAppts.length === 0
            ? `<div class="empty">${icon.calEmpty()}<p>Nenhum agendamento para hoje.</p><button class="btn btn-outline" id="dash-empty-new">Agendar agora</button></div>`
            : `<div class="grid-cards">${todayAppts.map(apptCardHTML).join('')}</div>`
          }
        </div>
      </div>
      <div class="revenue-box">
        <h3>📊 Resumo Financeiro</h3>
        <div class="revenue-row"><span class="lbl">Concluídos este mês</span><span class="val">${monthCompleted.length}</span></div>
        <div class="revenue-row"><span class="lbl">Receita confirmada</span><span class="val green">${fmtMoney(monthRevenue)}</span></div>
        <div class="revenue-row"><span class="lbl">Receita pendente</span><span class="val amber">${fmtMoney(pendingRevenue)}</span></div>
        <div class="revenue-row" style="border-top:2px solid var(--border);margin-top:6px;padding-top:10px">
          <span class="lbl" style="font-weight:700">Total potencial</span>
          <span class="val" style="font-size:15px">${fmtMoney(monthRevenue + pendingRevenue)}</span>
        </div>
      </div>
    </div>`

  // responsive grid
  const adjustGrid = () => {
    const g = document.getElementById('dash-grid')
    if (g) g.style.gridTemplateColumns = window.innerWidth < 900 ? '1fr' : '1fr 300px'
  }
  adjustGrid()
  window.addEventListener('resize', adjustGrid)

  // events
  document.getElementById('dash-new-btn')?.addEventListener('click', () => openApptModal())
  document.getElementById('dash-view-all')?.addEventListener('click', () => import('./appointments.js').then(m => { import('../components/router.js').then(r => r.navigate('appointments')) }))
  document.getElementById('dash-empty-new')?.addEventListener('click', () => openApptModal())
  bindCardButtons(el)
}

export function apptCardHTML(a) {
  const labels = { scheduled: 'Agendado', completed: 'Concluído', cancelled: 'Cancelado' }
  const actions = a.status === 'scheduled'
    ? `<div class="action-btns">
        <button class="act-complete" data-id="${a.id}" data-action="complete">✓ Concluir</button>
        <button class="act-edit"     data-id="${a.id}" data-action="edit">✎ Editar</button>
        <button class="act-cancel"   data-id="${a.id}" data-action="cancel">✕ Cancelar</button>
      </div>`
    : `<div class="action-btns"><button class="act-edit" data-id="${a.id}" data-action="edit">✎ Editar</button></div>`

  return `
  <div class="appt-card">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
      <div>
        <div class="appt-service">${a.service_name || '—'}</div>
        <div class="appt-time">${icon.clock(12)} ${fmtDate(a.date)} às ${a.time}</div>
      </div>
      <span class="badge badge-${a.status}">${labels[a.status] || a.status}</span>
    </div>
    <div class="appt-meta">${icon.clock(12)} ${a.client_name}</div>
    <div class="appt-meta">${icon.clock(12)} ${a.client_phone}</div>
    ${a.notes ? `<div style="font-size:12px;color:var(--muted-fg);margin-top:7px;font-style:italic">${a.notes}</div>` : ''}
    ${a.price > 0 ? `<hr class="divider"/><span class="appt-price">${fmtMoney(a.price)}</span>` : ''}
    <hr class="divider"/>
    ${actions}
  </div>`
}

export function bindCardButtons(container) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { id, action } = btn.dataset
      if (action === 'edit')     openApptModal(id)
      if (action === 'complete') changeStatus(id, 'completed')
      if (action === 'cancel')   changeStatus(id, 'cancelled')
    })
  })
}
