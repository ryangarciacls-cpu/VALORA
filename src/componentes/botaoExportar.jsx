// Botão "Exportar" (contorno) das telas de listagem.
// Props: aoClicar, desabilitado

export default function BotaoExportar({ aoClicar, desabilitado = false }) {
  return (
    <button
      type="button"
      className="pg-exportar"
      onClick={aoClicar}
      disabled={desabilitado}
      title="Baixar a lista exibida em CSV"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4v11" />
        <path d="M7 11l5 5 5-5" />
        <path d="M5 20h14" />
      </svg>
      Exportar
    </button>
  )
}
