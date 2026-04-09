import { ROLES } from '../utils/constants.js'

export function canAccess(routeKey, role) {
  if (!role) return false

  const teacherAllowed = new Set(['dashboard', 'students', 'attendance', 'fees', 'reports'])

  if (role === ROLES.admin) return true
  if (role === ROLES.teacher) return teacherAllowed.has(routeKey)

  return false
}

