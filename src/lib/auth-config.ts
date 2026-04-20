import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

function getRequiredEnv(
  name:
    | "MICROSOFT_CLIENT_ID"
    | "MICROSOFT_CLIENT_SECRET"
    | "MICROSOFT_TENANT_ID"
    | "NEXTAUTH_SECRET",
) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const microsoftScope = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "User.Read",
  "Mail.ReadWrite",
  "Calendars.ReadWrite",
  "Tasks.ReadWrite",
  "Chat.ReadWrite",
  "ChannelMessage.ReadWrite",
].join(" ")

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getRequiredEnv("NEXTAUTH_SECRET"),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    MicrosoftEntraID({
      clientId: getRequiredEnv("MICROSOFT_CLIENT_ID"),
      clientSecret: getRequiredEnv("MICROSOFT_CLIENT_SECRET"),
      issuer: `https://login.microsoftonline.com/${getRequiredEnv("MICROSOFT_TENANT_ID")}/v2.0`,
      authorization: {
        params: {
          scope: microsoftScope,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.expiresAt = token.expiresAt

      return session
    },
  },
})
