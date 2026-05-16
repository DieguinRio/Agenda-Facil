# 📅 Agenda Fácil

> **Seu tempo organizado, seu negócio crescendo.**

Sistema web de agendamento de serviços para pequenos negócios — barbearias, salões de beleza, clínicas, profissionais liberais e muito mais.

🌐 **Demo ao vivo:** [dieguinrio.github.io/Agenda-Facil](https://dieguinrio.github.io/Agenda-Facil/)
🎥 **Vídeo de apresentação:** [youtube.com/watch?v=fKHbMyviYMQ](https://www.youtube.com/watch?v=fKHbMyviYMQ&t=118s)

---

## ✨ Funcionalidades

### Para o profissional
- **Tela de login** com identidade visual do produto e acesso via conta demo
- **Onboarding** de primeiro acesso — wizard de 3 etapas para configurar o negócio
- **Painel** com resumo do dia, estatísticas e controle financeiro (receita confirmada, pendente e total potencial)
- **Agenda semanal** visual — clique num horário vazio para agendar
- **Validação de conflito** de horários em tempo real com aviso visual
- **Edição de agendamentos** — altere data, horário, serviço ou cliente a qualquer momento
- **Cadastro de serviços** com nome, duração e preço
- **Cadastro de clientes** com histórico de agendamentos
- **Link público** para clientes agendarem sozinhos, sem criar conta
- **Cancelamento e reagendamento** pelo próprio cliente via página pública
- **Redes sociais** do estabelecimento exibidas na página do cliente
- **Configuração do negócio** — nome, tipo, telefone, endereço e horário de funcionamento por dia
- **Tema claro/escuro** com persistência da preferência
- **Badge de notificação** no menu quando um cliente agenda pelo link público
- **Logout** com retorno à tela de login

### Para o cliente
- Acesso por link direto, sem cadastro ou instalação
- Escolha de serviço, dia e horário disponível em 4 etapas guiadas
- Slots ocupados bloqueados automaticamente conforme duração de cada serviço
- Consulta de agendamentos pelo WhatsApp com opções de cancelar ou reagendar

---

## 🚀 Como rodar localmente

```bash
git clone https://github.com/DieguinRio/Agenda-Facil.git
cd Agenda-Facil
git checkout html-vite       # branch com esta versão
npm install
npm run dev
```

Acesse: `http://localhost:5173`

**Login demo:** `demo@agendafacil.app` / `demo1234`

---

## 📦 Build para produção

```bash
npm run build
# Arquivos gerados em /dist — prontos para deploy
```

---

## 🌐 Deploy gratuito

| Plataforma | Como fazer |
|---|---|
| **GitHub Pages** | Push na branch `html-vite` — deploy automático via `.github/workflows/` |
| **Vercel** | Conecte o repositório e selecione a branch `html-vite` |
| **Netlify** | Arraste a pasta `dist/` ou conecte o repo |

> ⚠️ **GitHub Pages:** altere `base` em `vite.config.js` para `'/Agenda-Facil/'` antes do build.

---

## 🗂️ Estrutura do projeto

```
src/
├── lib/
│   ├── db.js            # localStorage — get, set, id, settings
│   ├── helpers.js       # formatadores, toast, ícones SVG, datas
│   └── badge.js         # badge de notificação no menu
├── styles/
│   ├── base.css         # reset, variáveis CSS, dark mode, tipografia
│   ├── layout.css       # sidebar escura, main, login, responsivo
│   ├── components.css   # cards, badges, botões, inputs, modal, spinner
│   └── calendar.css     # grade da agenda semanal
├── pages/
│   ├── login.js         # tela de login com spinner
│   ├── onboarding.js    # wizard de primeiro acesso (3 etapas)
│   ├── dashboard.js     # painel + resumo financeiro
│   ├── calendar.js      # agenda semanal visual
│   ├── appointments.js  # listagem com filtros e busca
│   ├── services.js      # CRUD de serviços
│   ├── clients.js       # CRUD de clientes
│   ├── settings.js      # configurações do negócio + redes sociais
│   ├── public.js        # página pública — agendamento + lookup + reagendamento
│   └── theme.js         # alternância claro/escuro
├── components/
│   ├── sidebar.js       # perfil, status do dia, links sociais, logout
│   ├── apptModal.js     # modal criar/editar agendamento + validação de conflito
│   └── router.js        # navigate(), sidebar mobile, open/close
├── seed.js              # dados demo pré-carregados (primeira execução)
└── main.js              # entry point — importa e inicializa tudo
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **Vite** | Build tool, HMR, bundle de produção |
| **JavaScript ES6+ (ES Modules)** | Lógica do sistema, sem React ou framework |
| **CSS puro com Custom Properties** | Design system, dark mode, responsividade |
| **localStorage** | Persistência local dos dados (ambiente demo) |
| **GitHub Pages + Actions** | Hospedagem gratuita com deploy automático |

---

## 📌 Branches

| Branch | Descrição |
|---|---|
| `main` | Versão original em React + base44 (projeto inicial) |
| `html-vite` | Versão atual — HTML/CSS/JS puro + Vite, sem dependências de framework |

---

## 👥 Autores

Projeto desenvolvido como trabalho de conclusão da disciplina de **Projeto Integrador** — Curso de Computação, **UNIVESP** (Universidade Virtual do Estado de São Paulo), 2026.

| Nome | RA |
|---|---|
| Diego Artur da Silva Rio | 24****65 |
| Fabricio Francisco dos Santos | 23****68 |
| Leonardo Felipe de Oliveira | 24****04 |
| Lucas José de Oliveira Carvalho | 24****41 |
| Luiz Henrique Aguiar Pimenta | 24****88 |
| Pietro Gabriel Barreto da Cunha | 24****20 |
| Vanderson Aparecido dos Santos | 24****61 |

---

## 📄 Licença

MIT