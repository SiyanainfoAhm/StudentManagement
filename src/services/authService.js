import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'
import { verifyPassword } from '../utils/password.js'

function sanitizeUser(userRow) {
  if (!userRow) return null
  // never keep password_hash in session
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = userRow
  return safe
}

export async function loginWithEmailPassword({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPassword = password || ''

  const { data, error } = await supabase
    .from(TABLES.users)
    .select('*')
    .eq('email', cleanEmail)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Invalid email or password.')
  if (!data.is_active) throw new Error('This account is inactive.')

  const ok = await verifyPassword(cleanPassword, data.password_hash)
  if (!ok) throw new Error('Invalid email or password.')

  return sanitizeUser(data)
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from(TABLES.users)
    .select(
      'id, name, first_name, last_name, email, mobile, role, is_active, created_at, updated_at'
    )
    .eq('id', id)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data || null
}

