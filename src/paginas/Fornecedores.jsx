import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../componentes/sidebar'
import { listarFornecedores, cadastrarFornecedor} from '../servicos/fornecedorServico'
import { listarEquipamentos } from '../servicos/equipamentoServico'
import { exportarCsv, formatarCnpj, contarPor, contarStatus } from '../servicos/listagemServico'
import FiltroStatus from '../componentes/filtroStatus'
import BotaoExportar from '../componentes/botaoExportar'
import './css/Home.css' // layout e sidebar compartilhados (o mesmo CSS do Equipamentos.jsx)
import './css/Fornecedores.css'



const statusOpcoes = ['Ativo', 'Inativo']

const classeStatus = {
  Ativo: 'fn-status--ativo',
  Inativo: 'fn-status--inativo',
}

const formularioVazio = {
  razaoSocial: '',
  cnpj: '',
  nomeFantasia: '',
  endereco: '',
  status: 'Ativo',
}

// Deixa só os números de um texto.
const somenteDigitos = (texto) => texto.replace(/\D/g, '')

// Aplica a máscara 00.000.000/0000-00 enquanto a pessoa digita.
function mascararCnpj(valor) {
  return somenteDigitos(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(formularioVazio)
  const [erro, setErro] = useState('')


  useEffect(() => {
    async function carregarFornecedores() {
      try {
        const [dados, dadosEquipamentos] = await Promise.all([
          listarFornecedores(),
          listarEquipamentos().catch(() => []), // sem equipamentos, só some a contagem
        ])
        setFornecedores(dados)
        setEquipamentos(dadosEquipamentos)
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error)
        setErro('Não foi possível carregar os fornecedores.')
      }
    }

    carregarFornecedores()
  }, [])

  // Aplica a busca por texto em todas as colunas (o CNPJ também é achado só pelos números).
  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const porStatus =
      filtroStatus === 'Todos'
        ? fornecedores
        : fornecedores.filter((f) => f.status === filtroStatus)

    if (!termo) return porStatus

    const termoNumerico = somenteDigitos(termo)

    return porStatus.filter(
      (f) =>
        [f.id, f.nomeFantasia, f.razaoSocial, f.cnpj, f.status].some((campo) =>
          String(campo).toLowerCase().includes(termo),
        ) ||
        (termoNumerico && somenteDigitos(f.cnpj).includes(termoNumerico)),
    )
  }, [busca, fornecedores, filtroStatus])

  // Contagens exibidas na tabela e nos botões de filtro
  const contagemEquipamentos = useMemo(() => contarPor(equipamentos, 'fornecedorId'), [equipamentos])
  const contagemStatus = useMemo(() => contarStatus(fornecedores), [fornecedores])

  function fecharModal() {
    setModalAberto(false)
    setForm(formularioVazio)
    setErro('')
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
    setErro('')
    setForm((atual) => ({
      ...atual,
      [name]: name === 'cnpj' ? mascararCnpj(value) : value,
    }))
  }

  async function salvar(evento) {
    evento.preventDefault()

    if (somenteDigitos(form.cnpj).length !== 14) {
      setErro('Informe o CNPJ completo (14 números).')
      return
    }

    const jaExiste = fornecedores.some(
      (f) => somenteDigitos(f.cnpj) === somenteDigitos(form.cnpj)
    )

    if (jaExiste) {
      setErro('Já existe um fornecedor cadastrado com este CNPJ.')
      return
    }

    const novo = {
      razaoSocial: form.razaoSocial.trim(),
      cnpj: form.cnpj,
      nomeFantasia: form.nomeFantasia.trim(),
      endereco: form.endereco.trim(),
      telefone: '',
      email: '',
      descricao: '',
      status: form.status,
    }

    try {
      setSalvando(true)
      setErro('')

      const fornecedorCriado = await cadastrarFornecedor(novo)

      setFornecedores((atual) => [...atual, fornecedorCriado])

      fecharModal()
    } catch (error) {
      console.error('Erro ao cadastrar fornecedor:', error)
      setErro('Não foi possível cadastrar o fornecedor.')
    } finally {
      setSalvando(false)
    }
  }

  // Baixa em CSV exatamente o que está na tela (respeita busca e filtro).
  function exportar() {
    exportarCsv(
      'fornecedores',
      ['ID', 'Nome', 'Razão social', 'CNPJ', 'Equipamentos', 'Status'],
      listaFiltrada.map((f) => [
        f.id,
        f.nomeFantasia,
        f.razaoSocial,
        formatarCnpj(f.cnpj),
        contagemEquipamentos.get(String(f.id)) || 0,
        f.status,
      ])
    )
  }

  return (
    <div className="dash">
      <Sidebar ativo="Cadastro" abertoInicial="Cadastro" />

      <main className="dash-conteudo">
        <header className="pg-cabecalho">
          <span className="pg-sobretitulo">Cadastro</span>
          <h2 className="dash-titulo">Fornecedores</h2>
          <p className="pg-subtitulo">Empresas que fornecem equipamentos e serviços, com razão social e CNPJ.</p>
        </header>

        <div className="fn-barra">
          <div className="pg-filtros">
            <label className="fn-busca">
              <input
                type="search"
                placeholder="Buscar"
                aria-label="Buscar fornecedor"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>

            <FiltroStatus valor={filtroStatus} aoMudar={setFiltroStatus} contagens={contagemStatus} />
          </div>

          <div className="pg-acoes">
            <BotaoExportar aoClicar={exportar} desabilitado={listaFiltrada.length === 0} />

            <button type="button" className="fn-adicionar" onClick={() => setModalAberto(true)}>
              Adicionar
            </button>
          </div>
        </div>

        <div className="fn-tabela-caixa">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Razão social</th>
                <th>CNPJ</th>
                <th>Equipamentos</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 && (
                <tr>
                  <td colSpan={7} className="fn-vazio">
                    Nenhum fornecedor encontrado.
                  </td>
                </tr>
              )}

              {listaFiltrada.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.nomeFantasia}</td>
                  <td>{f.razaoSocial}</td>
                  <td>{formatarCnpj(f.cnpj)}</td>
                  <td>{contagemEquipamentos.get(String(f.id)) || 0}</td>
                  <td className={classeStatus[f.status]}>{f.status}</td>
                  <td className="fn-coluna-acao">
                    <Link to={`/fornecedores/${f.id}`} className="dash-ver-detalhes">
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modalAberto && (
        <div
          className="fn-overlay"
          onMouseDown={(e) => {
            // Clicar fora da caixa (no fundo escurecido) fecha o modal.
            if (e.target === e.currentTarget) fecharModal()
          }}
        >
          <div className="fn-modal" role="dialog" aria-modal="true" aria-labelledby="fn-modal-titulo">
            <h3 id="fn-modal-titulo">Adicionar Fornecedor</h3>

            <form onSubmit={salvar}>
              <label className="fn-campo">
                <span>Razão Social</span>
                <input
                  name="razaoSocial"
                  value={form.razaoSocial}
                  onChange={alterar}
                  required
                  autoFocus
                  autoComplete="off"
                />
              </label>

              <label className="fn-campo fn-campo--cnpj">
                <span>CNPJ</span>
                <input
                  name="cnpj"
                  value={form.cnpj}
                  onChange={alterar}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  maxLength={18}
                  required
                  autoComplete="off"
                />
              </label>

              <label className="fn-campo">
                <span>Nome Fantasia</span>
                <input name="nomeFantasia" value={form.nomeFantasia} onChange={alterar} required autoComplete="off" />
              </label>

              <label className="fn-campo">
                <span>Endereço</span>
                <input name="endereco" value={form.endereco} onChange={alterar} autoComplete="off" />
              </label>

              <label className="fn-campo fn-campo--status">
                <span>Status</span>
                <select name="status" value={form.status} onChange={alterar}>
                  {statusOpcoes.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </label>

              {erro && (
                <p className="fn-erro" role="alert">
                  {erro}
                </p>
              )}

              <div className="fn-modal-acoes">
                <button type="button" className="fn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="fn-salvar" disabled={salvando}>
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