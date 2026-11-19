import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { lerSessao, encerrarSessao, obterIniciais } from '../servicos/sessaoServico'
import logo from '../img/valora-logo.png'
import './sidebar.css'
import { gerarRelatorioEquipamentos } from '../servicos/relatorioServico'
// Barra lateral compartilhada entre as páginas.
// Usa as classes "dash-*" que já estão no Dashboard.css.
//
// Props:
//   ativo         -> rótulo do item destacado (ex.: 'Cadastro')
//   abertoInicial -> rótulo do submenu que já começa aberto
//   nomeUsuario   -> nome mostrado na saudação

const menu = [
  { rotulo: 'Página Inicial', para: '/', destaque: true },
  {
    rotulo: 'Cadastro',
    filhos: [
      { rotulo: 'Equipamentos', para: '/equipamentos' },
      { rotulo: 'Setores', para: '/setores' },
      { rotulo: 'Localizações', para: '/localizacoes' },
      { rotulo: 'Fornecedores', para: '/fornecedores' },
    ],
  },
  { rotulo: 'Manutenção', para: '/manutencoes' },
  { rotulo: 'Analytics', para: '/analytics' },
  {
    rotulo: 'Sistema',
    filhos: [{ rotulo: 'Configurações', para: '/configuracoes' }],
  },
]

function Svg({ tamanho, children }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const IconeUsuario = () => (
  <Svg tamanho={58}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.2 18.5c1.2-2.2 3.3-3.3 5.8-3.3s4.6 1.1 5.8 3.3" />
  </Svg>
)

const IconeDownload = () => (
  <Svg tamanho={18}>
    <path d="M12 4v11" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </Svg>
)
const IconeSair = () => (
  <Svg tamanho={20}>
    <path d="M9 4H5v16h4" />
    <path d="M16 8l4 4-4 4" />
    <path d="M20 12H9" />
  </Svg>
)

const IconeSeta = () => (
  <Svg tamanho={24}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
)

export default function Sidebar({ ativo, abertoInicial = null}) {
  const [aberto, setAberto] = useState(abertoInicial)
  const [contaAberta, setContaAberta] = useState(false)
  const [exportando, setExportando] = useState(false)
  const navigate = useNavigate()
const nomeUsuario = lerSessao() || 'Visitante'

function sair() {
  encerrarSessao()
  navigate('/login')
}

async function exportarRelatorio() {
  try {
    setExportando(true)
    await gerarRelatorioEquipamentos()
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Não foi possível gerar o relatório. Verifique a conexão com a API.')
  } finally {
    setExportando(false)
  }
}

  return (
    <aside className="dash-sidebar">

      <div className="dash-logo">
        <img src={logo} alt="VALORA" />
      </div>

      <nav>
        <ul>
          {menu.map((item) => {
            const classeBase = `dash-menu-item ${ativo === item.rotulo ? 'dash-menu-item--ativo' : ''}`

            // Item com submenu
            if (item.filhos) {
              const estaAberto = aberto === item.rotulo
              return (
                <li key={item.rotulo}>
                  <button
                    type="button"
                    className={`${classeBase} ${estaAberto ? 'dash-menu-item--aberto' : ''}`}
                    aria-expanded={estaAberto}
                    onClick={() => setAberto(estaAberto ? null : item.rotulo)}
                  >
                    {item.rotulo}
                    <span className={`dash-seta ${estaAberto ? 'dash-seta--aberta' : ''}`}>
                      <IconeSeta />
                    </span>
                  </button>

                  {estaAberto && (
                    <ul className="dash-submenu">
                      {item.filhos.map((filho) => (
                        <li key={filho.para}>
                          <NavLink
                            to={filho.para}
                            className={({ isActive }) =>
                              `dash-submenu-item ${isActive ? 'dash-submenu-item--ativo' : ''}`
                            }
                          >
                            {filho.rotulo}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }

            // Item que leva a uma página
            if (item.para) {
              return (
                <li key={item.rotulo}>
                  <Link
  to={item.para}
  className={`${classeBase} ${item.destaque ? 'dash-menu-item--destaque' : ''}`}
>
  {item.destaque ? (
    <>
      Painel
      <br />
      Principal
    </>
  ) : (
    item.rotulo
  )}
</Link>
                </li>
              )
            }

            // Item ainda sem página
            return (
              <li key={item.rotulo}>
                <button type="button" className={classeBase}>
                  {item.rotulo}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="dash-rodape">
      <div className="dash-conta-bloco">
  {contaAberta && (
    <div className="dash-conta-menu">
      <Link to="/configuracoes" className="dash-conta-opcao">
        Configurações da conta
      </Link>
    </div>
  )}

  <div className="dash-conta">
    <button
      type="button"
      className="dash-conta-perfil"
      aria-expanded={contaAberta}
      onClick={() => setContaAberta(!contaAberta)}
    >
      <span className="dash-conta-avatar">{obterIniciais(nomeUsuario)}</span>
      <span className="dash-conta-dados">
        <strong>{nomeUsuario}</strong>
        <small>Administrador</small>
      </span>
      <span className={`dash-conta-seta ${contaAberta ? 'dash-conta-seta--aberta' : ''}`}>
        <IconeSeta />
      </span>
    </button>

    <button type="button" className="dash-conta-sair" onClick={sair} aria-label="Sair" title="Sair">
      <IconeSair />
    </button>
  </div>
</div>
  <button
    type="button"
    className="dash-atalho"
    onClick={exportarRelatorio}
    disabled={exportando}
  >
    <IconeDownload />
    {exportando ? 'Gerando...' : 'Exportar relatório'}
  </button>
  <small className="dash-versao">VALORA v1.0.0</small>
</div>
    </aside>
  )
}
