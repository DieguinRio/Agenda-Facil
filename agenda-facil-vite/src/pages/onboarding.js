import { DB, saveSvcs, saveSettingsData, getSettings } from '../lib/db.js'
import { toast, todayStr } from '../lib/helpers.js'
import { updateSidebarProfile } from '../components/sidebar.js'
import { navigate } from '../components/router.js'

// Show onboarding if user hasn't completed it yet
export function shouldShowOnboarding() {
  return !localStorage.getItem('af_onboarded')
}

export function markOnboarded() {
  localStorage.setItem('af_onboarded', '1')
}

export function openOnboarding() {
  const overlay = document.getElementById('onboarding-overlay')
  overlay.classList.add('open')
  renderStep(1)
}

function closeOnboarding() {
  document.getElementById('onboarding-overlay').classList.remove('open')
  markOnboarded()
  updateSidebarProfile()
  navigate('dashboard')
}

// ── State ────────────────────────────────────────────────────
const state = {
  bizName: '', bizType: '', phone: '',
  services: [
    { name: '', duration: 30, price: '' },
  ]
}

// ── Render ───────────────────────────────────────────────────
function renderStep(step) {
  const body = document.getElementById('ob-body')
  // dots
  document.querySelectorAll('.ob-dot').forEach((d, i) => d.classList.toggle('active', i === step - 1))
  // progress segments
  ;[1,2,3].forEach(n => {
    const seg = document.getElementById(`ob-seg-${n}`)
    if (seg) seg.classList.toggle('done', n <= step)
  })
  if (step === 1) renderStep1(body)
  if (step === 2) renderStep2(body)
  if (step === 3) renderStep3(body)
}

function renderStep1(body) {
  body.innerHTML = `
    <div class="ob-step-icon">🏪</div>
    <h2 class="ob-step-title">Bem-vindo ao Agenda Fácil!</h2>
    <p class="ob-step-sub">Vamos configurar o seu negócio em menos de 2 minutos. Primeiro, como se chama o seu estabelecimento?</p>
    <div class="ob-form">
      <div class="form-group">
        <label>Nome do negócio *</label>
        <input type="text" id="ob-biz-name" value="${state.bizName}" placeholder="Ex: Barbearia do João, Clínica Vida…" autofocus/>
      </div>
      <div class="form-group">
        <label>Tipo / Especialidade</label>
        <select id="ob-biz-type">
          <option value="">Selecione…</option>
          ${[
            'Salão de Beleza','Barbearia','Clínica de Estética','Manicure / Nail Designer',
            'Fisioterapia','Nutrição','Psicologia','Odontologia','Personal Trainer',
            'Tatuagem','Fotografia','Advocacia','Contabilidade','Outro'
          ].map(t => `<option value="${t}" ${state.bizType===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>WhatsApp de contato</label>
        <input type="text" id="ob-phone" value="${state.phone}" placeholder="(00) 00000-0000"/>
      </div>
    </div>
    <div class="ob-footer">
      <button class="btn btn-ghost ob-skip" onclick="window._onboarding.skip()">Pular configuração</button>
      <button class="btn btn-primary" onclick="window._onboarding.next1()">
        Continuar
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>`
}

function renderStep2(body) {
  body.innerHTML = `
    <div class="ob-step-icon">✂️</div>
    <h2 class="ob-step-title">Quais serviços você oferece?</h2>
    <p class="ob-step-sub">Adicione pelo menos um serviço. Você pode editar ou adicionar mais depois.</p>
    <div class="ob-form" id="ob-svc-list">
      ${state.services.map((s, i) => svcRow(s, i)).join('')}
    </div>
    <button class="ob-add-svc" onclick="window._onboarding.addSvc()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Adicionar outro serviço
    </button>
    <div class="ob-footer">
      <button class="btn btn-ghost" onclick="window._onboarding.back(1)">← Voltar</button>
      <button class="btn btn-primary" onclick="window._onboarding.next2()">
        Continuar
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>`
}

function svcRow(s, i) {
  return `
  <div class="ob-svc-row" id="ob-svc-row-${i}">
    <div class="form-group" style="flex:2">
      <label>Nome do serviço *</label>
      <input type="text" class="ob-svc-name" data-i="${i}" value="${s.name}" placeholder="Ex: Corte de cabelo"/>
    </div>
    <div class="form-group" style="flex:1">
      <label>Duração (min)</label>
      <input type="number" class="ob-svc-dur" data-i="${i}" value="${s.duration}" min="5" step="5"/>
    </div>
    <div class="form-group" style="flex:1">
      <label>Preço (R$)</label>
      <input type="number" class="ob-svc-price" data-i="${i}" value="${s.price}" min="0" step="0.01" placeholder="0"/>
    </div>
    ${i > 0 ? `<button class="ob-svc-del" onclick="window._onboarding.delSvc(${i})" title="Remover">✕</button>` : '<div style="width:24px"></div>'}
  </div>`
}

function renderStep3(body) {
  const s = getSettings()
  const slug = (state.bizName || s.bizName || 'meu-negocio').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
  body.innerHTML = `
    <div class="ob-step-icon">🎉</div>
    <h2 class="ob-step-title">Tudo pronto!</h2>
    <p class="ob-step-sub">Seu negócio está configurado. Agora compartilhe o link abaixo com seus clientes — eles poderão agendar sozinhos, sem precisar ligar.</p>

    <div class="ob-link-box">
      <div class="ob-link-label">Seu link de agendamento</div>
      <div class="ob-link-url">agendafacil.app/${slug}</div>
      <button class="btn btn-outline btn-sm" onclick="window._onboarding.copyLink('${slug}')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copiar link
      </button>
    </div>

    <div class="ob-checklist">
      <div class="ob-check-item done">
        <span class="ob-check-icon">✓</span>
        <span>Negócio configurado: <strong>${state.bizName || 'seu negócio'}</strong></span>
      </div>
      <div class="ob-check-item done">
        <span class="ob-check-icon">✓</span>
        <span>${state.services.filter(s=>s.name).length} serviço(s) cadastrado(s)</span>
      </div>
      <div class="ob-check-item">
        <span class="ob-check-icon pending">→</span>
        <span>Compartilhe o link com seu primeiro cliente</span>
      </div>
    </div>

    <div class="ob-footer" style="justify-content:flex-end">
      <button class="btn btn-primary" style="height:46px;font-size:15px;padding:0 32px" onclick="window._onboarding.finish()">
        Ir para o painel
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>`
}

// ── Actions (exposed to window for inline onclick) ────────────
window._onboarding = {
  next1() {
    state.bizName = document.getElementById('ob-biz-name')?.value.trim() || ''
    state.bizType = document.getElementById('ob-biz-type')?.value || ''
    state.phone   = document.getElementById('ob-phone')?.value.trim() || ''
    if (!state.bizName) { toast('Informe o nome do negócio.', 'error'); return }
    renderStep(2)
  },
  next2() {
    // collect services from DOM
    document.querySelectorAll('.ob-svc-name').forEach((el, i) => {
      if (!state.services[i]) state.services[i] = { name:'', duration:30, price:'' }
      state.services[i].name     = el.value.trim()
      state.services[i].duration = Number(document.querySelectorAll('.ob-svc-dur')[i]?.value) || 30
      state.services[i].price    = Number(document.querySelectorAll('.ob-svc-price')[i]?.value) || 0
    })
    const valid = state.services.filter(s => s.name)
    if (!valid.length) { toast('Adicione pelo menos um serviço.', 'error'); return }
    // save everything
    saveSettingsData({ bizName: state.bizName, bizType: state.bizType, phone: state.phone })
    const svcs = valid.map(s => ({ id: DB.id(), name: s.name, description: '', duration_minutes: s.duration, price: s.price, active: true, created_date: todayStr() }))
    saveSvcs(svcs)
    renderStep(3)
  },
  back(step) { renderStep(step) },
  skip() { closeOnboarding() },
  finish() { closeOnboarding() },
  addSvc() {
    // save current values before re-render
    document.querySelectorAll('.ob-svc-name').forEach((el, i) => {
      state.services[i] = {
        name: el.value.trim(),
        duration: Number(document.querySelectorAll('.ob-svc-dur')[i]?.value) || 30,
        price: Number(document.querySelectorAll('.ob-svc-price')[i]?.value) || 0,
      }
    })
    state.services.push({ name: '', duration: 30, price: '' })
    document.getElementById('ob-svc-list').innerHTML = state.services.map((s, i) => svcRow(s, i)).join('')
  },
  delSvc(i) {
    state.services.splice(i, 1)
    document.getElementById('ob-svc-list').innerHTML = state.services.map((s, idx) => svcRow(s, idx)).join('')
  },
  copyLink(slug) {
    navigator.clipboard.writeText(`https://agendafacil.app/${slug}`)
      .then(() => toast('Link copiado!'))
      .catch(() => toast('Não foi possível copiar.', 'error'))
  }
}
