export interface Vendedora {
  codigo: string
  nome: string
  whatsapp: string
}

// Substitua pelos dados reais quando receber a lista
const VENDEDORAS: Vendedora[] = [
  { codigo: 'ana',      nome: 'Ana',      whatsapp: '5519900000001' },
  { codigo: 'carla',    nome: 'Carla',    whatsapp: '5519900000002' },
  { codigo: 'julia',    nome: 'Julia',    whatsapp: '5519900000003' },
  { codigo: 'beatriz',  nome: 'Beatriz',  whatsapp: '5519900000004' },
  { codigo: 'mariana',  nome: 'Mariana',  whatsapp: '5519900000005' },
]

// Número padrão caso nenhuma vendedora esteja vinculada ao link
export const WHATSAPP_PADRAO = '5519990034068'

export function getVendedora(codigo: string | null): Vendedora | null {
  if (!codigo) return null
  return VENDEDORAS.find(v => v.codigo === codigo.toLowerCase()) ?? null
}

export function getWhatsapp(codigo: string | null): string {
  return getVendedora(codigo)?.whatsapp ?? WHATSAPP_PADRAO
}
