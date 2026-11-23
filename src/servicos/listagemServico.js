// Utilitários das telas de listagem (Setores, Localizações, Fornecedores).

const SEPARADOR = ';' // o Excel em português espera ponto e vírgula

function celula(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor)
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

// Baixa um CSV com o que está na tela.
// nomeBase: "setores" -> setores-2026-11-20.csv
// cabecalho: ['ID', 'Nome', ...]   linhas: [[1, 'TI', ...], ...]
export function exportarCsv(nomeBase, cabecalho, linhas) {
  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map(celula).join(SEPARADOR))
    .join('\r\n')

  // BOM no início para o Excel reconhecer os acentos (UTF-8)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const hoje = new Date().toISOString().slice(0, 10)

  const link = document.createElement('a')
  link.href = url
  link.download = `${nomeBase}-${hoje}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// 11222333000181 -> 11.222.333/0001-81 (se não tiver 14 números, devolve como veio)
export function formatarCnpj(valor) {
  const numeros = String(valor ?? '').replace(/\D/g, '')
  if (numeros.length !== 14) return valor ?? ''
  return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

// Conta quantos itens da lista pertencem a cada id.
// contarPor(equipamentos, 'setorId').get(String(setor.id)) -> quantidade
export function contarPor(lista, campo) {
  const contagem = new Map()
  lista.forEach((item) => {
    const chave = item[campo]
    if (chave === null || chave === undefined) return
    contagem.set(String(chave), (contagem.get(String(chave)) || 0) + 1)
  })
  return contagem
}

// { Todos: 5, Ativo: 4, Inativo: 1 }
export function contarStatus(lista) {
  return {
    Todos: lista.length,
    Ativo: lista.filter((item) => item.status === 'Ativo').length,
    Inativo: lista.filter((item) => item.status === 'Inativo').length,
  }
}
