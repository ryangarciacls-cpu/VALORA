import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider,} from "react-router-dom";
import './index.css'


import Home from './paginas/Home.jsx'

import Equipamentos from './paginas/Equipamentos.jsx'
import EquipamentoNovo from './paginas/EquipamentoNovo.jsx'
import EquipamentoDetalhes from './paginas/EquipamentoDetalhes.jsx'
import EquipamentoEditar from './paginas/EquipamentoEditar'

import Setores from './paginas/Setores.jsx'
import SetorDetalhes from './paginas/SetorDetalhes.jsx'
import SetorEditar from './paginas/SetorEditar.jsx'

import Localizacoes from './paginas/Localizacoes.jsx'
import LocalizacaoDetalhes from './paginas/LocalizacaoDetalhes.jsx'
import LocalizacaoEditar from './paginas/LocalizacaoEditar.jsx'


import Fornecedores from './paginas/Fornecedores.jsx'
import FornecedorDetalhes from './paginas/FornecedorDetalhes.jsx'
import FornecedorEditar from './paginas/FornecedorEditar.jsx'

import Manutencoes from './paginas/Manutencoes.jsx'
import ManutencaoNova from './paginas/ManutencaoNova.jsx'
import ManutencaoDetalhes from './paginas/ManutencaoDetalhes.jsx'
import ManutencaoEditar from './paginas/ManutencaoEditar.jsx'
import Analytics from './paginas/Analytics.jsx'


import Login from './paginas/Login.jsx'
import Configuracoes from './paginas/Configuracoes.jsx'
import './estilos/padrao.css'
import './estilos/listagens.css'



const router = createBrowserRouter([
  {path: "/", element: <Home />},

  // Rota para a página de login
  {path: "/login", element: <Login />},

  // Rota para a página inicial
  {path: "/home", element: <Home />},

  // Rota para a página de equipamentos
  {path: "/equipamentos", element: <Equipamentos />},
  // Rota para a página para adicionar equipamentos
  {path: "/equipamentos/novo", element: <EquipamentoNovo />},
     // Rota para a página para de Detahes de Equipamento
  {path: "/equipamentos/:id", element: <EquipamentoDetalhes />},
    // Rota para a página para editar equipamentos
  {path: "/equipamentos/:id/editar", element: <EquipamentoEditar />},


    // Rota para a página de Setores e cadastro de setores
  {path: "/setores", element: <Setores />},
     // Rota para a página para de Detahes de Setor
  {path: "/setores/:id", element: <SetorDetalhes />},
    // Rota para a página para editar setores
  {path: "/setores/:id/editar", element: <SetorEditar />},
     // Rota para a página de Localizaocoes e cadastro de localizações
  {path: "/localizacoes", element: <Localizacoes />},
      // Rota para a página de detahles de localizações
  {path: "/localizacoes/:id", element: <LocalizacaoDetalhes />},
    // Rota para a página para editar localizações
  {path: "/localizacoes/:id/editar", element: <LocalizacaoEditar />},

      // Rota para a página de Forncecedores e cadastro de fornecedores
  {path: "/fornecedores", element: <Fornecedores />},
      // Rota para a página de Detahles de Fornecedor
  {path: "/fornecedores/:id", element: <FornecedorDetalhes />},
    // Rota para a página para editar fornecedores
  {path: "/fornecedores/:id/editar", element: <FornecedorEditar />},


      // Rota para a página de Manutenção
  {path: "/manutencoes", element: <Manutencoes />},
    // Rota para a página para adicionar manutencao
  {path: "/manutencao/nova", element: <ManutencaoNova />},
  // Rota para a página para Detahles de Manutenção
  {path: "/manutencoes/:id", element: <ManutencaoDetalhes />},
    //Rota para a página para editar manutenção
  {path: "/manutencoes/:id/editar", element: <ManutencaoEditar />},

  // Rota para a página de Analytics
  {path: "/analytics", element: <Analytics />},

  // Rota para a página de Configurações
  { path: '/configuracoes', element: <Configuracoes /> },


]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
