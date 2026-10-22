/**
 * Gerador de hash de senha para o painel admin.
 * Uso: node scripts/gerar-senha-admin.cjs
 *
 * Gera dois hashes:
 *   ADMIN_PASSWORD_HASH  → para a API Route do Vercel (scrypt — seguro, server-side)
 *   NEXT_PUBLIC_ADMIN_HASH → fallback client-side para GitHub Pages (SHA-256)
 */

const { scryptSync, randomBytes, createHash } = require('crypto')
const readline = require('readline')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('Digite a nova senha: ', (password) => {
  rl.close()
  if (!password || password.length < 6) {
    console.error('❌ Senha muito curta (mínimo 6 caracteres).')
    process.exit(1)
  }

  // scrypt (para ADMIN_PASSWORD_HASH — API Route Vercel)
  const salt    = randomBytes(16).toString('hex')
  const hash    = scryptSync(password, salt, 64).toString('hex')
  const scryptH = `${salt}:${hash}`

  // SHA-256 (para NEXT_PUBLIC_ADMIN_HASH — fallback GitHub Pages)
  const sha256H = createHash('sha256').update(password).digest('hex')

  console.log('\n✅ Copie os valores abaixo para o seu .env.local e painel Vercel:\n')
  console.log('─────────────────────────────────────────────────────────')
  console.log(`NEXT_PUBLIC_ADMIN_HASH=${sha256H}`)
  console.log(`ADMIN_PASSWORD_HASH=${scryptH}`)
  console.log(`ADMIN_SECRET=${randomBytes(32).toString('hex')}`)
  console.log('─────────────────────────────────────────────────────────')
  console.log('\n⚠️  ADMIN_SECRET e ADMIN_PASSWORD_HASH são secretos — nunca commite no git.')
  console.log('   NEXT_PUBLIC_ADMIN_HASH vai para o bundle do cliente (apenas o hash, não a senha).')
})
