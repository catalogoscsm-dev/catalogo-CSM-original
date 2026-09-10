// Normaliza termo de busca: remove acentos, lowercase, trata plural simples
// Ex: "Mesas" → "mesa" | "Mônaco" → "monaco" | "sofás" → "sofa"
export function normalizeQuery(q: string): string {
  let s = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  // Plural simples: strip 's' final (mesas→mesa, cadeiras→cadeira, armarios→armario)
  if (s.length > 3 && s.endsWith('s')) s = s.slice(0, -1)
  return s
}
