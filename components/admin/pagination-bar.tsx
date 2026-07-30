"use client"

import type { ListMeta } from "@/lib/types"
import { GhostButton } from "@/components/admin/kit"

export function PaginationBar({
  meta,
  onPageChange,
}: {
  meta?: ListMeta | null
  onPageChange: (page: number) => void
}) {
  if (!meta || meta.pages <= 1) {
    if (meta && meta.total > 0) {
      return (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {meta.total} total
        </p>
      )
    }
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {meta.pages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <GhostButton
          type="button"
          disabled={!meta.hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
          className="px-4 py-2"
        >
          Previous
        </GhostButton>
        <GhostButton
          type="button"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
          className="px-4 py-2"
        >
          Next
        </GhostButton>
      </div>
    </div>
  )
}

/** Build a ListMeta-like object for client-side pagination. */
export function clientMeta(total: number, page: number, limit: number): ListMeta {
  const pages = Math.max(1, Math.ceil(total / limit) || 1)
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  }
}
