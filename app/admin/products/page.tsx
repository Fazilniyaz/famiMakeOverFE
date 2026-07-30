"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AdminAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import { formatPrice } from "@/lib/format"
import type { Product, ProductType, ImageRef, ListMeta } from "@/lib/types"
import {
  PageHeader,
  PrimaryButton,
  GhostButton,
  FormModal,
  Field,
  TextInput,
  TextArea,
  Select,
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
  productType: string
  shortDescription: string
  description: string
  price: string
  offerPrice: string
  images: ImageRef[]
  badge: string
  sizes: string
  tagline: string
  howToUse: string
  ingredients: string
  stock: string
  isActive: boolean
  isFeatured: boolean
}

const emptyForm: FormState = {
  name: "",
  productType: "",
  shortDescription: "",
  description: "",
  price: "",
  offerPrice: "",
  images: [],
  badge: "",
  sizes: "",
  tagline: "",
  howToUse: "",
  ingredients: "",
  stock: "0",
  isActive: true,
  isFeatured: false,
}

const SORT_OPTS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
]

export default function ProductsPage() {
  const list = useAdminListState({ defaultFilters: { type: "", featured: "" } })
  const [items, setItems] = useState<Product[]>([])
  const [meta, setMeta] = useState<ListMeta | null>(null)
  const [types, setTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    AdminAPI.products
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

  useEffect(() => {
    AdminAPI.productTypes.list().then(setTypes).catch(() => {})
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, productType: types[0]?._id || "" })
    setModalOpen(true)
  }
  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      productType: typeof p.productType === "string" ? p.productType : p.productType._id,
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      price: String(p.price),
      offerPrice: p.offerPrice != null ? String(p.offerPrice) : "",
      images: p.images || [],
      badge: p.badge || "",
      sizes: (p.sizes || []).join(", "),
      tagline: p.tagline || "",
      howToUse: p.howToUse || "",
      ingredients: p.ingredients || "",
      stock: String(p.stock ?? 0),
      isActive: p.isActive,
      isFeatured: p.isFeatured,
    })
    setModalOpen(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.productType) return toast.error("Select a product type")
    setSaving(true)
    try {
      const body = {
        name: form.name,
        productType: form.productType,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
        images: form.images,
        badge: form.badge || null,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        tagline: form.tagline,
        howToUse: form.howToUse,
        ingredients: form.ingredients,
        stock: Number(form.stock) || 0,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      }
      if (editing) await AdminAPI.products.update(editing._id, body)
      else await AdminAPI.products.create(body)
      toast.success(editing ? "Product updated" : "Product created")
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return
    try {
      await AdminAPI.products.remove(p._id)
      toast.success("Deleted")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  const typeName = (p: Product) =>
    typeof p.productType === "string"
      ? types.find((t) => t._id === p.productType)?.name || "—"
      : p.productType?.name

  const emptyMsg = list.hasActiveQuery ? "No results." : "No products found."

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${meta?.total ?? "—"} products`}
        action={
          <PrimaryButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add product
          </PrimaryButton>
        }
      />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search products…"
        filters={[
          {
            key: "type",
            label: "Type",
            value: list.filters.type || "",
            onChange: (v) => list.setFilter("type", v),
            options: [
              { value: "", label: "All types" },
              ...types.map((t) => ({ value: t._id, label: t.name })),
            ],
          },
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
        <div className="overflow-hidden rounded-2xl border border-border bg-card fmo-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          {p.images?.[0]?.url && <Image src={p.images[0].url} alt="" fill className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{p.name}</p>
                          {p.badge && <Badge tone="green">{p.badge}</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{typeName(p)}</td>
                    <td className="p-4">
                      <span className="text-foreground">{formatPrice(p.offerPrice ?? p.price)}</span>
                      {p.offerPrice != null && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{p.stock ?? 0}</td>
                    <td className="p-4">
                      {p.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Hidden</Badge>}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PaginationBar meta={meta} onPageChange={list.setPage} />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "Add Product"} wide>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Product type" required>
              <Select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} required>
                <option value="">Select…</option>
                {types.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Short description" hint="One line shown on cards">
            <TextInput value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₹)" required>
              <TextInput type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Offer price (₹)" hint="Optional">
              <TextInput type="number" value={form.offerPrice} onChange={(e) => setForm({ ...form, offerPrice: e.target.value })} />
            </Field>
            <Field label="Stock">
              <TextInput type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
          </div>

          <Field label="Images" hint="Up to 3 images">
            <ImageUploader images={form.images} max={3} onChange={(imgs) => setForm({ ...form, images: imgs })} folder="famimakeover/products" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Badge">
              <Select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}>
                <option value="">None</option>
                <option value="Bestseller">Bestseller</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
              </Select>
            </Field>
            <Field label="Sizes" hint="Comma separated, e.g. 30ml, 50ml">
              <TextInput value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            </Field>
          </div>

          <Field label="Tagline">
            <TextInput value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </Field>
          <Field label="Full description">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="How to use">
              <TextArea value={form.howToUse} onChange={(e) => setForm({ ...form, howToUse: e.target.value })} />
            </Field>
            <Field label="Ingredients">
              <TextArea value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
            </Field>
          </div>

          <div className="flex items-center gap-6">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            <Toggle checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} label="Featured" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save product"}
            </PrimaryButton>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
