import { cookies } from 'next/headers'

export async function isAdminSession(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  try {
    const store = await cookies()
    return store.get('csm_admin')?.value === secret
  } catch {
    return false
  }
}
