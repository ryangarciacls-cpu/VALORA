import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './css/Login.css'
import { salvarSessao } from '../servicos/sessaoServico'
import logo from '../img/valora-logo.png'

// Os três destaques do painel esquerdo.
const destaques = [
  {
    icone: 'chamados',
    titulo: 'Controle de Chamados',
    texto: 'Abra e acompanhe cada chamado de manutenção, do registro até a conclusão.',
  },
  {
    icone: 'equipamentos',
    titulo: 'Equipamentos Organizados',
    texto: 'Tenha o patrimônio de TI sob controle, com setor, localização e histórico de cada ativo.',
  },
  {
    icone: 'decisoes',
    titulo: 'Melhores Decisões',
    texto: 'Dashboards e indicadores para decidir com base em dados, e não em suposições.',
  },
]

function Icone({ nome, tamanho = 35 }) {
  const formas = {
    chamados: (
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.5-.5-.5-2.5z" />
    ),
    equipamentos: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    decisoes: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </>
    ),
    usuario: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M6.2 18.5c1.2-2.2 3.3-3.3 5.8-3.3s4.6 1.1 5.8 3.3" />
      </>
    ),
    olho: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    olhoFechado: (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.5 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.2-.9" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
  }

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
      {formas[nome]}
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')

  function entrar(evento) {
    evento.preventDefault()

    if (!usuario.trim() || !senha) {
      setErro('Informe o usuário e a senha.')
      return
    }

    // TODO: validar o usuário e a senha no banco de dados / API.
    // Por enquanto, qualquer usuário e senha preenchidos entram no sistema.
   salvarSessao(usuario)

    navigate('/')
  }

  return (
    <div className="lg-pagina">
      <div className="lg-cartao">
        {/* ---------- Painel esquerdo ---------- */}
        <section className="lg-apresentacao">
          <p className="lg-slogan">Gestão inteligente de ativos de TI.</p>

          <ul className="lg-destaques">
            {destaques.map((d) => (
              <li key={d.titulo}>
                <span className="lg-destaque-icone">
                  <Icone nome={d.icone} />
                </span>
                <div>
                  <strong>{d.titulo}</strong>
                  <p>{d.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Painel direito: formulário ---------- */}
        <section className="lg-formulario">
          <h1 className="lg-logo">
  <img src={logo} alt="VALORA" />
</h1>

          <form onSubmit={entrar} noValidate>
            <label className="lg-campo">
              <span>Usuário:</span>
              <input
                type="text"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value)
                  setErro('')
                }}
                autoComplete="username"
                autoFocus
              />
            </label>

            <label className="lg-campo">
              <span>Senha:</span>
              <div className="lg-senha">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value)
                    setErro('')
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lg-olho"
                  onClick={() => setMostrarSenha((valor) => !valor)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                >
                  <Icone nome={mostrarSenha ? 'olhoFechado' : 'olho'} tamanho={20} />
                </button>
              </div>
            </label>

            <div className="lg-opcoes">
              <label className="lg-lembrar">
                <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
                <span>Lembrar-me</span>
              </label>

              <Link to="/recuperar-senha" className="lg-esqueceu">
                Esqueceu sua Senha?
              </Link>
            </div>

            {erro && (
              <p className="lg-erro" role="alert">
                {erro}
              </p>
            )}

            <button type="submit" className="lg-entrar">
              Entrar
            </button>
          </form>

          <Link to="/cadastro" className="lg-cadastrese">
            Cadastre-se
          </Link>

          <div className="lg-rodape" aria-hidden="true">
            <span>VALORA</span>
          </div>
        </section>
      </div>
    </div>
  )
}