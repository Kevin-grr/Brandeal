import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "txt") {
    const text = await file.text()
    return NextResponse.json({ text: text.trim() })
  }

  if (ext === "pdf") {
    const buffer = Buffer.from(await file.arrayBuffer())
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse")
    const data = await pdfParse(buffer)
    return NextResponse.json({ text: (data.text as string).trim() })
  }

  return NextResponse.json(
    { error: "Format non supporté. Utilisez un PDF ou un fichier .txt." },
    { status: 400 }
  )
}
