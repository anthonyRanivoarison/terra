import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins"
import { Pool } from "pg"

const provider = (id?: string, secret?: string) =>
  id && secret ? { clientId: id, clientSecret: secret } : null

const github = provider(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET
)
const google = provider(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

export type SocialProvider = "github" | "google"

export const socialProviders: SocialProvider[] = [
  ...(github ? (["github"] as const) : []),
  ...(google ? (["google"] as const) : []),
]

export const auth = betterAuth({
  appName: "Terra",
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  socialProviders: {
    ...(github ? { github } : {}),
    ...(google ? { google } : {}),
  },
  plugins: [organization(), nextCookies()],
})
