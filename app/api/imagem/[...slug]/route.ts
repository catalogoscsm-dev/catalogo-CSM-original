import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BASE = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const filePath = path.join(BASE, ...slug.map(decodeURIComponent))

  if (!filePath.startsWith(BASE)) {
    return new NextResponse('Proibido', { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Não encontrado', { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const mime = MIME[ext] ?? 'application/octet-stream'
  const buffer = fs.readFileSync(filePath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
