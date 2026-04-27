import { getSettings, saveSettingsData } from '../lib/db.js'
import { toast } from '../lib/helpers.js'
import { updateSidebarProfile } from '../components/sidebar.js'
import { openPublicPage } from './public.js'

const DAY_LABELS = { seg:'Segunda', ter:'Terça', qua:'Quarta', qui:'Quinta', sex:'Sexta', sab:'Sábado', dom:'Domingo' }
const DAY_ORDER  = ['seg','ter','qua','qui','sex','sab','dom']

export function renderSettings() {
  const s  = getSettings()
  const el = document.getElementById('page-settings')
  const slug = (s.bizName || 'meu-negocio').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')

  el.innerHTML = `
    <div class="row-between mb24">
      <div><h1 class="page-title">Meu Negócio</h1><p class="page-sub">Configure o perfil e o link público</p></div>
      <button class="btn btn-primary" id="set-save-btn">Salvar</button>
    </div>
    <div style="max-width:560px;display:flex;flex-direction:column;gap:16px">

      <div class="card">
        <div class="ftitle" style="margin-bottom:14px">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Perfil do Negócio
        </div>
        <div class="gap-sm">
          <div class="form-group"><label>Nome do Negócio *</label><input type="text" id="set-biz-name" value="${s.bizName||''}" placeholder="Ex: Studio Beleza da Maria"/></div>
          <div class="form-group"><label>Tipo / Especialidade</label><input type="text" id="set-biz-type" value="${s.bizType||''}" placeholder="Ex: Salão de Beleza, Barbearia…"/></div>
          <div class="form-group"><label>Telefone / WhatsApp</label><input type="text" id="set-phone" value="${s.phone||''}" placeholder="(00) 00000-0000"/></div>
          <div class="form-group"><label>Endereço</label><input type="text" id="set-address" value="${s.address||''}" placeholder="Rua, número — Bairro, Cidade"/></div>
        </div>
      </div>

      <div class="card">
        <div class="ftitle" style="margin-bottom:14px">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg>
          Redes Sociais do seu Negócio
        </div>
        <p style="font-size:13px;color:var(--fg2);margin-bottom:14px">Aparecem na página de agendamento que seus clientes veem.</p>
        <div class="gap-sm">
          <div class="form-group"><label>Instagram</label><input type="url" id="set-instagram" value="${s.instagram||''}" placeholder="https://instagram.com/seunegocio"/></div>
          <div class="form-group"><label>Facebook</label><input type="url" id="set-facebook" value="${s.facebook||''}" placeholder="https://facebook.com/seunegocio"/></div>
          <div class="form-group"><label>Twitter / X</label><input type="url" id="set-twitter" value="${s.twitter||''}" placeholder="https://twitter.com/seunegocio"/></div>
        </div>
      </div>

      <div class="card">
        <div class="ftitle" style="margin-bottom:14px">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Link de Agendamento
        </div>
        <div style="background:var(--muted);border-radius:9px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <span style="font-size:13px;color:var(--fg2);font-weight:500">agendafacil.app/${slug}</span>
          <button class="btn btn-primary btn-sm" id="set-pub-preview">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Visualizar como cliente
          </button>
        </div>
        <div style="margin-top:12px;padding:12px;background:var(--amb-lt);border-radius:9px;font-size:12.5px;color:var(--amber);font-weight:500">
          💡 Em produção, cada negócio teria um link único. Nesta demo, o botão abre a visualização simulada.
        </div>
      </div>

      <div class="card">
        <div class="ftitle" style="margin-bottom:14px">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--primary)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Horário de Funcionamento
        </div>
        <div id="hours-grid" style="display:flex;flex-direction:column;gap:8px">
          ${DAY_ORDER.map(d => {
            const h = s.hours[d] || { open: false, start: '08:00', end: '18:00' }
            return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
              <label class="switch" style="flex-shrink:0">
                <input type="checkbox" class="hr-open" data-day="${d}" ${h.open ? 'checked' : ''}/>
                <div class="switch-track"></div><div class="switch-thumb"></div>
              </label>
              <span style="width:72px;font-size:13px;font-weight:600;color:var(--fg2)">${DAY_LABELS[d]}</span>
              <div class="hr-fields" data-day="${d}" style="display:flex;align-items:center;gap:6px;${h.open ? '' : 'opacity:.35;pointer-events:none'}">
                <input type="time" class="hr-start" data-day="${d}" value="${h.start}" style="width:100px;padding:5px 8px;font-size:12.5px"/>
                <span style="font-size:12px;color:var(--muted-fg)">até</span>
                <input type="time" class="hr-end" data-day="${d}" value="${h.end}" style="width:100px;padding:5px 8px;font-size:12.5px"/>
              </div>
            </div>`
          }).join('')}
        </div>
      </div>
    </div>`

  document.getElementById('set-save-btn').addEventListener('click', save)
  document.getElementById('set-pub-preview')?.addEventListener('click', openPublicPage)

  document.querySelectorAll('.hr-open').forEach(cb => {
    cb.addEventListener('change', () => {
      const fields = document.querySelector(`.hr-fields[data-day="${cb.dataset.day}"]`)
      if (fields) { fields.style.opacity = cb.checked ? '1' : '0.35'; fields.style.pointerEvents = cb.checked ? 'auto' : 'none' }
    })
  })
}

function save() {
  const hours = {}
  document.querySelectorAll('.hr-open').forEach(cb => {
    const d = cb.dataset.day
    hours[d] = {
      open:  cb.checked,
      start: document.querySelector(`.hr-start[data-day="${d}"]`)?.value || '08:00',
      end:   document.querySelector(`.hr-end[data-day="${d}"]`)?.value   || '18:00',
    }
  })
  saveSettingsData({
    bizName:   document.getElementById('set-biz-name')?.value.trim(),
    bizType:   document.getElementById('set-biz-type')?.value.trim(),
    phone:     document.getElementById('set-phone')?.value.trim(),
    address:   document.getElementById('set-address')?.value.trim(),
    instagram: document.getElementById('set-instagram')?.value.trim(),
    facebook:  document.getElementById('set-facebook')?.value.trim(),
    twitter:   document.getElementById('set-twitter')?.value.trim(),
    hours,
  })
  toast('Configurações salvas!')
  updateSidebarProfile()
}
