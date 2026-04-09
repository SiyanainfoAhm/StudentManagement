import { format } from 'date-fns'

export function formatDate(dateLike, pattern = 'dd MMM yyyy') {
  if (!dateLike) return '—'
  try {
    return format(new Date(dateLike), pattern)
  } catch {
    return '—'
  }
}

export function formatMoneyINR(amount) {
  const n = Number(amount ?? 0)
  if (!Number.isFinite(n)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

