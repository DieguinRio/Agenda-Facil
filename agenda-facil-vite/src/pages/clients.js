import { DB, getClients, saveClients, getAppts } from '../lib/db.js'
import { toast, todayStr, icon } from '../lib/helpers.js'

let editingId = null

export function renderClients() {
  const el = document.getElementById('page-clients')
  el.innerHTML = `
    <div class="row-between mb20">
      <div><h1 class="page-title">Clientes</h1><p class="page-sub">Gerencie sua base de clientes</p></div>
      <button class="btn btn-primary" id="cl-new-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Cliente
      </button>
    </div>
    <div class="search-wrap mb16">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="cl-search" placeholder="Buscar por nome ou telefone…"/>
    </div>
    <div id="client-list"></div>`

  document.getElementById('cl-new-btn').addEventListener('click', () => openModal())
  document.getElementById('cl-search').addEventListener('input', drawList)
  drawList()
}

function drawList() {
  const q = (document.getElementById('cl-search')?.value || '').toLowerCase()
  const clients = getClients().filter(c =>
    (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q)
  )
  const el = document.getElementById('client-list')
  if (!clients.length) {
    el.innerHTML = `<div class="empty">${icon.users()}<p>Nenhum cliente encontrado.</p><button class="btn btn-outline" id="cl-empty-new">Cadastrar cliente</button></div>`
    document.getElementById('cl-empty-new')?.addEventListener('click', () => openModal())
    return
  }
  el.innerHTML = `<div class="grid-cards">${clients.map(c => {
    const count = getAppts().filter(a => a.client_id === c.id).length
    return `<div class="client-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="client-name">${c.name}</div>
        ${count > 0 ? `<span class="badge badge-scheduled">${count} agend.</span>` : ''}
      </div>
      <div class="client-meta"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.76a16 16 0 0 0 5.68 5.68l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> ${c.phone}</div>
      ${c.email ? `<div class="client-meta"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> ${c.email}</div>` : ''}
      ${c.notes ? `<div class="client-notes">${c.notes}</div>` : ''}
      <hr class="divider"/>
      <div class="row" style="gap:4px">
        <button class="btn btn-ghost btn-sm" data-cl-edit="${c.id}">✎ Editar</button>
        <button class="btn btn-danger btn-sm" data-cl-del="${c.id}">✕ Excluir</button>
      </div>
    </div>`
  }).join('')}</div>`

  el.querySelectorAll('[data-cl-edit]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.clEdit)))
  el.querySelectorAll('[data-cl-del]').forEach(b  => b.addEventListener('click', () => deleteClient(b.dataset.clDel)))
}

function openModal(id = null) {
  editingId = id
  const modal = document.getElementById('client-modal')
  const c     = id ? getClients().find(x => x.id === id) : null

  modal.innerHTML = `
  <div class="modal">
    <div class="modal-title">${id ? 'Editar Cliente' : 'Novo Cliente'}</div>
    <div class="gap-sm">
      <div class="form-group"><label>Nome *</label><input type="text" id="cm-name" value="${c?.name || ''}" placeholder="Nome completo"/></div>
      <div class="form-group"><label>Telefone *</label><input type="text" id="cm-phone" value="${c?.phone || ''}" placeholder="(00) 00000-0000"/></div>
      <div class="form-group"><label>E-mail</label><input type="email" id="cm-email" value="${c?.email || ''}" placeholder="email@exemplo.com"/></div>
      <div class="form-group"><label>Observações</label><textarea id="cm-notes" rows="2" placeholder="Notas sobre o cliente">${c?.notes || ''}</textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="cm-cancel">Cancelar</button>
      <button class="btn btn-primary" id="cm-save">Salvar</button>
    </div>
  </div>`

  modal.classList.add('open')
  document.getElementById('cm-cancel').addEventListener('click', () => modal.classList.remove('open'))
  document.getElementById('cm-save').addEventListener('click', save)
}

function save() {
  const name  = document.getElementById('cm-name').value.trim()
  const phone = document.getElementById('cm-phone').value.trim()
  const email = document.getElementById('cm-email').value.trim()
  const notes = document.getElementById('cm-notes').value.trim()
  if (!name || !phone) { toast('Nome e telefone são obrigatórios.', 'error'); return }

  const clients = getClients()
  if (editingId) {
    const i = clients.findIndex(c => c.id === editingId)
    if (i > -1) clients[i] = { ...clients[i], name, phone, email, notes }
    toast('Cliente atualizado!')
  } else {
    clients.push({ id: DB.id(), name, phone, email, notes, created_date: todayStr() })
    toast('Cliente cadastrado!')
  }
  saveClients(clients)
  document.getElementById('client-modal').classList.remove('open')
  drawList()
}

function deleteClient(id) {
  if (!confirm('Excluir este cliente?')) return
  saveClients(getClients().filter(c => c.id !== id))
  toast('Cliente removido.', 'warning')
  drawList()
}
