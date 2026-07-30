"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AdminAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import type { ProductType, ImageRef } from "@/lib/types"
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
import { PaginationBar, clientMeta } from "@/components/admin/pagination-bar"
import { useAdminListState } from "@/components/admin/use-admin-list-state"
import { ImageUploader } from "@/components/admin/image-uploader"

const empty = { name: "", description: "", image: undefined as ImageRef | undefined, isActive: true, sortOrder: 0 }

export default function ProductTypesPage() {
  const list = useAdminListState({ defaultLimit: 12, defaultFilters: { active: "" } })
  const [items, setItems] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductType | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () =>
    AdminAPI.productTypes.list().then(setItems).catch(() => {}).finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    let rows = items
    const q = list.search.toLowerCase()
    if (q) {
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          (t.slug || "").toLowerCase().includes(q),
      )
    }
    if (list.filters.active === "1") rows = rows.filter((t) => t.isActive)
    if (list.filters.active === "0") rows = rows.filter((t) => !t.isActive)
    return rows
  }, [items, list.search, list.filters.active])

  const meta = clientMeta(filtered.length, list.page, list.limit)
  const pageRows = filtered.slice((list.page - 1) * list.limit, list.page * list.limit)

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setModalOpen(true)
  }
  function openEdit(t: ProductType) {
    setEditing(t)
    setForm({
      name: t.name,
      description: t.description || "",
      image: t.image,
      isActive: t.isActive,
      sortOrder: t.sortOrder || 0,
    })
    setModalOpen(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { ...form, image: form.image || undefined }
      if (editing) await AdminAPI.productTypes.update(editing._id, body)
      else await AdminAPI.productTypes.create(body)
      toast.success(editing ? "Type updated" : "Type created")
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(t: ProductType) {
    if (!confirm(`Delete "${t.name}"?`)) return
    try {
      await AdminAPI.productTypes.remove(t._id)
      toast.success("Deleted")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  const emptyMsg = list.hasActiveQuery ? "No results." : "No product types yet. Add your first one."

  return (
    <div>
      <PageHeader
        title="Product Types"
        subtitle={`${filtered.length} types`}
        action={
          <PrimaryButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add type
          </PrimaryButton>
        }
      />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search types…"
        filters={[
          {
            key: "active",
            label: "Status",
            value: list.filters.active || "",
            onChange: (v) => list.setFilter("active", v),
            options: [
              { value: "", label: "All" },
              { value: "1", label: "Active only" },
              { value: "0", label: "Hidden only" },
            ],
          },
        ]}
      />

      {loading ? (
        <EmptyState message="Loading…" />
      ) : pageRows.length === 0 ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageRows.map((t) => (
            <div key={t._id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 fmo-shadow">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                {t.image?.url && <Image src={t.image.url} alt="" fill className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{t.name}</p>
                  {!t.isActive && <Badge tone="red">Hidden</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{t.description || t.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(t)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(t)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationBar meta={meta} onPageChange={list.setPage} />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product Type" : "Add Product Type"}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Name" required>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Description">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Image">
            <ImageUploader
              images={form.image ? [form.image] : []}
              max={1}
              onChange={(imgs) => setForm({ ...form, image: imgs[0] })}
              folder="famimakeover/types"
            />
          </Field>
          <div className="flex items-center justify-between">
            <Field label="Sort order">
              <TextInput
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-28"
              />
            </Field>
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
