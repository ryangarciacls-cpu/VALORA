// Filtro Todos / Ativos / Inativos das telas de listagem.
// Props: valor ('Todos' | 'Ativo' | 'Inativo'), aoMudar(novoValor), contagens ({ Todos, Ativo, Inativo })

const opcoes = [
  { valor: 'Todos', rotulo: 'Todos' },
  { valor: 'Ativo', rotulo: 'Ativos' },
  { valor: 'Inativo', rotulo: 'Inativos' },
]

export default function FiltroStatus({ valor, aoMudar, contagens }) {
  return (
    <div className="pg-filtro" role="group" aria-label="Filtrar por status">
      {opcoes.map((opcao) => {
        const ativa = valor === opcao.valor

        return (
          <button
            key={opcao.valor}
            type="button"
            className={`pg-filtro-opcao ${ativa ? 'pg-filtro-opcao--ativa' : ''}`}
            aria-pressed={ativa}
            onClick={() => aoMudar(opcao.valor)}
          >
            {opcao.rotulo}
            <span>{contagens?.[opcao.valor] ?? 0}</span>
          </button>
        )
      })}
    </div>
  )
}
