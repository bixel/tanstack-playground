import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Check, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { tasksQueryOptions, useCreateTask, useDeleteTask, useToggleTask } from "@/queries/tasks"

// No loader here on purpose: this page shows Query's own loading/error states.
// Compare with /table, which prefetches in a route loader.
export const Route = createFileRoute("/query")({
  component: QueryDemo,
})

function QueryDemo() {
  const tasks = useQuery(tasksQueryOptions)
  const create = useCreateTask()
  const toggle = useToggleTask()
  const remove = useDeleteTask()
  const [title, setTitle] = useState("")

  const mutationError = create.error ?? toggle.error ?? remove.error

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">TanStack Query</h1>
        <p className="text-muted-foreground text-sm">
          Add a task (plain mutation), tick or delete one (optimistic). Turn on <em>Flaky network</em>{" "}
          in the header to watch retries and rollbacks.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">status: {tasks.status}</Badge>
            <Badge variant="outline">fetch: {tasks.fetchStatus}</Badge>
            {tasks.dataUpdatedAt > 0 && (
              <span>updated {new Date(tasks.dataUpdatedAt).toLocaleTimeString()}</span>
            )}
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => tasks.refetch()} disabled={tasks.isFetching}>
              <RefreshCw className={cn(tasks.isFetching && "animate-spin")} />
              Refetch
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate(title, { onSuccess: () => setTitle("") })
            }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              aria-label="New task"
            />
            <Button type="submit" disabled={create.isPending || !title.trim()}>
              {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              Add
            </Button>
          </form>

          {mutationError && <p className="text-destructive text-sm">Mutation failed: {mutationError.message}</p>}

          {tasks.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : tasks.isError ? (
            <div className="flex items-center justify-between rounded-md border border-dashed p-4 text-sm">
              <span className="text-destructive">{tasks.error.message}</span>
              <Button size="sm" variant="outline" onClick={() => tasks.refetch()}>
                Try again
              </Button>
            </div>
          ) : tasks.data.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">All clear. Add something above.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {tasks.data.map((task) => (
                <li key={task.id} className="flex items-center gap-3 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggle.mutate(task)}
                    aria-label={task.done ? "Mark as not done" : "Mark as done"}
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                      task.done && "bg-primary border-primary text-primary-foreground",
                    )}
                  >
                    {task.done && <Check className="size-3.5" />}
                  </button>
                  <span className={cn("flex-1 text-sm", task.done && "text-muted-foreground line-through")}>
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => remove.mutate(task.id)}
                    aria-label="Delete task"
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        Open the TanStack logo button (bottom-left) for Query Devtools: inspect the <code>["tasks"]</code> cache entry
        while you click around.
      </p>
    </div>
  )
}
