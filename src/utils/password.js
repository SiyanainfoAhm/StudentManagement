import bcrypt from 'bcryptjs'

/**
 * Demo-friendly bcrypt helpers.
 * We hash on the client ONLY because this MVP uses no Supabase Auth and no server.
 */
export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(plain, salt)
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

