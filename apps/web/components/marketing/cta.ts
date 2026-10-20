export const ctaHref = (signedIn: boolean) =>
  signedIn ? "/sites" : "/auth/signup"

export const ctaLabel = (signedIn: boolean) =>
  signedIn ? "Open your dashboard" : "Start for free"
