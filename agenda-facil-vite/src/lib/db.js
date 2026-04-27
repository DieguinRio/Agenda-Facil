// ─── localStorage wrapper ────────────────────────────────────
export const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]') }
    catch { return [] }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  },
}

// ─── Shortcuts ───────────────────────────────────────────────
export const getAppts    = ()  => DB.get('af_appointments')
export const getSvcs     = ()  => DB.get('af_services')
export const getClients  = ()  => DB.get('af_clients')
export const saveAppts   = (d) => DB.set('af_appointments', d)
export const saveSvcs    = (d) => DB.set('af_services', d)
export const saveClients = (d) => DB.set('af_clients', d)

// ─── Settings ────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  bizName: 'Studio Beleza',
  bizType: 'Salão de Beleza',
  phone: '(11) 98765-0000',
  address: '',
  instagram: '',
  facebook: '',
  twitter: '',
  hours: {
    seg: { open: true,  start: '08:00', end: '18:00' },
    ter: { open: true,  start: '08:00', end: '18:00' },
    qua: { open: true,  start: '08:00', end: '18:00' },
    qui: { open: true,  start: '08:00', end: '18:00' },
    sex: { open: true,  start: '08:00', end: '18:00' },
    sab: { open: true,  start: '08:00', end: '13:00' },
    dom: { open: false, start: '08:00', end: '12:00' },
  },
}

export function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('af_settings') || '{}') }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettingsData(data) {
  localStorage.setItem('af_settings', JSON.stringify({ ...getSettings(), ...data }))
}
