import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../componentes/sidebar'
import { listarSetores, cadastrarSetor } from '../servicos/setorServico'
import { listarLocalizacoes } from '../servicos/localizacaoServico'
import { listarEquipamentos } from '../servicos/equipamentoServico'
import { exportarCsv, contarPor, contarStatus } from '../servicos/listagemServico'
import FiltroStatus from '../componentes/filtroStatus'
import BotaoExportar from '../componentes/botaoExportar'
import './css/Home.css' // layout e sidebar compartilhados (o mesmo CSS do Equipamentos.jsx)
import './css/Setores.css'



const statusOpcoes = ['Ativo', 'Inativo']

const classeStatus = {
  Ativo: 'st-status--ativo',
  Inativo: 'st-status--inativo',
}

const formularioVazio = {
  nome: '',
  descricao: '',
  status: 'Ativo'
}

export default function Setores() {
  const [setores, setSetores] = useState([])
  const [localizacoes, setLocalizacoes] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('Todos')

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(formularioVazio)

    useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true)
        setErro('')

        const [dadosSetores, dadosLocalizacoes, dadosEquipamentos] = await Promise.all([
          listarSetores(),
          listarLocalizacoes(),
          listarEquipamentos().catch(() => []), // sem equipamentos, só some a contagem
        ])

        setSetores(dadosSetores)
        setLocalizacoes(dadosLocalizacoes)
        setEquipamentos(dadosEquipamentos)

      } catch (error) {
        console.error('Erro ao carregar setores:', error)
        setErro('Não foi possível carregar os setores.')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Aplica o filtro de status e a busca por texto em todas as colunas.
  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return setores
      .filter((s) => filtroStatus === 'Todos' || s.status === filtroStatus)
      .filter((s) =>
        [s.id, s.nome, s.descricao, s.status].some((campo) =>
          String(campo ?? '').toLowerCase().includes(termo)
        )
      )
  }, [busca, setores, filtroStatus])

  // Contagens exibidas na tabela e nos botões de filtro
  const contagemLocalizacoes = useMemo(() => contarPor(localizacoes, 'setorId'), [localizacoes])
  const contagemEquipamentos = useMemo(() => contarPor(equipamentos, 'setorId'), [equipamentos])
  const contagemStatus = useMemo(() => contarStatus(setores), [setores])

  function fecharModal() {
    setModalAberto(false)
    setForm(formularioVazio)
  }

  // Fecha o modal com a tecla Esc.
  useEffect(() => {
    
    if (!modalAberto) return

    function aoTeclar(evento) {
      if (evento.key === 'Escape') fecharModal()
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [modalAberto])

  function alterar(evento) {
    const { name, value } = evento.target
    setForm((atual) => ({ ...atual, [name]: value }))
  }

  async function salvar(evento) {
    evento.preventDefault()

    try {
      setSalvando(true)
      setErro('')

      const novoSetor = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        status: form.status,
      }

      const setorCriado = await cadastrarSetor(novoSetor)

      setSetores((atual) => [...atual, setorCriado])

      fecharModal()

    } catch (error) {
      console.error('Erro ao cadastrar setor:', error)
      setErro('Não foi possível cadastrar o setor.')
    } finally {
      setSalvando(false)
    }
  }

  // Baixa em CSV exatamente o que está na tela (respeita busca e filtro).
  function exportar() {
    exportarCsv(
      'setores',
      ['ID', 'Nome', 'Descrição', 'Localizações', 'Equipamentos', 'Status'],
      listaFiltrada.map((s) => [
        s.id,
        s.nome,
        s.descricao || '',
        contagemLocalizacoes.get(String(s.id)) || 0,
        contagemEquipamentos.get(String(s.id)) || 0,
        s.status,
      ])
    )
  }

  return (
    <div className="dash">
      <Sidebar ativo="Cadastro" abertoInicial="Cadastro" />

      <main className="dash-conteudo">
        <header className="pg-cabecalho">
          <span className="pg-sobretitulo">Cadastro</span>
          <h2 className="dash-titulo">Setores</h2>
          <p className="pg-subtitulo">Gerencie os setores da organização e acompanhe o status de cada um.</p>
        </header>

        <div className="st-barra">
          <div className="pg-filtros">
            <label className="st-busca">
              <input
                type="search"
                placeholder="Buscar"
                aria-label="Buscar setor"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>

            <FiltroStatus valor={filtroStatus} aoMudar={setFiltroStatus} contagens={contagemStatus} />
          </div>

          <div className="pg-acoes">
            <BotaoExportar aoClicar={exportar} desabilitado={listaFiltrada.length === 0} />

            <button type="button" className="st-adicionar" onClick={() => setModalAberto(true)}>
              Adicionar
            </button>
          </div>
        </div>

        <div className="st-tabela-caixa">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Localizações</th>
                <th>Equipamentos</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={7} className="st-vazio">
                      Carregando setores...
                    </td>
                  </tr>
                ) : erro && setores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="st-vazio">
                      {erro}
                    </td>
                  </tr>
                ) : listaFiltrada.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="st-vazio">
                      Nenhum setor encontrado.
                    </td>
                  </tr>
                ) : (
                  listaFiltrada.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.nome}</td>
                      <td>
                        {s.descricao || '-'}
                      </td>
                      <td>{contagemLocalizacoes.get(String(s.id)) || 0}</td>
                      <td>{contagemEquipamentos.get(String(s.id)) || 0}</td>
                      <td className={classeStatus[s.status]}>
                        {s.status}
                      </td>
                      <td className="eq-coluna-acao">
                        <Link
                          to={`/setores/${s.id}`}
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
      </main>

      {modalAberto && (
        <div
          className="st-overlay"
          onMouseDown={(e) => {
            // Clicar fora da caixa (no fundo escurecido) fecha o modal.
            if (e.target === e.currentTarget) fecharModal()
          }}
        >
          <div className="st-modal" role="dialog" aria-modal="true" aria-labelledby="st-modal-titulo">
            <h3 id="st-modal-titulo">Adicionar Setor</h3>
            <form onSubmit={salvar}>
              <label className="st-campo">
                <span>Nome</span>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={alterar}
                  required
                  autoFocus
                  autoComplete="off"
                />
              </label>

              <label className="st-campo">
                <span>Descrição</span>
                <textarea
                  name="descricao"
                  rows={3}
                  value={form.descricao}
                  onChange={alterar}
                />
              </label>

              <label className="st-campo st-campo--status">
                <span>Status</span>
                <select
                  name="status"
                  value={form.status}
                  onChange={alterar}
                >
                  {statusOpcoes.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </label>

              <div className="st-modal-acoes">
                <button
                  type="button"
                  className="st-cancelar"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="st-salvar"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}