import { queryOptions } from "@tanstack/react-query"

import { peopleApi } from "@/api/people"

export const peopleQueryOptions = queryOptions({
  queryKey: ["people"],
  queryFn: peopleApi.list,
  staleTime: 5 * 60_000, // directory data barely changes
})
