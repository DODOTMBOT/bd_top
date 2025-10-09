import bcrypt from 'bcryptjs'

export function generatePassword(len = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return s
}

export async function hashPassword(p: string) { return await bcrypt.hash(p, 10) }
export async function verifyPassword(p: string, hash: string) { return await bcrypt.compare(p, hash) }



