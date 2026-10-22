/**
 * In-client "backend".
 *
 * Everything the app treats as a server lives here: a tiny persisted store
 * (localStorage) plus simulated network latency and optional random failures.
 * Swap any function in src/api/* for a real `fetch()` call later — the
 * TanStack Query layer above it doesn't need to change.
 */

const LATENCY_MS = { min: 250, max: 750 }
const FLAKY_KEY = "api:flaky"

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ApiError"
  }
}

export const network = {
  get flaky() {
    return safeGet(FLAKY_KEY) === "1"
  },
  set flaky(on: boolean) {
    safeSet(FLAKY_KEY, on ? "1" : "0")
  },
}

/** Await this at the start of every API function. */
export async function simulateNetwork() {
  const ms = LATENCY_MS.min + Math.random() * (LATENCY_MS.max - LATENCY_MS.min)
  await new Promise((r) => setTimeout(r, ms))
  if (network.flaky && Math.random() < 0.5) {
    throw new ApiError("503 · Simulated network failure")
  }
}

/** A JSON collection persisted in localStorage, seeded on first use. */
export function createCollection<T>(key: string, seed: () => T[]) {
  const storageKey = `db:${key}`
  return {
    read(): T[] {
      const raw = safeGet(storageKey)
      if (raw) {
        try {
          return JSON.parse(raw) as T[]
        } catch {
          /* fall through to seed */
        }
      }
      const initial = seed()
      safeSet(storageKey, JSON.stringify(initial))
      return initial
    },
    write(rows: T[]) {
      safeSet(storageKey, JSON.stringify(rows))
    },
    reset() {
      safeRemove(storageKey)
    },
  }
}

export function resetAllData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("db:"))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* storage unavailable */
  }
}

// localStorage can throw (private mode, blocked storage) — never let that crash the app.
const memory = new Map<string, string>()
function safeGet(k: string) {
  try {
    return localStorage.getItem(k)
  } catch {
    return memory.get(k) ?? null
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v)
  } catch {
    memory.set(k, v)
  }
}
function safeRemove(k: string) {
  try {
    localStorage.removeItem(k)
  } catch {
    memory.delete(k)
  }
}
