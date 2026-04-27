import { getAppts, getSvcs } from '../lib/db.js'
import { PT_MONTHS, PT_DAYS_S, DAY_KEYS, todayStr, dateToStr } from '../lib/helpers.js'
import { openApptModal } from '../components/apptModal.js'

let weekOffset = 0
const CAL_START = 7
const CAL_END   = 20

export function renderCalendar() {
  const el = document.getElementById('page-calendar')
  el.innerHTML = `
    <div class="row-between mb20">
      <div>
        <h1 class="page-title">Agenda Semanal</h1>
        <p class="page-sub">Clique num horário vazio para agendar</p>
      </div>
      <button class="btn btn-primary" id="cal-new-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo
      </button>
    </div>
    <div id="cal-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <button class="cal-nav-btn" id="cal-prev">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Anterior
      </button>
      <span id="cal-week-label" style="font-family:'DM Serif Display',serif;font-size:17px;color:var(--fg)"></span>
      <div style="display:flex;gap:8px">
        <button class="cal-nav-btn" id="cal-today">Hoje</button>
        <button class="cal-nav-btn" id="cal-next">
          Próxima
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
    <div class="cal-grid-wrap"><div class="cal-grid" id="cal-grid"></div></div>
    <div class="cal-legend" style="margin-top:10px;display:flex;gap:14px;flex-wrap:wrap">
      <span style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--fg2)"><span style="width:8px;height:8px;border-radius:50%;background:var(--primary);display:inline-block"></span> Agendado</span>
      <span style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--fg2)"><span style="width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block"></span> Concluído</span>
      <span style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--fg2)"><span style="width:8px;height:8px;border-radius:50%;background:var(--muted-fg);display:inline-block"></span> Cancelado</span>
    </div>`

  document.getElementById('cal-new-btn').addEventListener('click', () => openApptModal())
  document.getElementById('cal-prev').addEventListener('click',  () => { weekOffset--; drawGrid() })
  document.getElementById('cal-next').addEventListener('click',  () => { weekOffset++; drawGrid() })
  document.getElementById('cal-today').addEventListener('click', () => { weekOffset = 0; drawGrid() })

  drawGrid()
}

function getWeekDates(offset = 0) {
  const now = new Date()
  const dow = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - dow + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

function drawGrid() {
  const days  = getWeekDates(weekOffset)
  const today = todayStr()
  const appts = getAppts()
  const svcs  = getSvcs()

  // update label
  const first = days[0], last = days[6]
  document.getElementById('cal-week-label').textContent =
    `${String(first.getDate()).padStart(2,'0')} ${PT_MONTHS[first.getMonth()].slice(0,3)} – ${String(last.getDate()).padStart(2,'0')} ${PT_MONTHS[last.getMonth()].slice(0,3)} ${last.getFullYear()}`

  const hours = []
  for (let h = CAL_START; h <= CAL_END; h++) hours.push(h)

  let html = ''

  // time column
  html += `<div class="cal-time-col"><div class="cal-day-header" style="border-bottom:1px solid var(--border);min-height:62px"></div>`
  hours.forEach(h => { html += `<div class="cal-time-cell">${String(h).padStart(2,'0')}h</div>` })
  html += '</div>'

  // day columns
  days.forEach(day => {
    const ds = dateToStr(day)
    const isToday = ds === today
    html += `<div class="cal-day-col"><div class="cal-day-header${isToday ? ' today' : ''}"><div class="dow">${PT_DAYS_S[day.getDay()]}</div><div class="dom">${day.getDate()}</div></div>`

    hours.forEach(h => {
      const slotTime = `${String(h).padStart(2,'0')}:00`
      html += `<div class="cal-slot" data-date="${ds}" data-time="${slotTime}" style="position:relative">`
      appts.filter(a => a.date === ds && a.time === slotTime).forEach(a => {
        const dur = svcs.find(s => s.id === a.service_id)?.duration_minutes || 45
        const heightPct = (dur / 60) * 100
        html += `<button class="cal-event ${a.status}" data-appt-id="${a.id}" style="top:1px;height:calc(${heightPct}% * 0.9)">
          ${a.service_name}<br/><span style="font-weight:400;opacity:.8">${a.client_name.split(' ')[0]}</span>
        </button>`
      })
      html += '</div>'
    })
    html += '</div>'
  })

  const grid = document.getElementById('cal-grid')
  grid.innerHTML = html

  // bind slot clicks
  grid.querySelectorAll('.cal-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (e.target.closest('.cal-event')) return
      openApptModal(null, slot.dataset.date, slot.dataset.time)
    })
  })

  // bind event clicks
  grid.querySelectorAll('.cal-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      openApptModal(btn.dataset.apptId)
    })
  })
}
