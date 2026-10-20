// Pure helpers for dates, seat math and member status.
// Kept dependency-free (no date-fns) since the date math here is simple
// day-difference arithmetic on `YYYY-MM-DD` strings from Postgres.

export const TOTAL_SEATS = 89

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Whole-day difference between two YYYY-MM-DD strings (b - a), ignoring
// time-of-day/timezone by parsing as UTC midnight for both.
export function daysBetween(aISO, bISO) {
  const a = new Date(aISO + 'T00:00:00Z').getTime()
  const b = new Date(bISO + 'T00:00:00Z').getTime()
  return Math.round((b - a) / 86400000)
}

export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatSeat(seatNo) {
  return String(seatNo).padStart(2, '0')
}

// EXPIRING_SOON_DAYS mirrors the "configurable setting" idea from the spec;
// hardcoded here since there's no settings table in the existing schema.
export const EXPIRING_SOON_DAYS = 7

/**
 * Derives a member's lifecycle status purely from `expiry_date` vs today.
 * Never stored — always computed at read time, per the design doc.
 */
export function getMemberStatus(member, today = todayISO()) {
  const daysLeft = daysBetween(today, member.expiry_date)
  if (daysLeft < 0) {
    return { code: 'EXPIRED', label: 'Expired', overdueDays: -daysLeft }
  }
  if (daysLeft <= EXPIRING_SOON_DAYS) {
    return { code: 'EXPIRING_SOON', label: 'Expiring soon', daysLeft }
  }
  return { code: 'ACTIVE', label: 'Active', daysLeft }
}

export function statusColor(code) {
  switch (code) {
    case 'ACTIVE':
      return '#1f9d55' // green
    case 'EXPIRING_SOON':
      return '#d97706' // amber
    case 'EXPIRED':
      return '#dc2626' // red
    default:
      return '#6b7280'
  }
}
