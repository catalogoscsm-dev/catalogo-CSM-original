/**
 * Gera um novo hash para a senha admin e atualiza o .env.local
 * Uso: node scripts/reset-admin-password.cjs <nova-senha>
 */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const novaSenha = process.argv[2]
if (!novaSenha || novaSenha.length < 6) {
  console.error('\nUso: node scripts/reset-admin-password.cjs <nova-senha>')
  console.error('A senha deve ter no mínimo 6 caracteres.\n')
  process.exit(1)
}

const salt = crypto.randomBytes(16).toString('hex')
const hash = crypto.scryptSync(novaSenha, salt, 64).toString('hex')
const valor = `${salt}:${hash}`

const envPath = path.join(__dirname, '..', '.env.local')
let conteudo = fs.readFileSync(envPath, 'utf8')

if (conteudo.includes('ADMIN_PASSWORD_HASH=')) {
  conteudo = conteudo.replace(/ADMIN_PASSWORD_HASH=.*/,  `ADMIN_PASSWORD_HASH=${valor}`)
} else {
  conteudo += `\nADMIN_PASSWORD_HASH=${valor}`
}

fs.writeFileSync(envPath, conteudo)

console.log('\n✓ Senha atualizada com sucesso!')
console.log('  Reinicie o servidor para aplicar: npm run dev\n')
