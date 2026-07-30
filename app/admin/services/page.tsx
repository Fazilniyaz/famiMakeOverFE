"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AdminAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import { formatPrice } from "@/lib/format"
import type { Service, ImageRef, ListMeta } from "@/lib/types"
import {
  PageHeader,
  PrimaryButton,
  GhostButton,
  FormModal,
  Field,
  TextInput,
  TextArea,
  Toggle,
  EmptyState,
  Badge,
} from "@/components/admin/kit"
import { ListToolbar } from "@/components/admin/list-toolbar"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { useAdminListState } from "@/components/admin/use-admin-list-state"
import { ImageUploader } from "@/components/admin/image-uploader"

interface FormState {
  name: string
  shortDescription: string
  description: string
  price: string
  offerPrice: string
  durationMinutes: string
  images: ImageRef[]
  isActive: boolean
  isFeatured: boolean
}
const emptyForm: FormState = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  offerPrice: "",
  durationMinutes: "",
  images: [],
  isActive: true,
  isFeatured: false,
}

const SORT_OPTS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
]

export default function ServicesPage() {
  const list = useAdminListState({ defaultFilters: { featured: "" } })
  const [items, setItems] = useState<Service[]>([])
  const [meta, setMeta] = useState<ListMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    AdminAPI.services
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

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }
  function openEdit(s: Service) {
    setEditing(s)
    setForm({
      name: s.name,
      shortDescription: s.shortDescription || "",
      description: s.description || "",
      price: String(s.price),
      offerPrice: s.offerPrice != null ? String(s.offerPrice) : "",
      durationMinutes: s.durationMinutes != null ? String(s.durationMinutes) : "",
      images: s.images || [],
      isActive: s.isActive,
      isFeatured: s.isFeatured,
    })
    setModalOpen(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        name: form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        images: form.images,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      }
      if (editing) await AdminAPI.services.update(editing._id, body)
      else await AdminAPI.services.create(body)
      toast.success(editing ? "Service updated" : "Service created")
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(s: Service) {
    if (!confirm(`Delete "${s.name}"?`)) return
    try {
      await AdminAPI.services.remove(s._id)
      toast.success("Deleted")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  const emptyMsg = list.hasActiveQuery ? "No results." : "No services yet."

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle={`${meta?.total ?? "—"} services`}
        action={
          <PrimaryButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add service
          </PrimaryButton>
        }
      />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search services…"
        filters={[
          {
            key: "featured",
            label: "Featured",
            value: list.filters.featured || "",
            onChange: (v) => list.setFilter("featured", v),
            options: [
              { value: "", label: "All" },
              { value: "1", label: "Featured only" },
            ],
          },
        ]}
        sort={{ value: list.sort, options: SORT_OPTS, onChange: list.setSort }}
      />

      {loading ? (
        <EmptyState message="Loading…" />
      ) : items.length === 0 ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <div key={s._id} className="overflow-hidden rounded-2xl border border-border bg-card fmo-shadow">
              <div className="relative aspect-[4/3] bg-muted">
                {s.images?.[0]?.url && <Image src={s.images[0].url} alt="" fill className="object-cover" />}
                <div className="absolute right-2 top-2 flex gap-1">
                  {s.isFeatured && <Badge tone="amber">Featured</Badge>}
                  {!s.isActive && <Badge tone="red">Hidden</Badge>}
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">{s.shortDescription}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    <span className="font-medium text-foreground">{formatPrice(s.offerPrice ?? s.price)}</span>
                    {s.offerPrice != null && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">{formatPrice(s.price)}</span>
                    )}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationBar meta={meta} onPageChange={list.setPage} />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Service" : "Add Service"} wide>
        <form onSubmit={save} className="space-y-4">
          <Field label="Name" required>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Short description">
            <TextInput value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₹)" required>
              <TextInput type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Offer price (₹)">
              <TextInput type="number" value={form.offerPrice} onChange={(e) => setForm({ ...form, offerPrice: e.target.value })} />
            </Field>
            <Field label="Duration (min)">
              <TextInput type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </Field>
          </div>
          <Field label="Images" hint="Up to 3 images">
            <ImageUploader images={form.images} max={3} onChange={(imgs) => setForm({ ...form, images: imgs })} folder="famimakeover/services" />
          </Field>
          <Field label="Full description">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="flex items-center gap-6">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            <Toggle checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} label="Featured" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save service"}
            </PrimaryButton>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
