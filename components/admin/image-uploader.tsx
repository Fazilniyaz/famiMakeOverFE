"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, Loader2, Link2 } from "lucide-react"
import { toast } from "sonner"
import { AdminAPI } from "@/lib/services"
import { ApiError } from "@/lib/api"
import type { ImageRef } from "@/lib/types"

/**
 * Uploads directly to ImageKit using signed auth from our backend.
 * Falls back to pasting an image URL when ImageKit isn't configured yet.
 */
export function ImageUploader({
  images,
  onChange,
  max = 3,
  folder = "famimakeover",
}: {
  images: ImageRef[]
  onChange: (images: ImageRef[]) => void
  max?: number
  folder?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlValue, setUrlValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return
    const room = max - images.length
    const selected = Array.from(files).slice(0, room)
    setUploading(true)
    try {
      const uploaded: ImageRef[] = []
      for (const file of selected) {
        // Fresh signed auth per file — ImageKit tokens are single-use.
        const auth = await AdminAPI.imagekitAuth()
        if (!auth?.publicKey || !auth?.signature || !auth?.token || !auth?.expire) {
          throw new Error("ImageKit auth response incomplete. Restart the backend and try again.")
        }
        const form = new FormData()
        form.append("file", file)
        form.append("fileName", `${Date.now()}-${file.name}`)
        form.append("publicKey", auth.publicKey)
        form.append("signature", auth.signature)
        form.append("expire", String(auth.expire))
        form.append("token", auth.token)
        form.append("folder", folder)
        const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: form,
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || "Upload failed")
        uploaded.push({ url: json.url, fileId: json.fileId })
      }
      onChange([...images, ...uploaded])
      toast.success(`${uploaded.length} image(s) uploaded`)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err as Error).message
      toast.error(msg)
      if (msg.toLowerCase().includes("imagekit")) setUrlMode(true)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function addUrl() {
    if (!urlValue.trim()) return
    if (!/^https?:\/\//.test(urlValue) && !urlValue.startsWith("/")) {
      toast.error("Enter a valid image URL")
      return
    }
    onChange([...images, { url: urlValue.trim() }])
    setUrlValue("")
  }

  function remove(i: number) {
    onChange(images.filter((_, idx) => idx !== i))
  }

  const full = images.length >= max

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
            <Image src={img.url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-destructive shadow"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {!full && !urlMode && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary fmo-transition"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-[11px]">Upload</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {images.length}/{max} images
        </span>
        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <Link2 className="h-3 w-3" /> {urlMode ? "Hide URL input" : "Add by URL"}
        </button>
      </div>

      {urlMode && !full && (
        <div className="flex gap-2">
          <input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://image-url.jpg"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={addUrl}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Add
          </button>
        </div>
      )}
    </div>
  )
}
