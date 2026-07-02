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

  const MAX_SIZE = 10 * 1024 * 1024 // 10 Mo
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 10 Mo)." },
      { status: 413 }
    )
  }

  const ext = file.name.split(".").pop()?.toLowerCase()
  const mime = file.type

  if (ext === "txt" || mime === "text/plain") {
    const text = await file.text()
    return NextResponse.json({ text: text.slice(0, 100_000).trim() })
  }

  if (ext === "pdf" || mime === "application/pdf") {
    const buffer = Buffer.from(await file.arrayBuffer())
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse")
    const data = await pdfParse(buffer, { max: 50 })
    return NextResponse.json({ text: (data.text as string).trim() })
  }

  return NextResponse.json(
    { error: "Format non supporté. Utilisez un PDF ou un fichier .txt." },
    { status: 400 }
  )
}
