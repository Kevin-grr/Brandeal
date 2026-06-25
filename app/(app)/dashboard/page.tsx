import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            Le suivi complet (deals, seuil légal par marque) arrive en Phase 6.
          </p>
        </div>
        <Button render={<Link href="/deals/new" />}>
          <Plus className="size-4" />
          Nouveau partenariat
        </Button>
      </div>
    </div>
  )
}
