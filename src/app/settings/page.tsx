import { SettingsShell } from "@/components/settings/SettingsShell"
import { requireAuth } from "@/lib/auth"
import { getSettings } from "@/lib/services/settings"

function getSettingsUserId(session: Awaited<ReturnType<typeof requireAuth>>) {
  const email = session.user?.email?.trim()

  if (!email) {
    throw new Error("Signed-in Microsoft account is missing an email address.")
  }

  return email
}

export default async function SettingsPage() {
  const session = await requireAuth()
  const userId = getSettingsUserId(session)
  const settings = await getSettings(userId)

  return (
    <SettingsShell
      icloudConnected={Boolean(
        process.env.ICLOUD_USERNAME && process.env.ICLOUD_APP_PASSWORD
      )}
      settings={settings}
      userEmail={session.user?.email ?? userId}
      userName={session.user?.name ?? null}
    />
  )
}
