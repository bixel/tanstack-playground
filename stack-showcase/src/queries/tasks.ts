import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"

import { tasksApi, type Task } from "@/api/tasks"

/**
 * One place that defines the key + fetcher. Reuse it in useQuery,
 * useSuspenseQuery, route loaders (ensureQueryData) and cache updates.
 */
export const tasksQueryOptions = queryOptions({
  queryKey: ["tasks"],
  queryFn: tasksApi.list,
})

/** Plain mutation: wait for the server, then refetch the list. */
export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => tasksApi.create(title),
    onSettled: () => qc.invalidateQueries({ queryKey: tasksQueryOptions.queryKey }),
  })
}

/** Optimistic mutation: update the cache immediately, roll back on error. */
export function useToggleTask() {
  const qc = useQueryClient()
  const key = tasksQueryOptions.queryKey

  return useMutation({
    mutationFn: (task: Task) => tasksApi.update(task.id, { done: !task.done }),
    onMutate: async (task) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData(key) // typed as Task[] | undefined, thanks to queryOptions
      qc.setQueryData(key, (old) => old?.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
      return { previous }
    },
    onError: (_err, _task, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  const key = tasksQueryOptions.queryKey

  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData(key)
      qc.setQueryData(key, (old) => old?.filter((t) => t.id !== id))
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
