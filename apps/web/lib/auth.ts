import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins"
import { Pool } from "pg"

export const signUpOpen = process.env.DISABLE_SIGNUP !== "true"

const provider = (id?: string, secret?: string) =>
  id && secret
    ? { clientId: id, clientSecret: secret, disableSignUp: !signUpOpen }
    : null

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
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    disableSignUp: !signUpOpen,
  },
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  socialProviders: {
    ...(github ? { github } : {}),
    ...(google ? { google } : {}),
  },
  plugins: [organization(), nextCookies()],
})
