const ADJECTIVES = [
  "Coral",
  "Amber",
  "Silent",
  "Swift",
  "Lunar",
  "Mossy",
  "Golden",
  "Misty",
  "Brave",
  "Clever",
  "Velvet",
  "Cosmic",
  "Rusty",
  "Sunny",
  "Frosty",
  "Olive",
]

const ANIMALS = [
  "Fox",
  "Lemur",
  "Otter",
  "Heron",
  "Panda",
  "Gecko",
  "Lynx",
  "Koala",
  "Falcon",
  "Tapir",
  "Orca",
  "Ibex",
  "Zebu",
  "Fossa",
  "Crane",
  "Bison",
]

export const INK = "#141821"

const BACKGROUNDS = [
  "#e8ecfb",
  "#fde7e4",
  "#e3eefc",
  "#e4f4ea",
  "#fcf1dd",
  "#ece7fa",
  "#f6e6f0",
  "#e2f3f3",
]
const SKIN = ["#ffffff", "#fbe3cf", "#f1c9a5", "#d9a37c", "#a8714f", "#7a4b33"]
const HAIR = ["#8a8a8a", "#1f1f1f", "#b5b5b5", "#5c5c5c", "#b4563a", "#d9b06b"]
const SHIRTS = [
  "#141821",
  "#f4f4f4",
  "#9fc3f7",
  "#f2b8a2",
  "#b9dfc3",
  "#d8c8f3",
]

export const hash = (value: string) => {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const pick = <T>(list: T[], n: number) => list[n % list.length]!

export const visitorName = (id: string) => {
  const h = hash(id)
  return `${pick(ADJECTIVES, h)} ${pick(ANIMALS, h >>> 5)}`
}

export type Traits = {
  bg: string
  skin: string
  hairStyle: number
  hairColor: string
  eyes: number
  brows: number
  mouth: number
  blush: boolean
  extra: number
  shirt: string
  tilt: number
}

export const traits = (id: string): Traits => {
  const a = hash(id)
  const b = hash(`${id}:face`)
  return {
    bg: pick(BACKGROUNDS, a),
    skin: pick(SKIN, b >>> 15),
    hairStyle: (a >>> 3) % 8,
    hairColor: pick(HAIR, a >>> 6),
    eyes: (a >>> 9) % 6,
    brows: (a >>> 12) % 3,
    mouth: (b >>> 1) % 4,
    blush: (b >>> 4) % 3 !== 0,
    extra: (b >>> 6) % 7,
    shirt: pick(SHIRTS, b >>> 9),
    tilt: ((b >>> 12) % 9) - 4,
  }
}
