"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { AdminAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import type { GalleryItem, ImageRef, ListMeta } from "@/lib/types"
import {
  PageHeader,
  PrimaryButton,
  GhostButton,
  FormModal,
  Field,
  TextInput,
  Select,
  EmptyState,
  Badge,
} from "@/components/admin/kit"
import { ListToolbar } from "@/components/admin/list-toolbar"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { useAdminListState } from "@/components/admin/use-admin-list-state"
import { ImageUploader } from "@/components/admin/image-uploader"

const CATEGORIES = ["bridal", "mehandi", "makeup", "hair", "skincare", "other"]

export default function GalleryPage() {
  const list = useAdminListState({
    defaultSort: "-createdAt",
    defaultFilters: { category: "" },
  })
  const [items, setItems] = useState<GalleryItem[]>([])
  const [meta, setMeta] = useState<ListMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<{ title: string; category: string; image?: ImageRef; sortOrder: number }>({
    title: "",
    category: "bridal",
    image: undefined,
    sortOrder: 0,
  })

  const load = useCallback(() => {
    setLoading(true)
    AdminAPI.gallery
      .list(list.query)
      .then((r) => {
        setItems(r.data)
        setMeta(r.meta || null)
      })
      .catch(() => {
        setItems([])
        setMeta(null)
      })
      .finally(() => setLoading(false))
  }, [list.query])

  useEffect(() => {
    load()
  }, [load])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image) return toast.error("Upload an image")
    setSaving(true)
    try {
      await AdminAPI.gallery.create(form)
      toast.success("Added to gallery")
      setModalOpen(false)
      setForm({ title: "", category: "bridal", image: undefined, sortOrder: 0 })
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(item: GalleryItem) {
    try {
      await AdminAPI.gallery.update(item._id, { isActive: !item.isActive })
      load()
    } catch {
      toast.error("Update failed")
    }
  }

  async function remove(item: GalleryItem) {
    if (!confirm("Delete this photo?")) return
    try {
      await AdminAPI.gallery.remove(item._id)
      toast.success("Deleted")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  const emptyMsg = list.hasActiveQuery ? "No results." : "No photos yet."

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle={`${meta?.total ?? "—"} photos`}
        action={
          <PrimaryButton onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add photo
          </PrimaryButton>
        }
      />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search title or category…"
        filters={[
          {
            key: "category",
            label: "Category",
            value: list.filters.category || "",
            onChange: (v) => list.setFilter("category", v),
            options: [
              { value: "", label: "All categories" },
              ...CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
            ],
          },
        ]}
      />

      {loading ? (
        <EmptyState message="Loading…" />
      ) : items.length === 0 ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item._id} className="group relative overflow-hidden rounded-2xl border border-border bg-card fmo-shadow">
              <div className="relative aspect-square bg-muted">
                <Image src={item.image.url} alt={item.title || ""} fill className="object-cover" />
                {!item.isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Badge tone="red">Hidden</Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title || "Untitled"}</p>
                  <Badge>{item.category}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(item)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Toggle visibility">
                    {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => remove(item)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationBar meta={meta} onPageChange={list.setPage} />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Add gallery photo">
        <form onSubmit={save} className="space-y-4">
          <Field label="Photo" required>
            <ImageUploader
              images={form.image ? [form.image] : []}
              max={1}
              onChange={(imgs) => setForm({ ...form, image: imgs[0] })}
              folder="famimakeover/gallery"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add photo"}
            </PrimaryButton>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
