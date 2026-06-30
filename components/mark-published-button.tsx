"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function MarkPublishedButton({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("deals")
      .update({ published_at: new Date().toISOString() })
      .eq("id", dealId)
    setLoading(false)
    if (error) {
      toast.error("Erreur lors de la mise à jour.")
      return
    }
    toast.success("Contenu marqué comme publié.")
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading}>
      <CheckCircle2 className="size-4" />
      {loading ? "Mise à jour…" : "Marquer le contenu comme publié"}
    </Button>
  )
}
