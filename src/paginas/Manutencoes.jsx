
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../componentes/sidebar'
import { listarManutencoes } from '../servicos/manutencaoServico'
import { listarEquipamentos } from '../servicos/equipamentoServico'
import './css/Home.css'
import './css/Manutencoes.css'

// Devolve a data de N dias atrás.
function diasAtras(n) {
  const data = new Date()
  data.setDate(data.getDate() - n)
  return data.toLocaleDateString('sv-SE')
}

// Normaliza textos para comparar status com ou sem acentos.
function normalizar(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

// Padroniza os status que vêm da API.
function formatarStatus(status) {
  const valor = normalizar(status)

  const equivalencias = {
    aberta: 'Aberta',
    aberto: 'Aberta',
    'em andamento': 'Em Andamento',
    'em atendimento': 'Em Andamento',
    'em analise': 'Em Análise',
    'aguardando peca': 'Aguardando peça',
    concluida: 'Concluída',
    resolvido: 'Concluída',
    encerrado: 'Concluída',
  }

  return equivalencias[valor] || status || 'Não informado'
}

// Período → quantidade de dias para trás.
const periodos = {
  'Últimos 7 dias': 7,
  'Últimos 30 dias': 30,
  'Últimos 12 meses': 365,
}

// Status disponíveis no banco atualmente.
const statusOpcoes = [
  'Aberta',
  'Em Andamento',
  'Concluída',
]

const prioridadeOpcoes = ['Baixa', 'Média', 'Alta']

const classeStatus = {
  Aberta: 'mt-status--abertas',
  'Em Análise': 'mt-status--analise',
  'Em Andamento': 'mt-status--andamento',
  'Aguardando peça': 'mt-status--aguardando',
  Concluída: 'mt-status--concluidas',
}

const classePrioridade = {
  Alta: 'mt-prioridade--alta',
  Média: 'mt-prioridade--media',
  Baixa: 'mt-prioridade--baixa',
}

// "2026-11-02" -> "02/11/2026"
function formatarData(iso) {
  if (!iso) return '-'

  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function Icone({ nome, tamanho = 18 }) {
  const formas = {
    busca: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
    calendario: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </>
    ),
    filtro: <path d="M4 6h16M7 12h10M10 18h4" />,
  }

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {formas[nome]}
    </svg>
  )
}

function Filtro({ rotulo, valor, onChange, opcoes, icone, disabled = false }) {
  return (
    <label className="mt-filtro">
      <span className="mt-filtro-rotulo">
        {rotulo}
        {icone && <Icone nome={icone} tamanho={12} />}
      </span>

      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Todos</option>

        {opcoes.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>

      <span className="mt-filtro-seta">
        <Icone nome="chevron" tamanho={16} />
      </span>
    </label>
  )
}

export default function Manutencoes() {
  const [parametros] = useSearchParams()

  const [busca, setBusca] = useState(() => parametros.get('busca') ?? '')
  const [status, setStatus] = useState('')
  const [prioridade, setPrioridade] = useState('')
  const [periodo, setPeriodo] = useState('')

  const [manutencoes, setManutencoes] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Carrega manutenções e equipamentos da API.
  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true)
        setErro('')

        const [dadosManutencoes, dadosEquipamentos] = await Promise.all([
          listarManutencoes(),
          listarEquipamentos(),
        ])

        setManutencoes(dadosManutencoes)
        setEquipamentos(dadosEquipamentos)
      } catch (error) {
        console.error('Erro ao carregar manutenções:', error)
        setErro('Não foi possível carregar as manutenções.')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Relaciona cada manutenção ao equipamento correspondente.
  const manutencoesComEquipamentos = useMemo(() => {
    return manutencoes.map((manutencao) => {
      const equipamento = equipamentos.find(
        (e) => Number(e.id) === Number(manutencao.equipamentoId)
      )

      return {
        ...manutencao,
        patrimonio: equipamento?.patrimonio || '-',
        equipamento: equipamento?.nome || 'Equipamento não encontrado',
        descricao: manutencao.descricaoProblema || '-',
        dataAbertura: manutencao.data,
        statusExibicao: formatarStatus(manutencao.status),
        prioridade: manutencao.prioridade || '',
      }
    })
  }, [manutencoes, equipamentos])

  // Cards: contam todas as manutenções, sem considerar os filtros.
  const resumo = useMemo(() => {
    const contar = (...statusLista) =>
      manutencoesComEquipamentos.filter((m) =>
        statusLista.includes(m.statusExibicao)
      ).length

          return [
      { cor: 'abertas', valor: contar('Aberta'), rotulo: 'Abertas', filtro: 'Aberta' },
      { cor: 'andamento', valor: contar('Em Andamento'), rotulo: 'Em Andamento', filtro: 'Em Andamento' },
      { cor: 'aguardando', valor: contar('Aguardando peça'), rotulo: 'Aguardando' },
      { cor: 'analise', valor: contar('Em Análise'), rotulo: 'Em Análise' },
      { cor: 'concluidas', valor: contar('Concluída'), rotulo: 'Concluídas', filtro: 'Concluída' },
    ]
  }, [manutencoesComEquipamentos])

  // Aplica busca, status, prioridade e período.
  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const limite = periodo ? diasAtras(periodos[periodo]) : null

    return manutencoesComEquipamentos
      .filter((m) => {
        const bateBusca =
          !termo ||
          [
            m.patrimonio,
            m.equipamento,
            m.descricao,
            m.prioridade,
            m.statusExibicao,
            m.tipoManutencao,
          ].some((campo) =>
            String(campo).toLowerCase().includes(termo)
          )

        const bateStatus =
          !status || m.statusExibicao === status

        const batePrioridade =
          !prioridade || m.prioridade === prioridade

        const batePeriodo =
          !limite || (m.dataAbertura && m.dataAbertura >= limite)

        return (
          bateBusca &&
          bateStatus &&
          batePrioridade &&
          batePeriodo
        )
      })
      .sort((a, b) =>
        (b.dataAbertura || '').localeCompare(a.dataAbertura || '')
      )
  }, [manutencoesComEquipamentos, busca, status, prioridade, periodo])
  // Filtros ativos (o status é filtrado pelos cards)
       const temFiltro = Boolean(busca || status || prioridade || periodo)

       function limparFiltros() {
  setBusca('')
  setStatus('')
  setPrioridade('')
  setPeriodo('')
}

  return (
    <div className="dash">
      <Sidebar ativo="Manutenção" />

      <main className="dash-conteudo">
        <header className="mt-cabecalho">
          <h2 className="dash-titulo">Manutenções</h2>

          <Link to="/manutencao/nova" className="mt-adicionar">
            Adicionar
          </Link>
        </header>

        {carregando ? (
          <p>Carregando manutenções...</p>
        ) : erro ? (
          <p>{erro}</p>
        ) : (
          <>
            <section className="mt-cards" aria-label="Resumo das manutenções">
  {resumo.map((c) => {
    // Só os status que existem no filtro da tabela são clicáveis.
    if (!c.filtro) {
      return (
        <div key={c.rotulo} className={`mt-card mt-card--${c.cor}`}>
          <strong>{c.valor}</strong>
          <span>{c.rotulo}</span>
        </div>
      )
    }

    const ativo = status === c.filtro

    return (
      <button
        key={c.rotulo}
        type="button"
        className={`mt-card mt-card--${c.cor} mt-card--clicavel ${ativo ? 'mt-card--ativo' : ''}`}
        aria-pressed={ativo}
        title={ativo ? 'Remover filtro' : `Filtrar: ${c.rotulo}`}
        onClick={() => setStatus(ativo ? '' : c.filtro)}
      >
        <strong>{c.valor}</strong>
        <span>{c.rotulo}</span>
      </button>
    )
  })}
</section>

            <section className="mt-filtros" aria-label="Busca e filtros">
  <label className="mt-busca">
    <Icone nome="busca" />

    <input
      type="search"
      placeholder="Buscar por patrimônio, equipamento, descrição ou prioridade"
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
    />
  </label>

  <Filtro
    rotulo="Prioridade"
    valor={prioridade}
    onChange={setPrioridade}
    opcoes={prioridadeOpcoes}
    disabled={!manutencoes.some((m) => m.prioridade)}
  />

  <Filtro
    rotulo="Período"
    icone="calendario"
    valor={periodo}
    onChange={setPeriodo}
    opcoes={Object.keys(periodos)}
  />

  {temFiltro && (
    <button type="button" className="mt-limpar" onClick={limparFiltros}>
      Limpar filtros
    </button>
  )}
</section>

<p className="mt-contagem">
  {listaFiltrada.length === manutencoesComEquipamentos.length
    ? `${manutencoesComEquipamentos.length} manutenções`
    : `${listaFiltrada.length} de ${manutencoesComEquipamentos.length} manutenções`}
</p>

            <div className="mt-tabela-caixa">
              <table>
                <thead>
                  <tr>
                    <th>Patrimônio</th>
                    <th>Equipamento / Manutenção</th>
                    <th>Prioridade</th>
                    <th>Data de Abertura</th>
                    <th>Status</th>
                    <th aria-label="Ações" />
                  </tr>
                </thead>

                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="mt-vazio">
                        Nenhuma manutenção encontrada.
                      </td>
                    </tr>
                  ) : (
                    listaFiltrada.map((m) => (
                      <tr key={m.id}>
                        <td>{m.patrimonio}</td>

                        <td>
                          <strong className="mt-equipamento">
                            {m.equipamento}
                          </strong>

                          <small className="mt-descricao">
                            {m.descricao}
                          </small>
                        </td>

                        <td className={classePrioridade[m.prioridade] || ''}>
                          {m.prioridade || '-'}
                        </td>

                        <td>{formatarData(m.dataAbertura)}</td>

                        <td className={classeStatus[m.statusExibicao] || ''}>
                          {m.statusExibicao}
                        </td>

                        <td className="mt-coluna-acao">
                          <Link
                            to={`/manutencoes/${m.id}`}
                            className="dash-ver-detalhes"
                          >
                            Ver Detalhes
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
