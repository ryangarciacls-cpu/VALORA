// Gera e baixa o relatório de equipamentos em CSV, direto no navegador.
// Usa os mesmos serviços e a mesma regra de Score do painel.
import { listarEquipamentos } from './equipamentoServico'
import { listarSetores } from './setorServico'
import { listarManutencoes } from './manutencaoServico'
import { calcularSaudeEquipamento } from './pontuacaoServico'

const SEPARADOR = ';' // o Excel em português espera ponto e vírgula

function celula(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor)
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

function formatarData(data) {
  if (!data) return ''
  const d = new Date(data)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function formatarValor(valor) {
  if (valor === null || valor === undefined || valor === '') return ''
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

export async function gerarRelatorioEquipamentos() {
  const [equipamentos, setores, manutencoes] = await Promise.all([
    listarEquipamentos(),
    listarSetores(),
    listarManutencoes(),
  ])

  const listaEquipamentos = Array.isArray(equipamentos) ? equipamentos : []
  const listaSetores = Array.isArray(setores) ? setores : []
  const listaManutencoes = Array.isArray(manutencoes) ? manutencoes : []

  const nomeSetor = new Map(listaSetores.map((s) => [String(s.id), s.nome]))

  const historicoPorEquipamento = new Map()
  listaManutencoes.forEach((m) => {
    const chave = String(m.equipamentoId)
    historicoPorEquipamento.set(chave, [...(historicoPorEquipamento.get(chave) || []), m])
  })

  const cabecalho = [
    'Patrimônio', 'Equipamento', 'Tipo', 'Marca', 'Modelo', 'Setor', 'Status',
    'Score', 'Classificação', 'Manutenções', 'Valor (R$)', 'Data de aquisição',
  ]

  const linhas = listaEquipamentos
    .map((e) => {
      const historico = historicoPorEquipamento.get(String(e.id)) || []
      return { e, historico, saude: calcularSaudeEquipamento(e, historico) }
    })
    .sort((a, b) => a.saude.pontuacao - b.saude.pontuacao) // menores scores primeiro
    .map(({ e, historico, saude }) => [
      e.patrimonio, e.nome, e.tipo, e.marca, e.modelo,
      nomeSetor.get(String(e.setorId)) || '',
      e.status, saude.pontuacao, saude.classificacao, historico.length,
      formatarValor(e.valor), formatarData(e.dataAquisicao),
    ])

  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map(celula).join(SEPARADOR))
    .join('\r\n')

  // BOM no início para o Excel reconhecer os acentos (UTF-8)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const hoje = new Date().toISOString().slice(0, 10)

  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-equipamentos-${hoje}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
