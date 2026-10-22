import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, RotateCcw } from "lucide-react"

import { resetAllData } from "@/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/")({
  component: Overview,
})

const layers = [
  {
    name: "TanStack Router",
    role: "Routing",
    what: "File-based, fully typesafe routes. Loaders prefetch data, search params are validated and typed.",
    where: "src/routes/*",
    demo: "/table",
  },
  {
    name: "TanStack Query",
    role: "Server state",
    what: "Caching, background refetch, retries, mutations and optimistic updates against any async function.",
    where: "src/queries/*",
    demo: "/query",
  },
  {
    name: "TanStack Table",
    role: "Data grids",
    what: "Headless table logic — sorting, filtering, pagination — rendered with shadcn's <Table>.",
    where: "src/routes/table.tsx",
    demo: "/table",
  },
  {
    name: "shadcn/ui + Tailwind v4",
    role: "UI",
    what: "Components copied into your repo, styled by CSS variables. Add more with npx shadcn add.",
    where: "src/components/ui/*",
  },
  {
    name: "In-client API",
    role: "Backend",
    what: "A fake server in the browser: localStorage persistence, latency, optional failures.",
    where: "src/api/*",
  },
  {
    name: "React 19 + Vite + TS",
    role: "Foundation",
    what: "Client-only SPA. Instant dev server, strict TypeScript, @/ import alias.",
    where: "vite.config.ts",
  },
] as const

function Overview() {
  const qc = useQueryClient()

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Badge variant="secondary">Client-only starter</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          React · TanStack · shadcn/ui
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          A minimal, reusable base to learn the stack and play. Each card names the layer, what it's
          responsible for, and the folder where it lives.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild>
            <Link to="/query">
              Try the Query demo <ArrowRight />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetAllData()
              qc.clear()
            }}
          >
            <RotateCcw /> Reset demo data
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {layers.map((l) => (
          <Card key={l.name} className="gap-3">
            <CardHeader>
              <CardDescription className="text-xs tracking-wide uppercase">{l.role}</CardDescription>
              <CardTitle>{l.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 text-sm">
              <p className="text-muted-foreground flex-1">{l.what}</p>
              <div className="flex items-center justify-between gap-2">
                <code className="bg-muted rounded px-1.5 py-0.5 text-xs">{l.where}</code>
                {"demo" in l && (
                  <Link to={l.demo} className="text-sm font-medium underline-offset-4 hover:underline">
                    Demo →
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="text-muted-foreground space-y-1 text-sm">
        <p className="text-foreground font-medium">How data flows</p>
        <p>
          Component → <code>useQuery(options)</code> → <code>src/queries</code> →{" "}
          <code>src/api</code> (fake server) → localStorage. Replace an API function with{" "}
          <code>fetch()</code> and nothing above it changes.
        </p>
      </section>
    </div>
  )
}
