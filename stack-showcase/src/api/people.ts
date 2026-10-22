import { createCollection, simulateNetwork } from "./client"

export type Person = {
  id: number
  name: string
  email: string
  team: "Platform" | "Design" | "Growth" | "Data"
  role: "Engineer" | "Designer" | "PM" | "Analyst"
  status: "active" | "away" | "offline"
  joined: string // ISO date
}

const FIRST = ["Ada", "Linus", "Grace", "Ken", "Margaret", "Dennis", "Barbara", "Alan", "Radia", "Tim", "Frances", "Guido", "Hedy", "Bjarne", "Katherine", "Rasmus"]
const LAST = ["Lovelace", "Torvalds", "Hopper", "Thompson", "Hamilton", "Ritchie", "Liskov", "Kay", "Perlman", "Berners", "Allen", "Rossum", "Lamarr", "Stroustrup", "Johnson", "Lerdorf"]
const TEAMS: Person["team"][] = ["Platform", "Design", "Growth", "Data"]
const ROLES: Person["role"][] = ["Engineer", "Designer", "PM", "Analyst"]
const STATUS: Person["status"][] = ["active", "active", "away", "offline"]

/** Deterministic PRNG so every visitor gets the same seed data. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedPeople(count = 120): Person[] {
  const rand = mulberry32(42)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST)
    const last = pick(LAST)
    const joined = new Date(2019, 0, 1 + Math.floor(rand() * 2400))
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.dev`.toLowerCase(),
      team: pick(TEAMS),
      role: pick(ROLES),
      status: pick(STATUS),
      joined: joined.toISOString().slice(0, 10),
    }
  })
}

const db = createCollection<Person>("people", () => seedPeople())

export const peopleApi = {
  async list(): Promise<Person[]> {
    await simulateNetwork()
    return db.read()
  },
}
