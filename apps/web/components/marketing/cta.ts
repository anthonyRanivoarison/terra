export type Cta = { href: string; label: string; short: string }

export const landingCta = (
  signedIn: boolean,
  signUpOpen: boolean,
  repository: string
): Cta =>
  signedIn
    ? { href: "/sites", label: "Open your dashboard", short: "Dashboard" }
    : signUpOpen
      ? {
          href: "/auth/signup",
          label: "Create a free account",
          short: "Start free",
        }
      : { href: repository, label: "Self-host Terra", short: "Self-host" }
