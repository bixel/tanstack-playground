import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Layers } from "lucide-react"

import { NetworkToggle } from "@/components/network-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

type RouterContext = { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="text-muted-foreground">Nothing lives at this URL.</p>
      <Button asChild variant="link">
        <Link to="/">Back home</Link>
      </Button>
    </div>
  ),
})

const nav = [
  { to: "/", label: "Overview" },
  { to: "/query", label: "Query" },
  { to: "/table", label: "Table" },
] as const

function RootLayout() {
  return (
    <div className="min-h-svh">
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Layers className="size-5" />
            <span className="hidden sm:inline">Stack Showcase</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 transition-colors"
                activeProps={{ className: "bg-accent text-foreground!" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NetworkToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>

      {/* Both devtools are stripped from production builds automatically. */}
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  )
}
