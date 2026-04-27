import { DB, getAppts, getSvcs, getClients, saveAppts, saveClients } from '../lib/db.js'
import { toast, fmtMoney, todayStr } from '../lib/helpers.js'
import { updateSidebarStatus } from './sidebar.js'
import { currentPage } from './router.js'
import { renderDashboard } from '../pages/dashboard.js'
import { renderCalendar } from '../pages/calendar.js'
import { renderAppointments } from '../pages/appointments.js'

let editingId = null
let isNewClient = false
let selectedSvc = null

export function openApptModal(id = null, preDate = null, preTime = null) {
  editingId = id
  isNewClient = false
  selectedSvc = null

  renderModalHTML()

  const modal = document.getElementById('appt-modal')
  const cSel  = document.getElementById('am-client-sel')
  const sSel  = document.getElementById('am-service')
  const tSel  = document.getElementById('am-time')

  // populate clients
  cSel.innerHTML = '<option value="">Escolha ou cadastre abaixo</option><option value="__new__">+ Novo cliente</option>'
  getClients().forEach(c => {
    cSel.innerHTML += `<option value="${c.id}">${c.name} — ${c.phone}</option>`
  })

  // populate services
  sSel.innerHTML = '<option value="">Escolha um serviço</option>'
  getSvcs().filter(s => s.active !== false).forEach(s => {
    sSel.innerHTML += `<option value="${s.id}">${s.name} — ${fmtMoney(s.price)} (${s.duration_minutes}min)</option>`
  })

  // populate time slots
  tSel.innerHTML = '<option value="">Selecionar horário</option>'
  for (let h = 7; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      const t = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
      tSel.innerHTML += `<option value="${t}">${t}</option>`
    }
  }

  if (id) {
    const a = getAppts().find(x => x.id === id)
    if (!a) return
    document.getElementById('am-modal-title').textContent = 'Editar Agendamento'
    document.getElementById('am-save-btn').textContent = 'Salvar Alterações'
    cSel.value = a.client_id || ''
    document.getElementById('am-client-fields').style.display = cSel.value ? 'none' : 'grid'
    document.getElementById('am-cname').value  = a.client_name  || ''
    document.getElementById('am-cphone').value = a.client_phone || ''
    sSel.value = a.service_id || ''
    document.getElementById('am-date').value  = a.date || ''
    tSel.value = a.time || ''
    document.getElementById('am-notes').value = a.notes || ''
    updatePriceBox()
    checkConflict()
  } else {
    document.getElementById('am-modal-title').textContent = 'Novo Agendamento'
    document.getElementById('am-save-btn').textContent = 'Criar Agendamento'
    cSel.value = ''
    document.getElementById('am-client-fields').style.display = 'grid'
    document.getElementById('am-cname').value  = ''
    document.getElementById('am-cphone').value = ''
    sSel.value = ''
    document.getElementById('am-date').value  = preDate || ''
    tSel.value = preTime || ''
    document.getElementById('am-notes').value = ''
    document.getElementById('am-price-box').style.display  = 'none'
    document.getElementById('am-conflict').style.display   = 'none'
    if (preDate && preTime) checkConflict()
  }

  modal.classList.add('open')
  bindModalEvents()
}

function renderModalHTML() {
  document.getElementById('appt-modal').innerHTML = `
  <div class="modal" style="max-width:520px">
    <div class="modal-title" id="am-modal-title">Novo Agendamento</div>
    <div class="fsection">
      <div class="ftitle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Cliente
      </div>
      <div class="gap-sm">
        <div class="form-group"><label>Selecionar Cliente</label>
          <select id="am-client-sel"><option value="">Carregando…</option></select>
        </div>
        <div id="am-client-fields" class="grid-2">
          <div class="form-group"><label>Nome *</label><input type="text" id="am-cname" placeholder="Nome do cliente"/></div>
          <div class="form-group"><label>Telefone *</label><input type="text" id="am-cphone" placeholder="(00) 00000-0000"/></div>
        </div>
      </div>
    </div>
    <div class="fsection">
      <div class="ftitle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Serviço &amp; Horário
      </div>
      <div class="gap-sm">
        <div class="form-group"><label>Serviço *</label><select id="am-service"><option value="">Carregando…</option></select></div>
        <div class="grid-2">
          <div class="form-group"><label>Data *</label><input type="date" id="am-date"/></div>
          <div class="form-group"><label>Horário *</label><select id="am-time"><option value="">Selecionar</option></select></div>
        </div>
        <div id="am-conflict" style="display:none"></div>
      </div>
    </div>
    <div class="fsection" style="border:none;padding-bottom:0">
      <div class="form-group mb12"><label>Observações</label><textarea id="am-notes" rows="2" placeholder="Observações opcionais…"></textarea></div>
      <div id="am-price-box" style="display:none"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="am-cancel-btn">Cancelar</button>
      <button class="btn btn-primary" id="am-save-btn">Criar Agendamento</button>
    </div>
  </div>`
}

function bindModalEvents() {
  document.getElementById('am-cancel-btn').addEventListener('click', closeApptModal)
  document.getElementById('am-save-btn').addEventListener('click', saveAppt)
  document.getElementById('am-client-sel').addEventListener('change', handleClientSel)
  document.getElementById('am-service').addEventListener('change', () => { updatePriceBox(); checkConflict() })
  document.getElementById('am-date').addEventListener('change', checkConflict)
  document.getElementById('am-time').addEventListener('change', checkConflict)
}

export function closeApptModal() {
  document.getElementById('appt-modal').classList.remove('open')
}

function handleClientSel() {
  const val = document.getElementById('am-client-sel').value
  const fields = document.getElementById('am-client-fields')
  if (val === '__new__') {
    isNewClient = true
    fields.style.display = 'grid'
    document.getElementById('am-cname').value  = ''
    document.getElementById('am-cphone').value = ''
  } else if (val === '') {
    isNewClient = false
    fields.style.display = 'grid'
  } else {
    isNewClient = false
    const c = getClients().find(x => x.id === val)
    if (c) {
      document.getElementById('am-cname').value  = c.name
      document.getElementById('am-cphone').value = c.phone
    }
    fields.style.display = 'none'
  }
}

function updatePriceBox() {
  const id = document.getElementById('am-service').value
  selectedSvc = getSvcs().find(s => s.id === id) || null
  const box = document.getElementById('am-price-box')
  if (selectedSvc && selectedSvc.price > 0) {
    box.style.display = 'block'
    box.innerHTML = `<div class="price-box"><div class="plbl">Valor do serviço</div><div class="pval">${fmtMoney(selectedSvc.price)}</div></div>`
  } else {
    box.style.display = 'none'
  }
}

function checkConflict() {
  const date = document.getElementById('am-date').value
  const time = document.getElementById('am-time').value
  const el   = document.getElementById('am-conflict')
  if (!date || !time) { el.style.display = 'none'; return }

  const dur = selectedSvc?.duration_minutes || 45
  const [sh, sm] = time.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin   = startMin + dur

  const conflicts = getAppts().filter(a => {
    if (a.id === editingId || a.date !== date || a.status === 'cancelled') return false
    const [ah, am_] = a.time.split(':').map(Number)
    const aStart = ah * 60 + am_
    const aDur   = getSvcs().find(s => s.id === a.service_id)?.duration_minutes || 45
    return startMin < aStart + aDur && endMin > aStart
  })

  if (conflicts.length > 0) {
    el.style.display = 'flex'
    el.innerHTML = `<div class="conflict-warning">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      Conflito com: ${conflicts.map(c => `${c.client_name} (${c.time})`).join(', ')}
    </div>`
  } else {
    el.style.display = 'none'
  }
}

function saveAppt() {
  const clientSel = document.getElementById('am-client-sel').value
  const cname     = document.getElementById('am-cname').value.trim()
  const cphone    = document.getElementById('am-cphone').value.trim()
  const svcId     = document.getElementById('am-service').value
  const date      = document.getElementById('am-date').value
  const time      = document.getElementById('am-time').value
  const notes     = document.getElementById('am-notes').value.trim()

  if (!svcId || !cname || !cphone || !date || !time) {
    toast('Preencha todos os campos obrigatórios.', 'error')
    return
  }

  let clientId = (clientSel !== '' && clientSel !== '__new__') ? clientSel : ''
  if (isNewClient || clientId === '') {
    const nc = { id: DB.id(), name: cname, phone: cphone, email: '', notes: '', created_date: todayStr() }
    const cls = getClients(); cls.push(nc); saveClients(cls)
    clientId = nc.id
  }

  const svc   = getSvcs().find(s => s.id === svcId)
  const appts = getAppts()

  if (editingId) {
    const i = appts.findIndex(a => a.id === editingId)
    if (i > -1) appts[i] = { ...appts[i], client_id: clientId, client_name: cname, client_phone: cphone, service_id: svcId, service_name: svc?.name || '', date, time, price: svc?.price || 0, notes }
    toast('Agendamento atualizado!')
  } else {
    appts.push({ id: DB.id(), client_id: clientId, client_name: cname, client_phone: cphone, service_id: svcId, service_name: svc?.name || '', date, time, price: svc?.price || 0, notes, status: 'scheduled', created_date: todayStr() })
    toast('Agendamento criado!')
  }

  saveAppts(appts)
  updateSidebarStatus()
  closeApptModal()

  if (currentPage === 'dashboard')    renderDashboard()
  else if (currentPage === 'calendar') renderCalendar()
  else renderAppointments()
}

// ─── Shared: change status (used by dashboard, appointments, calendar) ───────
export function changeStatus(id, status) {
  const appts = getAppts()
  const i = appts.findIndex(a => a.id === id)
  if (i > -1) { appts[i].status = status; saveAppts(appts) }
  toast(status === 'completed' ? 'Agendamento concluído!' : 'Agendamento cancelado.', status === 'completed' ? 'success' : 'warning')
  updateSidebarStatus()
  if (currentPage === 'dashboard')    renderDashboard()
  else if (currentPage === 'calendar') renderCalendar()
  else renderAppointments()
}

// expose to window for inline onclick calls from rendered HTML
window._apptModal = { open: openApptModal, close: closeApptModal, changeStatus }
