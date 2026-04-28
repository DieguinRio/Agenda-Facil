const BADGE_KEY = 'af_new_appts'

export function incrementBadge() {
  const current = Number(localStorage.getItem(BADGE_KEY) || 0)
  localStorage.setItem(BADGE_KEY, current + 1)
  renderBadge()
}

export function clearBadge() {
  localStorage.removeItem(BADGE_KEY)
  renderBadge()
}

export function renderBadge() {
  const count = Number(localStorage.getItem(BADGE_KEY) || 0)
  const badge = document.getElementById('appts-badge')
  if (!badge) return
  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count
    badge.style.display = 'flex'
  } else {
    badge.style.display = 'none'
  }
}
