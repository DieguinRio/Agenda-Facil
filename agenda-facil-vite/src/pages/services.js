import { DB, getSvcs, saveSvcs } from '../lib/db.js'
import { fmtMoney, toast, todayStr, icon } from '../lib/helpers.js'

let editingId = null

export function renderServices() {
  const el = document.getElementById('page-services')
  el.innerHTML = `
    <div class="row-between mb24">
      <div><h1 class="page-title">Serviços</h1><p class="page-sub">Configure os serviços que você oferece</p></div>
      <button class="btn btn-primary" id="svc-new-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Serviço
      </button>
    </div>
    <div id="svc-list"></div>`

  document.getElementById('svc-new-btn').addEventListener('click', () => openModal())
  drawList()
}

function drawList() {
  const svcs = getSvcs().sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''))
  const el   = document.getElementById('svc-list')
  if (!svcs.length) {
    el.innerHTML = `<div class="empty">${icon.scissors()}<p>Nenhum serviço cadastrado.</p><button class="btn btn-outline" id="svc-empty-new">Adicionar serviço</button></div>`
    document.getElementById('svc-empty-new')?.addEventListener('click', () => openModal())
    return
  }
  el.innerHTML = `<div class="grid-cards">${svcs.map(s => `
    <div class="svc-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div>
          <div class="svc-name">${s.name}</div>
          ${s.description ? `<div class="svc-desc">${s.description}</div>` : ''}
        </div>
        ${s.active === false ? '<span class="svc-inactive">Inativo</span>' : ''}
      </div>
      <div class="svc-meta">
        <span>${icon.clock(13)} ${s.duration_minutes} min</span>
        <span>${icon.dollar(13)} ${fmtMoney(s.price)}</span>
      </div>
      <hr class="divider"/>
      <div class="row" style="gap:4px">
        <button class="btn btn-ghost btn-sm" data-svc-edit="${s.id}">✎ Editar</button>
        <button class="btn btn-danger btn-sm" data-svc-del="${s.id}">✕ Excluir</button>
      </div>
    </div>`).join('')}</div>`

  el.querySelectorAll('[data-svc-edit]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.svcEdit)))
  el.querySelectorAll('[data-svc-del]').forEach(b => b.addEventListener('click',  () => deleteSvc(b.dataset.svcDel)))
}

function openModal(id = null) {
  editingId = id
  const modal = document.getElementById('svc-modal')
  const svc   = id ? getSvcs().find(s => s.id === id) : null

  modal.innerHTML = `
  <div class="modal">
    <div class="modal-title">${id ? 'Editar Serviço' : 'Novo Serviço'}</div>
    <div class="gap-sm">
      <div class="form-group"><label>Nome *</label><input type="text" id="sm-name" value="${svc?.name || ''}" placeholder="Ex: Corte de cabelo"/></div>
      <div class="form-group"><label>Descrição</label><textarea id="sm-desc" rows="2" placeholder="Descrição breve">${svc?.description || ''}</textarea></div>
      <div class="grid-2">
        <div class="form-group"><label>Duração (min) *</label><input type="number" id="sm-dur" value="${svc?.duration_minutes || 30}" min="5" step="5"/></div>
        <div class="form-group"><label>Preço (R$) *</label><input type="number" id="sm-price" value="${svc?.price || 0}" step="0.01" min="0"/></div>
      </div>
      <div class="switch-row"><label>Serviço ativo</label>
        <label class="switch"><input type="checkbox" id="sm-active" ${svc?.active !== false ? 'checked' : ''}/><div class="switch-track"></div><div class="switch-thumb"></div></label>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="sm-cancel">Cancelar</button>
      <button class="btn btn-primary" id="sm-save">Salvar</button>
    </div>
  </div>`

  modal.classList.add('open')
  document.getElementById('sm-cancel').addEventListener('click', () => modal.classList.remove('open'))
  document.getElementById('sm-save').addEventListener('click', save)
}

function save() {
  const name   = document.getElementById('sm-name').value.trim()
  const desc   = document.getElementById('sm-desc').value.trim()
  const dur    = Number(document.getElementById('sm-dur').value)
  const price  = Number(document.getElementById('sm-price').value)
  const active = document.getElementById('sm-active').checked
  if (!name || !dur) { toast('Preencha os campos obrigatórios.', 'error'); return }

  const svcs = getSvcs()
  if (editingId) {
    const i = svcs.findIndex(s => s.id === editingId)
    if (i > -1) svcs[i] = { ...svcs[i], name, description: desc, duration_minutes: dur, price, active }
    toast('Serviço atualizado!')
  } else {
    svcs.push({ id: DB.id(), name, description: desc, duration_minutes: dur, price, active, created_date: todayStr() })
    toast('Serviço criado!')
  }
  saveSvcs(svcs)
  document.getElementById('svc-modal').classList.remove('open')
  drawList()
}

function deleteSvc(id) {
  if (!confirm('Excluir este serviço?')) return
  saveSvcs(getSvcs().filter(s => s.id !== id))
  toast('Serviço removido.', 'warning')
  drawList()
}
