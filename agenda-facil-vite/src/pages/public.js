import { DB, getAppts, getSvcs, getClients, saveAppts, saveClients, getSettings } from '../lib/db.js'
import { toast, fmtDate, fmtMoney, todayStr, dateToStr, PT_MONTHS, PT_DAYS_S, DAY_KEYS, icon } from '../lib/helpers.js'
import { updateSidebarStatus } from '../components/sidebar.js'

let pubSvc = null, pubDay = null, pubTime = null, pubRescheduleId = null

export function openPublicPage() {
  pubSvc = null; pubDay = null; pubTime = null; pubRescheduleId = null

  const s   = getSettings()
  const svcs = getSvcs().filter(x => x.active !== false)
  const initials = (s.bizName || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
  const socLinks = [
    s.instagram && { url: s.instagram, label: 'Instagram', svg: icon.instagram },
    s.facebook  && { url: s.facebook,  label: 'Facebook',  svg: icon.facebook },
    s.twitter   && { url: s.twitter,   label: 'Twitter',   svg: icon.twitter },
  ].filter(Boolean)

  document.getElementById('public-overlay').innerHTML = `
  <div style="background:var(--bg);min-height:100vh;overflow-y:auto">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px 60px">

    <button id="pub-back" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:7px;color:var(--fg2);font-size:14px;font-weight:600;font-family:inherit;padding:0 0 20px;transition:color .14s">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Voltar ao painel
    </button>

    <!-- Business header -->
    <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;margin-bottom:20px;box-shadow:var(--shadow);text-align:center">
      <div style="width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,var(--primary) 0%,#7C3AED 100%);display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:28px;color:#fff;margin:0 auto 14px">${initials}</div>
      <div style="font-family:'DM Serif Display',serif;font-size:22px;color:var(--fg)">${s.bizName || 'Meu Negócio'}</div>
      <div style="font-size:13.5px;color:var(--muted-fg);margin-top:4px">${s.bizType || ''}</div>
      ${s.phone ? `<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;color:var(--muted-fg);margin-top:10px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.76a16 16 0 0 0 5.68 5.68l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>${s.phone}</div>` : ''}
      ${socLinks.length ? `<div style="display:flex;gap:10px;justify-content:center;margin-top:12px;flex-wrap:wrap">${socLinks.map(l => `<a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;border:1px solid var(--border);background:var(--card);font-size:12.5px;font-weight:600;color:var(--fg2);text-decoration:none"><svg style="width:14px;height:14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${l.svg.replace(/<svg[^>]*>/,'').replace('</svg>','')}</svg>${l.label}</a>`).join('')}</div>` : ''}
    </div>

    <!-- Manage existing appointment -->
    <div id="pub-manage" style="margin-bottom:20px">
      <div style="font-weight:700;font-size:14px;color:var(--fg);margin-bottom:12px;display:flex;align-items:center;gap:7px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Já tem um agendamento?
      </div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow)">
        <p style="font-size:13px;color:var(--fg2);margin-bottom:12px">Informe seu WhatsApp para ver, cancelar ou reagendar.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input type="text" id="pub-lookup-phone" placeholder="(00) 00000-0000" style="flex:1;min-width:160px"/>
          <button class="btn btn-outline" id="pub-lookup-btn">Buscar</button>
        </div>
        <div id="pub-lookup-result" style="margin-top:12px"></div>
      </div>
    </div>

    <!-- Step 1: service -->
    <div id="pub-step1" style="margin-bottom:20px">
      <div style="font-weight:700;font-size:14px;color:var(--fg);margin-bottom:12px;display:flex;align-items:center;gap:7px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
        1. Escolha o serviço
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${svcs.map(svc => `
          <div class="svc-pick-item" data-svc-id="${svc.id}" style="background:var(--card);border:2px solid var(--border);border-radius:12px;padding:14px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-weight:600;font-size:14px;color:var(--fg)">${svc.name}</div>
              <div style="font-size:12.5px;color:var(--muted-fg);margin-top:2px">${svc.duration_minutes} min${svc.description ? ' · ' + svc.description : ''}</div>
            </div>
            <div style="font-weight:700;font-size:15px;color:var(--primary)">${fmtMoney(svc.price)}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Step 2: day -->
    <div id="pub-step2" style="display:none;margin-bottom:20px">
      <div id="pub-step2-title" style="font-weight:700;font-size:14px;color:var(--fg);margin-bottom:12px;display:flex;align-items:center;gap:7px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        2. Escolha o dia
      </div>
      <div id="pub-day-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px"></div>
    </div>

    <!-- Step 3: time -->
    <div id="pub-step3" style="display:none;margin-bottom:20px">
      <div style="font-weight:700;font-size:14px;color:var(--fg);margin-bottom:12px;display:flex;align-items:center;gap:7px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        3. Escolha o horário
      </div>
      <div id="pub-slots" style="display:flex;flex-wrap:wrap;gap:8px"></div>
    </div>

    <!-- Step 4: form -->
    <div id="pub-step4" style="display:none;margin-bottom:20px">
      <div style="font-weight:700;font-size:14px;color:var(--fg);margin-bottom:12px">4. Seus dados</div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;box-shadow:var(--shadow)">
        <div id="pub-summary" style="background:var(--pri-lt);border-radius:9px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:var(--primary);font-weight:600"></div>
        <div class="form-group" style="margin-bottom:12px"><label>Seu nome *</label><input type="text" id="pub-cname" placeholder="Nome completo"/></div>
        <div class="form-group" style="margin-bottom:12px"><label>WhatsApp *</label><input type="text" id="pub-cphone" placeholder="(00) 00000-0000"/></div>
        <div class="form-group" style="margin-bottom:16px"><label>Observações</label><textarea id="pub-cnotes" rows="2" placeholder="Alguma observação?"></textarea></div>
        <button class="btn btn-primary" id="pub-confirm-btn" style="width:100%;height:46px;font-size:15px">Confirmar Agendamento</button>
      </div>
    </div>

    <!-- Step 5: confirmed -->
    <div id="pub-step5" style="display:none">
      <div style="background:var(--grn-lt);border:1px solid rgba(22,163,74,.2);border-radius:12px;padding:24px;text-align:center">
        <div style="font-size:36px;margin-bottom:8px">🎉</div>
        <div style="font-family:'DM Serif Display',serif;font-size:20px;color:var(--green)">Agendamento Confirmado!</div>
        <div id="pub-confirm-detail" style="font-size:13.5px;color:var(--fg2);margin-top:6px"></div>
        <p style="font-size:12.5px;color:var(--fg2);margin-top:14px;padding-top:14px;border-top:1px solid rgba(22,163,74,.2)">Em breve você receberá confirmação pelo WhatsApp. Obrigado!</p>
      </div>
      <div style="text-align:center;margin-top:20px">
        <button class="btn btn-outline" id="pub-again-btn">Fazer outro agendamento</button>
      </div>
    </div>

  </div>
  </div>`

  document.getElementById('public-overlay').classList.add('open')
  document.body.style.overflow = 'hidden'

  bindPublicEvents()
}

function bindPublicEvents() {
  document.getElementById('pub-back')?.addEventListener('click', closePublicPage)
  document.getElementById('pub-lookup-btn')?.addEventListener('click', lookupAppts)
  document.getElementById('pub-confirm-btn')?.addEventListener('click', confirm)
  document.getElementById('pub-again-btn')?.addEventListener('click', () => { closePublicPage(); openPublicPage() })

  document.querySelectorAll('.svc-pick-item').forEach(el => {
    el.addEventListener('click', () => pickSvc(el.dataset.svcId))
  })
}

export function closePublicPage() {
  document.getElementById('public-overlay').classList.remove('open')
  document.body.style.overflow = ''
}

function pickSvc(id) {
  pubSvc = getSvcs().find(s => s.id === id)
  document.querySelectorAll('.svc-pick-item').forEach(el => {
    el.style.borderColor = el.dataset.svcId === id ? 'var(--primary)' : 'var(--border)'
    el.style.background  = el.dataset.svcId === id ? 'var(--pri-lt)'  : 'var(--card)'
  })
  pubDay = null; pubTime = null
  renderDays()
  show('pub-step2')
  document.getElementById('pub-step3').style.display = 'none'
  document.getElementById('pub-step4').style.display = 'none'
  document.getElementById('pub-step2').scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function renderDays() {
  const s       = getSettings()
  const now     = new Date()
  const today   = todayStr()
  const grid    = document.getElementById('pub-day-grid')

  grid.innerHTML = Array.from({ length: 14 }, (_, i) => {
    const d  = new Date(now); d.setDate(now.getDate() + i)
    const ds = dateToStr(d)
    const dk = DAY_KEYS[d.getDay()]
    const closed  = !s.hours[dk]?.open
    const isToday = ds === today
    return `<div data-pub-day="${ds}" style="background:var(--card);border:2px solid var(--border);border-radius:10px;padding:8px 4px;text-align:center;cursor:${closed?'not-allowed':'pointer'};opacity:${closed?.38:1}">
      <div style="font-size:10px;text-transform:uppercase;font-weight:600;color:var(--muted-fg)">${PT_DAYS_S[d.getDay()]}</div>
      <div style="font-size:16px;font-family:'DM Serif Display',serif;color:${isToday?'var(--primary)':'var(--fg)'}">${d.getDate()}</div>
    </div>`
  }).join('')

  grid.querySelectorAll('[data-pub-day]').forEach(el => {
    if (el.style.opacity === '0.38') return
    el.addEventListener('click', () => pickDay(el.dataset.pubDay))
  })
}

function pickDay(ds) {
  pubDay = ds; pubTime = null
  document.querySelectorAll('[data-pub-day]').forEach(el => {
    el.style.borderColor = el.dataset.pubDay === ds ? 'var(--primary)' : 'var(--border)'
    el.style.background  = el.dataset.pubDay === ds ? 'var(--pri-lt)'  : 'var(--card)'
  })
  renderSlots()
  show('pub-step3')
  document.getElementById('pub-step4').style.display = 'none'
  document.getElementById('pub-step3').scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function renderSlots() {
  const s   = getSettings()
  const d   = new Date(pubDay + 'T00:00')
  const dk  = DAY_KEYS[d.getDay()]
  const h   = s.hours[dk] || { start: '08:00', end: '18:00' }
  const [sh, sm] = h.start.split(':').map(Number)
  const [eh, em] = h.end.split(':').map(Number)
  const startMin = sh*60+sm, endMin = eh*60+em
  const dur = pubSvc?.duration_minutes || 30

  const taken = getAppts().filter(a => a.date === pubDay && a.status !== 'cancelled').map(a => {
    const [ah, am_] = a.time.split(':').map(Number)
    const as_ = ah*60+am_
    const aDur = getSvcs().find(sv => sv.id === a.service_id)?.duration_minutes || 30
    return { start: as_, end: as_+aDur }
  })

  const slots = []
  for (let t = startMin; t+dur <= endMin; t += 30) {
    slots.push({ t, taken: taken.some(tk => t < tk.end && t+dur > tk.start) })
  }

  const slotsEl = document.getElementById('pub-slots')
  slotsEl.innerHTML = slots.map(({ t, taken }) => {
    const label = `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`
    return `<div data-slot="${label}" style="background:var(--card);border:2px solid var(--border);border-radius:9px;padding:8px 14px;cursor:${taken?'not-allowed':'pointer'};font-size:13.5px;font-weight:600;color:${taken?'var(--muted-fg)':'var(--fg2)'};opacity:${taken?.4:1};${taken?'text-decoration:line-through':''}">${label}</div>`
  }).join('')

  slotsEl.querySelectorAll('[data-slot]').forEach(el => {
    if (el.style.opacity === '0.4') return
    el.addEventListener('click', () => pickTime(el.dataset.slot))
  })
}

function pickTime(time) {
  pubTime = time
  document.querySelectorAll('[data-slot]').forEach(el => {
    el.style.borderColor = el.dataset.slot === time ? 'var(--primary)' : 'var(--border)'
    el.style.background  = el.dataset.slot === time ? 'var(--primary)' : 'var(--card)'
    el.style.color       = el.dataset.slot === time ? '#fff'           : 'var(--fg2)'
  })
  document.getElementById('pub-summary').textContent = `📋 ${pubSvc.name} · ${fmtDate(pubDay)} às ${time} · ${fmtMoney(pubSvc.price)}`
  show('pub-step4')
  document.getElementById('pub-step4').scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function confirm() {
  const name  = document.getElementById('pub-cname').value.trim()
  const phone = document.getElementById('pub-cphone').value.trim()
  const notes = document.getElementById('pub-cnotes').value.trim()
  if (!name || !phone) { toast('Informe seu nome e telefone.', 'error'); return }
  if (!pubSvc || !pubDay || !pubTime) { toast('Selecione serviço, data e horário.', 'error'); return }

  let client = getClients().find(c => c.phone === phone)
  if (!client) {
    client = { id: DB.id(), name, phone, email: '', notes: '', created_date: todayStr() }
    const cls = getClients(); cls.push(client); saveClients(cls)
  }

  const appts = getAppts()

  if (pubRescheduleId) {
    const oi = appts.findIndex(a => a.id === pubRescheduleId)
    if (oi > -1) appts[oi].status = 'cancelled'
  }

  appts.push({ id: DB.id(), client_id: client.id, client_name: name, client_phone: phone, service_id: pubSvc.id, service_name: pubSvc.name, date: pubDay, time: pubTime, price: pubSvc.price, notes, status: 'scheduled', created_date: todayStr(), source: pubRescheduleId ? 'rescheduled' : 'public_link' })
  saveAppts(appts)
  updateSidebarStatus()

  const detail = pubRescheduleId
    ? `${pubSvc.name} reagendado para ${fmtDate(pubDay)} às ${pubTime}. Até lá, ${name.split(' ')[0]}!`
    : `${pubSvc.name} em ${fmtDate(pubDay)} às ${pubTime}. Aguardamos você, ${name.split(' ')[0]}!`

  document.getElementById('pub-confirm-detail').textContent = detail
  hide('pub-step1'); hide('pub-step2'); hide('pub-step3'); hide('pub-step4'); hide('pub-manage')
  show('pub-step5')
  document.getElementById('pub-step5').scrollIntoView({ behavior: 'smooth', block: 'start' })
  pubRescheduleId = null
}

function lookupAppts() {
  const phone = document.getElementById('pub-lookup-phone').value.trim()
  const el    = document.getElementById('pub-lookup-result')
  if (!phone) { el.innerHTML = '<p style="font-size:13px;color:var(--red)">Informe um telefone.</p>'; return }

  const appts = getAppts().filter(a => a.client_phone === phone && a.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  if (!appts.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--muted-fg)">Nenhum agendamento ativo encontrado.</p>'
    return
  }

  el.innerHTML = appts.map(a => `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:10px;box-shadow:var(--shadow)">
      <div style="font-weight:700;font-size:15px;color:var(--fg)">${a.service_name}</div>
      <div style="font-size:13px;color:var(--muted-fg);margin-top:5px">📅 ${fmtDate(a.date)} às ${a.time} · ${a.client_name}${a.price > 0 ? ` · <strong>${fmtMoney(a.price)}</strong>` : ''}</div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn btn-outline btn-sm" data-reschedule="${a.id}">📅 Reagendar</button>
        <button class="btn btn-danger btn-sm" data-cancel-appt="${a.id}">✕ Cancelar</button>
      </div>
    </div>`).join('')

  el.querySelectorAll('[data-reschedule]').forEach(b => b.addEventListener('click', () => startReschedule(b.dataset.reschedule)))
  el.querySelectorAll('[data-cancel-appt]').forEach(b => b.addEventListener('click', () => cancelAppt(b.dataset.cancelAppt)))
}

function cancelAppt(id) {
  if (!confirm('Confirma o cancelamento?')) return
  const appts = getAppts()
  const i = appts.findIndex(a => a.id === id)
  if (i > -1) { appts[i].status = 'cancelled'; saveAppts(appts) }
  updateSidebarStatus()
  toast('Agendamento cancelado.', 'warning')
  lookupAppts()
}

function startReschedule(id) {
  pubRescheduleId = id
  const a = getAppts().find(x => x.id === id)
  if (!a) return
  pubSvc = getSvcs().find(s => s.id === a.service_id)
  if (!pubSvc) return

  hide('pub-manage')
  hide('pub-step4')
  hide('pub-step5')
  document.getElementById('pub-step2-title').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    Nova data para: <em style="color:var(--primary)">${pubSvc.name}</em>`

  renderDays()
  show('pub-step2')
  document.getElementById('pub-step3').style.display = 'none'
  document.getElementById('pub-step2').scrollIntoView({ behavior: 'smooth', block: 'start' })

  // pre-fill client name/phone from old appt for step 4
  document.getElementById('pub-cname').value  = a.client_name  || ''
  document.getElementById('pub-cphone').value = a.client_phone || ''
}

function show(id) { document.getElementById(id).style.display = 'block' }
function hide(id) { document.getElementById(id).style.display = 'none'  }
