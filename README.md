# 🧠 ProfileTutor

> Extensão de navegador inteligente que analisa e otimiza o seu perfil no **LinkedIn** e **GitHub** com IA multi-provedor (**OpenRouter**, **Google Gemini** & **Groq Cloud**), explica métricas vitais e funciona como tutor, investigador, inspetor interativo e comparador de concorrência.

![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)
![OpenRouter](https://img.shields.io/badge/IA-OpenRouter-10a37f?logo=openai&logoColor=white)
![Gemini](https://img.shields.io/badge/IA-Google%20Gemini-8E75B2?logo=google&logoColor=white)
![Groq](https://img.shields.io/badge/IA-Groq%20Cloud%20LPU-f55036?logo=fastapi&logoColor=white)
![Theme](https://img.shields.io/badge/Tema-Claro%20%7C%20Escuro-0969da)
![PDF](https://img.shields.io/badge/Relat%C3%B3rio-Exportar%20PDF-success)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.2.0-blue)

---

## 🤖 Suporte a Múltiplos Provedores de IA

O ProfileTutor suporta 3 dos maiores ecossistemas de IA do mundo, com dezenas de opções **100% gratuitas**:

| Provedor | Modelos Populares | Destaque | Onde obter a chave |
|---|---|---|---|
| **🌐 OpenRouter** | `deepseek/deepseek-r1:free`<br>`deepseek/deepseek-chat:free`<br>`meta-llama/llama-3.3-70b-instruct:free`<br>`google/gemini-2.0-flash-exp:free`<br>`qwen/qwen-2.5-72b-instruct:free`<br>`anthropic/claude-3.5-sonnet` | Acesso unificado a DeepSeek R1, Llama 3.3, Claude e GPT-4o | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **⚡ Groq Cloud** | `llama-3.3-70b-versatile`<br>`llama-3.1-8b-instant`<br>`mixtral-8x7b-32768` | Inferência ultrarrapida em chips LPU | [console.groq.com/keys](https://console.groq.com/keys) |
| **✨ Google Gemini** | `gemini-2.0-flash`<br>`gemini-3.6-flash`<br>`gemini-1.5-pro` | Janela de contexto massiva oficial do Google | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

> 💡 **Dica:** Os modelos com tag `:free` no OpenRouter são totalmente gratuitos e não debitam créditos.

---

## 📸 Funcionalidades Principais

### 1. 📊 Análise de Qualidade do Perfil
- Pontuação instantânea de **0 a 100** com cálculo local (sem gastar cota de IA)
- Níveis de maturidade: *Iniciante*, *Intermediário*, *Avançado* e *Expert*
- Diagnóstico completo por IA: pontos fortes, pontos críticos e **Top 3 Ações Prioritárias**
- 📄 **Exportação de Relatório em PDF:** Gere um relatório de auditoria diagramado e pronto para impressão ou download com um clique!

### 2. ⚖️ Comparativo entre Dois Perfis (Confronto Direto)
- Confronto direto entre seu perfil e um perfil concorrente ou de referência
- Selecione perfis anteriores do histórico ou digite dados de um perfil alvo
- Tabela comparativa e **Veredito da IA** com plano de ação estratégico

### 3. 📜 Histórico de Auditorias Salvas
- Todas as análises realizadas são salvas automaticamente no armazenamento local
- Reabra diagnósticos antigos a qualquer momento sem consumir novas chamadas de IA
- Acompanhe a evolução da sua pontuação ao longo do tempo

### 4. 🌓 Tema Claro / Escuro
- Alternância rápida com um clique no botão 🌓 do cabeçalho
- Interface adaptada com alto contraste tanto para perfis do LinkedIn quanto do GitHub

### 5. 🔎 Modo Inspetor (Hover em Tempo Real)
- Ao passar o mouse sobre qualquer elemento da página (Overview, Repositories, Projects, Packages, Stars, Headline, Banner, Foto, Experiências, Skills):
  - Um tooltip interativo surge na tela com diagnóstico imediato
  - O painel exibe a recomendação prática e o botão **✨ Aprofundar com IA**

### 6. 🎓 Modo Tutor Interativo
- Explicações didáticas sobre os algoritmos e métricas das plataformas:
  - **LinkedIn:** Leitura por ATS, Social Selling Index (SSI), impacto do Open to Work, técnicas para o "Sobre", relevância de Recomendações
  - **GitHub:** Criação de README de perfil atraente, seleção estratégica de Repositórios Pinados, boas práticas de Contribuições, Stars e Forks

### 7. 🔍 Modo Investigador & 💬 Chat Contextual
- Análise estratégica de outros perfis para recrutamento, benchmarking e networking
- Chatbot conectado com contexto completo do perfil aberto na aba

---

## 🚀 Como Instalar e Usar

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/ElPadrinhoBR/profiletutor-extension.git
   ```

2. **Abra o gerenciador de extensões no Chrome:**
   - Digite na barra de endereços: `chrome://extensions/`
   - Ative o botão **"Modo do desenvolvedor"** (canto superior direito)
   - Clique em **"Carregar sem compactação"**
   - Selecione a pasta `profiletutor-extension`

3. **Configure sua chave de IA:**
   - Clique no ícone de engrenagem ⚙️ (Configurações)
   - Escolha seu provedor preferido (**OpenRouter**, **Groq** ou **Gemini**) e insira sua chave
   - *(Opcional)* Você também pode configurar suas chaves diretamente no arquivo `config.js`

4. **Navegue para qualquer perfil:**
   - Acesse qualquer perfil no **LinkedIn** ou **GitHub**
   - Clique no ícone do ProfileTutor 🧠 para abrir o painel lateral!

---

## 👨‍💻 Autor

**Roberto LMC**

Estudante de Gestão de TI | Desenvolvimento de Software | SCRUM Master | Inovação & IA

- 💼 **LinkedIn:** [linkedin.com/in/robertolmc](https://www.linkedin.com/in/robertolmc/)
- 💻 **GitHub:** [github.com/ElPadrinhoBR](https://github.com/ElPadrinhoBR)

---

<div align="center">
  <sub>Feito com 🧠 e dedicação por <a href="https://github.com/ElPadrinhoBR">Roberto LMC</a></sub>
</div>
