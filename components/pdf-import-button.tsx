"use client"

import { useRef, useState } from "react"
import { Paperclip } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function PdfImportButton({ onText }: { onText: (text: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/ai/extract-pdf", { method: "POST", body: formData })
    const body = (await res.json().catch(() => ({}))) as { text?: string; error?: string }
    setLoading(false)

    if (!res.ok || !body.text) {
      toast.error(body.error ?? "Impossible de lire le fichier.")
      return
    }

    onText(body.text)
    toast.success("Fichier importé.")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="size-4" />
        {loading ? "Lecture…" : "Importer un fichier"}
      </Button>
    </>
  )
}
