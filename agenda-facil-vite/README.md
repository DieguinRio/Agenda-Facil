# 📅 Agenda Fácil

Sistema de agendamento online para pequenos negócios — salões, barbearias, clínicas, profissionais liberais e muito mais.

## ✨ Funcionalidades

- **Painel** com resumo financeiro do mês (receita confirmada e pendente)
- **Agenda semanal** visual — clique num horário para agendar
- **Validação de conflito** de horários em tempo real
- **Link público para clientes** — agendam sozinhos sem criar conta
- **Cancelamento e reagendamento** pelo próprio cliente via WhatsApp
- **Redes sociais** do estabelecimento na página do cliente
- **Configuração do negócio** (nome, tipo, horário de funcionamento)
- Tela de **login** com identidade própria do produto

## 🚀 Como rodar localmente

```bash
git clone https://github.com/DieguinRio/Agenda-Facil.git
cd Agenda-Facil
git checkout html-vite          # branch com esta versão
npm install
npm run dev
```

Acesse: `http://localhost:5173`

Login demo: `demo@agendafacil.app` / `demo1234`

## 📦 Build para produção

```bash
npm run build
# Arquivos gerados em /dist — prontos para deploy
```

## 🌐 Deploy gratuito

| Plataforma | Comando |
|---|---|
| **Vercel** | `vercel` (ou conecte o repo) |
| **Netlify** | Arraste a pasta `dist/` |
| **GitHub Pages** | Veja `.github/workflows/` |

> **Atenção GitHub Pages:** altere `base` em `vite.config.js` para `'/Agenda-Facil/'`

## 🗂️ Estrutura do projeto

```
src/
├── lib/
│   ├── db.js          # localStorage (get, set, id)
│   └── helpers.js     # formatadores, toast, ícones SVG
├── styles/
│   ├── base.css       # reset, variáveis CSS, tipografia
│   ├── layout.css     # sidebar, main, responsivo
│   ├── components.css # cards, badges, botões, inputs, modal
│   ├── calendar.css   # grade da agenda semanal
│   └── public.css     # página de agendamento do cliente
├── pages/
│   ├── login.js
│   ├── dashboard.js
│   ├── calendar.js
│   ├── appointments.js
│   ├── services.js
│   ├── clients.js
│   ├── settings.js
│   └── public.js      # agendamento + lookup + reagendamento
├── components/
│   ├── sidebar.js     # perfil, status do dia, social links
│   ├── apptModal.js   # modal criar/editar agendamento
│   └── router.js      # navigate(), troca de páginas
├── seed.js            # dados demo (primeira execução)
└── main.js            # entry point — importa tudo
```

## 🛠️ Tecnologias

- **Vite** — build tool (zero config, HMR)
- **JS puro (ES Modules)** — sem React, sem framework
- **CSS puro com variáveis** — sem Tailwind, sem preprocessador
- **localStorage** — persistência local (demo)

## 📌 Branches

| Branch | Descrição |
|---|---|
| `main` | Versão original React + base44 |
| `html-vite` | Esta versão — HTML/CSS/JS + Vite |

## 📄 Licença

MIT
