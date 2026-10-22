import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate, useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import {
  createColumnHelper,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"

import type { Person } from "@/api/people"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { peopleQueryOptions } from "@/queries/people"

// ── URL search params ─────────────────────────────────────────────────────────
// The table's state lives in the URL (?q=ada&sort=name&dir=desc&page=2), so it
// survives reloads and can be shared. validateSearch parses + types it.
const SORTABLE = ["name", "team", "role", "status", "joined"] as const
type SortKey = (typeof SORTABLE)[number]

type PeopleSearch = {
  q?: string
  sort?: SortKey
  dir?: "asc" | "desc"
  page?: number
}

const PAGE_SIZE = 10

export const Route = createFileRoute("/table")({
  validateSearch: (search: Record<string, unknown>): PeopleSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    sort: SORTABLE.includes(search.sort as SortKey) ? (search.sort as SortKey) : undefined,
    dir: search.dir === "desc" ? "desc" : search.dir === "asc" ? "asc" : undefined,
    page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
  }),
  // Runs before render (and on <Link> hover, thanks to defaultPreload: "intent").
  loader: ({ context }) => context.queryClient.ensureQueryData(peopleQueryOptions),
  pendingComponent: TableSkeleton,
  errorComponent: TableError,
  component: TableDemo,
})

// ── Columns ───────────────────────────────────────────────────────────────────
const col = createColumnHelper<Person>()

const statusVariant = { active: "default", away: "secondary", offline: "outline" } as const

const columns = [
  col.accessor("name", {
    header: "Name",
    cell: (info) => (
      <div>
        <div className="font-medium">{info.getValue()}</div>
        <div className="text-muted-foreground text-xs">{info.row.original.email}</div>
      </div>
    ),
  }),
  col.accessor("team", { header: "Team" }),
  col.accessor("role", { header: "Role" }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => <Badge variant={statusVariant[info.getValue()]}>{info.getValue()}</Badge>,
  }),
  col.accessor("joined", {
    header: "Joined",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
]

// ── Page ──────────────────────────────────────────────────────────────────────
function TableDemo() {
  const { data } = useSuspenseQuery(peopleQueryOptions) // already cached by the loader
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const sorting: SortingState = search.sort ? [{ id: search.sort, desc: search.dir === "desc" }] : []
  const pagination: PaginationState = { pageIndex: (search.page ?? 1) - 1, pageSize: PAGE_SIZE }

  const setSearch = (patch: Partial<PeopleSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, globalFilter: search.q ?? "" },
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting)
      setSearch({
        sort: next?.id as SortKey | undefined,
        dir: next ? (next.desc ? "desc" : "asc") : undefined,
        page: undefined,
      })
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination)
      setSearch({ page: next.pageIndex > 0 ? next.pageIndex + 1 : undefined })
    },
    globalFilterFn: "includesString",
    autoResetPageIndex: false, // the URL owns the page index
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const filtered = table.getFilteredRowModel().rows.length

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">TanStack Table + Router</h1>
        <p className="text-muted-foreground text-sm">
          Data is prefetched in the route loader. Search, sort and page live in the URL as typed search
          params — reload or share the link and you land on the same view.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search.q ?? ""}
          onChange={(e) => setSearch({ q: e.target.value || undefined, page: undefined })}
          placeholder="Search people…"
          className="max-w-xs"
          aria-label="Search people"
        />
        <span className="text-muted-foreground text-sm">
          {filtered} of {data.length}
        </span>
        <code className="bg-muted text-muted-foreground ml-auto hidden truncate rounded px-2 py-1 text-xs md:block">
          {JSON.stringify(search)}
        </code>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const dir = header.column.getIsSorted()
                  const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown
                  return (
                    <TableHead key={header.id}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <Icon className={dir ? "" : "opacity-40"} />
                      </Button>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                  No matches.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="text-muted-foreground mr-2">
          Page {pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ChevronLeft /> Prev
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-9 w-80" />
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

function TableError({ error }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <div className="flex items-center justify-between rounded-md border border-dashed p-6 text-sm">
      <span className="text-destructive">Loader failed: {error instanceof Error ? error.message : String(error)}</span>
      {/* invalidate() re-runs the loader for the current route */}
      <Button variant="outline" size="sm" onClick={() => router.invalidate()}>
        Retry
      </Button>
    </div>
  )
}
