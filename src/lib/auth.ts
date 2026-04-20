import { redirect } from "next/navigation"

import { auth, signIn, signOut } from "@/lib/auth-config"

export { auth, signIn, signOut }

export async function getSession() {
  return auth()
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}
