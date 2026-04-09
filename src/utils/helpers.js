export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function initials(firstName = '', lastName = '') {
  const a = (firstName || '').trim().slice(0, 1).toUpperCase()
  const b = (lastName || '').trim().slice(0, 1).toUpperCase()
  return `${a}${b}`.trim() || '—'
}

export function safeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

