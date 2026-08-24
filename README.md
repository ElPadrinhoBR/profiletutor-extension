# 🧠 ProfileTutor

> Extensão de navegador inteligente que analisa e otimiza o seu perfil no **LinkedIn** e **GitHub** com IA multi-provedor (**Google Gemini** & **Groq Cloud**), explica métricas vitais e funciona como tutor, investigador e inspetor interativo.

![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)
![Gemini](https://img.shields.io/badge/IA-Google%20Gemini-8E75B2?logo=google&logoColor=white)
![Groq](https://img.shields.io/badge/IA-Groq%20Cloud%20LPU-f55036?logo=fastapi&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

---

## 📸 Funcionalidades Principais

### 1. 📊 Análise de Qualidade do Perfil
- Pontuação instantânea de **0 a 100** com cálculo local (sem gastar cota de IA)
- Níveis de maturidade: *Iniciante*, *Intermediário*, *Avançado* e *Expert*
- Diagnóstico completo por IA: pontos fortes, pontos críticos e **Top 3 Ações Prioritárias**

### 2. 🔎 Modo Inspetor (Hover em Tempo Real)
- Ative o modo inspetor com um clique no botão **🔎**
- Ao passar o mouse sobre qualquer elemento da página (Headline, Foto, Repositórios Pinados, README, Contribuições, Experiências, Skills):
  - Um tooltip interativo aparece na página explicando a relevância do item
  - O painel exibe a dica prática de melhoria imediata
  - Botão **✨ Aprofundar com IA** para gerar sugestões customizadas de redação

### 3. 🎓 Modo Tutor Interativo
- Explicações didáticas sobre os algoritmos e métricas das plataformas:
  - **LinkedIn:** Como o ATS lê seu perfil, Social Selling Index (SSI), impacto do Open to Work, técnicas para o "Sobre", relevância de Recomendações
  - **GitHub:** Como criar um README de perfil atraente, estratégia de Repositórios Pinados, boas práticas de Contribuições, Stars e Forks

### 4. 🔍 Modo Investigador
- Análise estratégica de outros perfis para benchmarking, recrutadores ou networking
- Gera resumo executivo, stack tecnológico identificado, pontos de destaque e **perguntas inteligentes para entrevistas ou conversas**

### 5. 💬 Chat Contextual com IA
- Assistente conversacional conectado ao perfil aberto no momento

---

## 🤖 Suporte a Múltiplos Provedores de IA (100% Gratuitos)

O ProfileTutor permite alternar livremente entre dois dos melhores provedores gratuitos de IA:

| Provedor | Modelo Padrão | Destaque | Onde obter a chave grátis |
|---|---|---|---|
| **⚡ Groq Cloud** | `llama-3.3-70b-versatile` | Velocidade ultra-rápida (LPU) | [console.groq.com/keys](https://console.groq.com/keys) |
| **✨ Google Gemini** | `gemini-2.0-flash` / `gemini-3.6-flash` | Janela de contexto massiva | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

> Ambas as opções possuem tiers gratuitos generosos e **não exigem cartão de crédito**.

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
   - Escolha o provedor (**Groq** ou **Gemini**) e insira sua chave
   - *(Opcional)* Você também pode configurar suas chaves diretamente no arquivo `config.js`

4. **Navegue para qualquer perfil:**
   - Acesse qualquer perfil no **LinkedIn** ou **GitHub**
   - Clique no ícone do ProfileTutor 🧠 para abrir o painel lateral!

---

## 🏗️ Estrutura do Projeto

```
profiletutor-extension/
├── manifest.json          # Manifesto Chrome MV3
├── background.js          # Service Worker com roteamento Groq & Gemini
├── config.js              # Configurações locais (ignorado no git)
├── .env                   # Exemplo de variáveis de ambiente
├── content/
│   ├── linkedin.js        # Extrator DOM e Inspetor de Hover do LinkedIn
│   └── github.js          # Extrator DOM e Inspetor de Hover do GitHub
├── panel/
│   ├── panel.html         # Interface do Side Panel
│   ├── panel.js           # Lógica dos 4 modos + Inspetor
│   └── panel.css          # Estilização com tema Dark moderno
├── options/
│   ├── options.html       # Configurações (Seletor Groq/Gemini, Chaves, Modelos)
│   └── options.js         # Lógica das preferências
└── utils/
    ├── prompts.js         # Engenharia de prompts especializados
    └── scorer.js          # Algoritmo de pontuação local 0-100
```

---

## 🔐 Privacidade e Segurança

- **100% Client-Side:** Todas as requisições partem diretamente do seu navegador para a API oficial do provedor escolhido.
- Seus dados de perfil e chaves de API **nunca** passam por servidores intermediários.
- A chave é salva de forma isolada no `chrome.storage.local`.

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
