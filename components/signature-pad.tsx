"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Pad de signature tracée à la main (canvas) pour l'espace marque.
 * Produit une image base64 envoyée au serveur comme preuve de signature.
 */
export function SignaturePad({
  token,
  onSigned,
}: {
  token: string
  onSigned: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const hasDrawn = useRef(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true
    const ctx = canvasRef.current!.getContext("2d")!
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext("2d")!
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.strokeStyle = "#111"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.stroke()
    hasDrawn.current = true
  }

  function end() {
    drawing.current = false
  }

  function clear() {
    const c = canvasRef.current!
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height)
    hasDrawn.current = false
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("Indiquez le nom du signataire.")
      return
    }
    if (!hasDrawn.current) {
      toast.error("Veuillez signer dans le cadre.")
      return
    }
    setLoading(true)
    const signatureData = canvasRef.current!.toDataURL("image/png")
    const res = await fetch(`/api/share/${token}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signerName: name,
        signerEmail: email || undefined,
        signatureData,
      }),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    setLoading(false)
    if (!res.ok) {
      toast.error("Signature impossible", { description: data.error })
      return
    }
    toast.success("Contrat signé. Merci !")
    onSigned()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="signer-name">Nom du signataire</Label>
          <Input
            id="signer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom Nom"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signer-email">Email (optionnel)</Label>
          <Input
            id="signer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Signature</Label>
        <canvas
          ref={canvasRef}
          width={500}
          height={160}
          className="bg-background w-full touch-none rounded-md border"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <button
          type="button"
          onClick={clear}
          className="text-muted-foreground hover:text-foreground mt-1 text-xs underline"
        >
          Effacer
        </button>
      </div>

      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "Signature…" : "Signer le contrat"}
      </Button>
      <p className="text-muted-foreground text-xs">
        En signant, vous acceptez les termes du contrat. La date, l&apos;heure et
        votre adresse IP sont enregistrées comme preuve de signature.
      </p>
    </div>
  )
}
