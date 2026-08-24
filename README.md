# 🧠 ProfileTutor

> Extensao de navegador que analisa a qualidade do seu perfil no **LinkedIn** e **GitHub** com IA, explica metricas vitais e funciona como tutor e investigador profissional.

![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)
![Gemini](https://img.shields.io/badge/IA-Gemini%202.0%20Flash-8E75B2?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

---

## 📸 Funcionalidades

### 📊 Analise de Qualidade do Perfil
- Pontuacao de 0 a 100 com nivel (Iniciante / Intermediario / Avancado / Expert)
- Identificacao de pontos fortes e pontos criticos
- Top 3 acoes prioritarias para melhoria
- Analise secao por secao

**LinkedIn:** Foto, Headline, About, Experiencias, Skills, Certificacoes, Recomendacoes, Idiomas

**GitHub:** README do perfil, Repos pinados, Contribuicoes, Seguidores, Bio, Stars, Conquistas

---

### 🎓 Modo Tutor
Entenda o que cada metrica vital significa:

- O que e a "Headline" do LinkedIn e como ela afeta sua visibilidade no ATS
- O que o grafico de contribuicoes do GitHub realmente representa
- Por que recomendacoes importam mais do que conexoes
- O que e o Social Selling Index (SSI)
- Como criar um README de perfil incrivel
- O que sao Stars, Forks, Issues e PRs e como aproveita-los

---

### 🔍 Modo Investigador
Analise o perfil de outras pessoas e obtenha:
- Resumo executivo profissional
- Stack tecnico e especialidades identificadas
- Pontos fortes e diferenciais
- Perguntas inteligentes para entrevistas/conversas
- Fit cultural e oportunidades ideais

---

### 💬 Chat Tutor Contextual
Converse diretamente com a IA sobre o perfil atual:
- Perguntas abertas sobre qualquer aspecto do perfil
- Sugestoes personalizadas
- Historico de conversa na sessao

---

## 🤖 IA Embutida — Google Gemini (Gratuito)

O ProfileTutor usa a **API Gemini 2.0 Flash** do Google, que possui um tier **100% gratuito**:

| Plano | Limite | Custo |
|-------|--------|-------|
| Free Tier | 15 req/min, ~1M tokens/dia | R$ 0,00 |

### Como obter sua chave gratuita:
1. Acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Clique em **"Create API Key"**
3. Copie a chave gerada (comeca com `AIza...`)
4. Cole nas **Configuracoes** da extensao (icone ⚙️)

> Nenhum cartao de credito necessario. 100% gratuito no tier free.

---

## 🚀 Instalacao

### Metodo 1: Instalar em Modo Desenvolvedor (recomendado)

1. **Clone ou baixe** este repositorio:
   ```bash
   git clone https://github.com/ElPadrinhoBR/profiletutor-extension.git
   ```

2. Abra o Chrome e acesse: `chrome://extensions/`

3. Ative o **"Modo do desenvolvedor"** (canto superior direito)

4. Clique em **"Carregar sem compactacao"**

5. Selecione a pasta `profiletutor-extension/`

6. A extensao aparecera na barra do Chrome com o icone 🧠

### Metodo 2: Chrome Web Store
*(Em breve)*

---

## ⚙️ Configuracao Inicial

1. Clique no icone 🧠 na barra do Chrome
2. Va em **Configuracoes** (icone ⚙️) ou clique com botao direito → "Opcoes"
3. Cole sua chave Gemini API
4. Clique em **Salvar**
5. Pronto! Navegue para qualquer perfil do LinkedIn ou GitHub

---

## 🏗️ Estrutura do Projeto

```
profiletutor-extension/
├── manifest.json          # Configuracao Chrome MV3
├── background.js          # Service Worker (API calls, mensagens)
├── content/
│   ├── linkedin.js        # Extrator DOM LinkedIn
│   └── github.js          # Extrator DOM GitHub
├── panel/
│   ├── panel.html         # Interface do Side Panel
│   ├── panel.js           # Logica dos 4 modos
│   └── panel.css          # Estilos (tema escuro)
├── options/
│   ├── options.html       # Pagina de configuracoes
│   └── options.js         # Logica das configuracoes
├── utils/
│   ├── prompts.js         # Prompts especializados por modo
│   └── scorer.js          # Pontuacao local (sem IA)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔐 Privacidade e Seguranca

- **Nenhum dado e enviado para servidores proprios**
- Os dados do perfil vao diretamente: `Extensao → API Gemini do usuario`
- Sua chave API e armazenada localmente via `chrome.storage.local`
- A extensao le apenas o que esta **visivelmente na pagina**
- Nenhuma automacao ou scraping agressivo

---

## 🌐 Plataformas Suportadas

| Plataforma | URL | Status |
|---|---|---|
| LinkedIn | linkedin.com | ✅ Suportado |
| GitHub | github.com | ✅ Suportado |
| Firefox | — | 🔜 Em breve |

---

## 🛠️ Tecnologias

- **Chrome Extension Manifest V3**
- **JavaScript ES Modules** (sem frameworks externos)
- **Google Gemini 2.0 Flash API**
- **Chrome Side Panel API**
- **Chrome Storage API**
- CSS puro (tema escuro inspirado no GitHub)

---

## 🤝 Contribuindo

Contribuicoes sao bem-vindas!

1. Fork este repositorio
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudancas: `git commit -m 'feat: adiciona X'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

### Reportar Bugs
Abra uma [Issue](https://github.com/ElPadrinhoBR/profiletutor-extension/issues) descrevendo:
- O que aconteceu
- O que era esperado
- Passos para reproduzir

---

## 📋 Roadmap

- [x] Analise de qualidade LinkedIn e GitHub
- [x] Modo Tutor com topicos interativos
- [x] Modo Investigador
- [x] Chat contextual com IA
- [x] Pontuacao local (sem IA)
- [ ] Suporte ao Firefox
- [ ] Modo claro/escuro
- [ ] Exportar relatorio em PDF
- [ ] Historico de analises
- [ ] Comparativo entre dois perfis
- [ ] Publicacao na Chrome Web Store

---

## 📄 Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Sobre o Autor

**Roberto LMC**

Estudante de Gestao de TI | Desenvolvimento de Software | Tecnologia, Inovacao e Solucao de Problemas | Projetos Praticos | SCRUM Master

[![GitHub](https://img.shields.io/badge/GitHub-ElPadrinhoBR-181717?logo=github)](https://github.com/ElPadrinhoBR/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-robertolmc-0A66C2?logo=linkedin)](https://www.linkedin.com/in/robertolmc/)

---

<div align="center">

Feito com 🧠 e ☕ por [Roberto LMC](https://github.com/ElPadrinhoBR/)

*"Seu perfil e sua primeira impressao digital. Faca ele contar."*

</div>
