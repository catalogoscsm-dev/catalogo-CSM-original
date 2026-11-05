import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

const PY_ENV = {
  ...process.env,
  // Corrige instalação Python 3.14 no Windows onde sys.prefix não é detectado corretamente
  PYTHONHOME: 'C:\\Users\\joao.miguel\\AppData\\Local\\Programs\\Python\\Python314',
  PYTHONPATH: 'C:\\Users\\joao.miguel\\Documents\\PROJETOS CSM\\catalogos\\catalogos separados\\Lib\\site-packages',
}

export async function POST(req: NextRequest) {
  let tmpInput: string | null = null
  try {
    const body = await req.json()

    if (!Array.isArray(body.produtoIds) || body.produtoIds.length === 0) {
      return NextResponse.json({ error: 'produtoIds obrigatório.' }, { status: 400 })
    }

    const dataFormatada = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })

    const payload = JSON.stringify({ ...body, data: dataFormatada })

    // Escreve JSON em arquivo temporário (evita problemas de encoding de stdin no Windows)
    tmpInput = path.join(os.tmpdir(), `csm-pdf-${Date.now()}.json`)
    fs.writeFileSync(tmpInput, payload, 'utf-8')

    const scriptPath = path.join(process.cwd(), 'scripts', 'gerar_pdf.py')

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const proc = spawn('py', [scriptPath, tmpInput!], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: PY_ENV,
        cwd: process.cwd(),
      })
      const chunks: Buffer[] = []
      const errChunks: Buffer[] = []

      proc.stdout.on('data', (d: Buffer) => chunks.push(d))
      proc.stderr.on('data', (d: Buffer) => errChunks.push(d))

      proc.on('close', (code) => {
        if (code !== 0) {
          const msg = Buffer.concat(errChunks).toString('utf-8')
          return reject(new Error(`Python exited ${code}: ${msg}`))
        }
        const buf = Buffer.concat(chunks)
        if (buf.length < 100) {
          return reject(new Error(`PDF vazio (${buf.length} bytes). stderr: ${Buffer.concat(errChunks).toString()}`))
        }
        resolve(buf)
      })
    })

    const filename = `proposta-csm-${Date.now()}.pdf`
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.byteLength),
      },
    })
  } catch (err) {
    console.error('[gerar-pdf]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  } finally {
    if (tmpInput) try { fs.unlinkSync(tmpInput) } catch {}
  }
}
