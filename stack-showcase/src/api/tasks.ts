import { ApiError, createCollection, simulateNetwork } from "./client"

export type Task = {
  id: string
  title: string
  done: boolean
  createdAt: number
}

const db = createCollection<Task>("tasks", () => [
  { id: "t1", title: "Read the TanStack Query overview", done: true, createdAt: Date.now() - 3e5 },
  { id: "t2", title: "Add a route in src/routes", done: false, createdAt: Date.now() - 2e5 },
  { id: "t3", title: "Restyle a shadcn component", done: false, createdAt: Date.now() - 1e5 },
])

export const tasksApi = {
  async list(): Promise<Task[]> {
    await simulateNetwork()
    return db.read().sort((a, b) => b.createdAt - a.createdAt)
  },

  async create(title: string): Promise<Task> {
    await simulateNetwork()
    const trimmed = title.trim()
    if (!trimmed) throw new ApiError("422 · Title is required")
    const task: Task = { id: crypto.randomUUID(), title: trimmed, done: false, createdAt: Date.now() }
    db.write([...db.read(), task])
    return task
  },

  async update(id: string, patch: Partial<Omit<Task, "id">>): Promise<Task> {
    await simulateNetwork()
    const rows = db.read()
    const current = rows.find((t) => t.id === id)
    if (!current) throw new ApiError("404 · Task not found")
    const next = { ...current, ...patch }
    db.write(rows.map((t) => (t.id === id ? next : t)))
    return next
  },

  async remove(id: string): Promise<void> {
    await simulateNetwork()
    db.write(db.read().filter((t) => t.id !== id))
  },
}
