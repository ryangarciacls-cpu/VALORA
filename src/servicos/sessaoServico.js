// Sessão apenas VISUAL (sem autenticação real).
// Guarda o nome digitado no login para a sidebar mostrar quem está usando.
const CHAVE = 'valora-usuario'

function formatarNome(texto) {
  const base = String(texto || '').trim().split('@')[0]
  return base
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
    .join(' ')
}

export function salvarSessao(usuario) {
  try {
    localStorage.setItem(CHAVE, formatarNome(usuario))
  } catch {
    // sem localStorage: a sidebar mostra "Visitante"
  }
}

export function lerSessao() {
  try {
    return localStorage.getItem(CHAVE) || ''
  } catch {
    return ''
  }
}

export function encerrarSessao() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // ignora
  }
}

export function obterIniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase()
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase()
}
