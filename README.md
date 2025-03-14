# SistemaGerenciamentoFrontend

Este é o frontend do **Sistema de Gerenciamento**, desenvolvido em **Angular**.

## Requisitos

- Node.js 16+ instalado
- Angular CLI instalado (`npm install -g @angular/cli`)

## Como executar

1. Clone o repositório e entre na pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd sistema-gerenciamento-frontend
```

```bash
npm install
ng serve
```

## Acesse 
- http://localhost:4200


##
### Navegação e Telas Disponíveis

O projeto possui as seguintes telas:

🔑 Tela de Login
- Formulário para autenticação do usuário.
- Recebe token JWT para acesso às páginas protegidas.

📊 Dashboard
- Visão geral dos projetos, atividades e horas trabalhadas.
- Lista projetos e atividades vinculadas.

📌 Gestão de Projetos
- Listar, criar, editar e excluir projetos.
- Atribuir usuários a projetos.

✅ Gestão de Atividades
- Listar, criar, editar e excluir atividades dentro de projetos.
- Atribuir responsáveis às atividades.

⏳ Lançamento de Horas
- Formulário para registrar horas trabalhadas em atividades.


##
### Fluxo da Aplicação

- O usuário faz login e recebe um token JWT.
- O token é armazenado no localStorage e enviado nas requisições para acessar páginas protegidas.

### Nisso temos dois dipos de login

##
### **Login como Usuário**
- Acesso Restrito: O usuário pode acessar apenas as suas próprias informações e realizar ações limitadas a seu perfil. Por exemplo:
- Visualizar seus próprios projetos.
- Criar, editar ou excluir atividades vinculadas a esses projetos.
- Lançar horas em suas atividades.
Em geral, o usuário não tem permissão para gerenciar outros usuários, editar dados de outros projetos ou acessar informações sensíveis de outros membros da equipe.
##

##
### **Login como Admin**
- Acesso Completo: O administrador tem permissões elevadas que permitem o controle total da aplicação. O admin pode:
- Visualizar, editar e excluir todos os projetos e atividades.
- Gerenciar usuários, criando, editando ou removendo contas de outros usuários.
- Gerenciar permissões de acesso a diferentes partes do sistema, incluindo controle de quais usuários podem ver ou editar determinados projetos ou dados.
- O admin também pode gerenciar configurações de sistema, acessar relatórios completos e dados mais sensíveis da aplicação.
##


