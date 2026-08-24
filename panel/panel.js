// panel/panel.js - Logica principal do ProfileTutor
import {
  buildAnalysisPrompt,
  buildTutorPrompt,
  buildInvestigatorPrompt,
  buildComparisonPrompt,
  buildChatPrompt
} from '../utils/prompts.js';
import { scoreLinkedIn, scoreGitHub } from '../utils/scorer.js';

// --- Estado global ---
let currentMode = 'analysis';
let currentPlatform = null;
let currentProfile = null;
let currentScoreData = null;
let lastAiAnalysisText = '';
let chatHistory = [];
let isLoading = false;
let hoverModeActive = false;
let lastHoveredElement = null;
let currentTheme = 'dark';

// --- Elementos DOM ---
const $ = (id) => document.getElementById(id);
const platformBadge      = $('platformBadge');
const noApiKeyScreen     = $('noApiKeyScreen');
const notSupportedScreen = $('notSupportedScreen');
const loadingScreen      = $('loadingScreen');
const loadingText        = $('loadingText');
const mainContent        = $('mainContent');
const scoreCard          = $('scoreCard');
const scoreNumber        = $('scoreNumber');
const scoreLevel         = $('scoreLevel');
const scoreName          = $('scoreName');
const scoreRing          = $('scoreRing');

// Panels
const analysisPanel      = $('analysisPanel');
const tutorPanel         = $('tutorPanel');
const investigatorPanel  = $('investigatorPanel');
const comparePanel       = $('comparePanel');
const historyPanel       = $('historyPanel');
const chatPanel          = $('chatPanel');

// Buttons & Actions
const analyzeBtn         = $('analyzeBtn');
const exportPdfBtn       = $('exportPdfBtn');
const investigateBtn     = $('investigateBtn');
const compareBtn         = $('compareBtn');
const sendBtn            = $('sendBtn');
const refreshBtn         = $('refreshBtn');
const settingsBtn        = $('settingsBtn');
const goToSettingsBtn    = $('goToSettingsBtn');
const hidePanelBtn       = $('hidePanelBtn');
const themeToggleBtn     = $('themeToggleBtn');
const quotaStatus        = $('quotaStatus');

// Results & Inputs
const aiResult           = $('aiResult');
const tutorResult        = $('tutorResult');
const investigatorResult = $('investigatorResult');
const compareResult      = $('compareResult');
const historyDetailResult= $('historyDetailResult');
const historyList        = $('historyList');
const clearHistoryBtn    = $('clearHistoryBtn');
const chatMessages       = $('chatMessages');
const chatInput          = $('chatInput');

// Hover & Inspector
const hoverModeBtn       = $('hoverModeBtn');
const hoverPanelBanner   = $('hoverPanelBanner');
const hoverInfoCard      = $('hoverInfoCard');
const hoverInfoLabel     = $('hoverInfoLabel');
const hoverInfoTip       = $('hoverInfoTip');
const hoverInfoAction    = $('hoverInfoAction');
const hoverAskAiBtn      = $('hoverAskAiBtn');
const hoverOffBtn        = $('hoverOffBtn');

// Compare Elements
const compareProfileAName   = $('compareProfileAName');
const compareProfileAScore  = $('compareProfileAScore');
const compareHistorySelect  = $('compareHistorySelect');
const compareCustomName     = $('compareCustomName');

// --- Inicializacao ---
async function init() {
  await initTheme();
  showScreen('loading');
  loadingText.textContent = 'Verificando configuracoes...';

  const apiKey = await getApiKey();
  if (!apiKey) {
    showScreen('noApiKey');
    return;
  }

  loadingText.textContent = 'Lendo dados do perfil...';
  try {
    const result = await getPageData();
    if (!result.success || !result.data) {
      showScreen('notSupported');
      return;
    }
    currentPlatform = result.platform;
    currentProfile  = result.data;
    setupUI();
    showScreen('main');
    switchMode('analysis');
    updateQuotaStatus();
    loadHistoryList();
  } catch (err) {
    showScreen('notSupported');
  }
}

// --- Tema Claro / Escuro ---
async function initTheme() {
  const res = await new Promise((r) => chrome.storage.local.get(['appTheme'], r));
  currentTheme = res.appTheme || 'dark';
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggleBtn.title = theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro';
}

themeToggleBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  chrome.storage.local.set({ appTheme: currentTheme });
});

// --- Setup UI ---
function setupUI() {
  if (currentPlatform === 'linkedin') {
    platformBadge.textContent = 'LinkedIn';
    platformBadge.className = 'platform-badge linkedin';
    document.body.dataset.platform = 'linkedin';
  } else {
    platformBadge.textContent = 'GitHub';
    platformBadge.className = 'platform-badge github';
    document.body.dataset.platform = 'github';
  }

  currentScoreData = currentPlatform === 'linkedin'
    ? scoreLinkedIn(currentProfile)
    : scoreGitHub(currentProfile);

  animateScore(currentScoreData.total, currentScoreData.level);
  setupTutorTopics();

  // Setup Compare Card Perfil A
  const pName = currentProfile.name || currentProfile.username || 'Perfil Atual';
  compareProfileAName.textContent = pName;
  compareProfileAScore.textContent = `${currentScoreData.total}/100 (${currentScoreData.level.label})`;

  $('investigatorDesc').textContent = (currentProfile && !currentProfile.isOwnProfile)
    ? 'Analise detalhada de: ' + pName
    : 'Analise como os outros veem seu perfil';
}

function animateScore(score, level) {
  scoreNumber.textContent = '0';
  scoreLevel.textContent  = level.emoji + ' ' + level.label;
  scoreLevel.style.color  = level.color;
  scoreName.textContent   = (currentProfile && (currentProfile.name || currentProfile.username)) || 'Perfil';
  const circumference = 326.7;
  let current = 0;
  const step = score / 40;
  const interval = setInterval(() => {
    current = Math.min(current + step, score);
    scoreNumber.textContent = Math.round(current);
    scoreRing.style.strokeDashoffset = circumference - (current / 100) * circumference;
    scoreRing.style.stroke = level.color;
    if (current >= score) clearInterval(interval);
  }, 30);
}

// --- Tutor Topics ---
function setupTutorTopics() {
  const container = $('tutorTopics');
  container.innerHTML = '';
  const topics = currentPlatform === 'linkedin' ? [
    { id: 'photo',         label: '📷 Foto de Perfil',       desc: 'Impacto visual e profissional' },
    { id: 'headline',      label: '✍️ Headline',              desc: 'A linha abaixo do seu nome' },
    { id: 'about',         label: '📝 Sobre / About',         desc: 'Sua apresentacao pessoal' },
    { id: 'experience',    label: '💼 Experiencias',          desc: 'Historico profissional' },
    { id: 'skills',        label: '🛠️ Skills',                desc: 'Suas competencias tecnicas' },
    { id: 'certifications',label: '🏆 Certificacoes',         desc: 'Credenciais e cursos' },
    { id: 'recommendations',label:'⭐ Recomendacoes',          desc: 'Validacoes de terceiros' },
    { id: 'open_to_work',  label: '🟢 Open to Work',          desc: 'O que significa essa moldura' },
    { id: 'ats',           label: '🤖 ATS',                   desc: 'Como sistemas de RH leem voce' },
    { id: 'linkedin_score',label: '📊 Social Selling Index',  desc: 'A pontuacao interna do LinkedIn' },
  ] : [
    { id: 'readme',        label: '📄 README do Perfil',      desc: 'A vitrine do seu GitHub' },
    { id: 'pinned_repos',  label: '📌 Repos Pinados',         desc: 'Seus projetos em destaque' },
    { id: 'contributions', label: '🟩 Contribuicoes',         desc: 'O mapa de atividade' },
    { id: 'stars',         label: '⭐ Stars',                  desc: 'O que significam as stars' },
    { id: 'followers',     label: '👥 Seguidores',            desc: 'Como construir audiencia' },
    { id: 'bio',           label: '✍️ Bio',                   desc: 'Sua apresentacao no GitHub' },
    { id: 'fork',          label: '🍴 Fork',                  desc: 'O que e e como usar' },
    { id: 'issues_prs',    label: '🔀 Issues e PRs',          desc: 'Contribuicoes em projetos' },
    { id: 'github_pages',  label: '🌐 GitHub Pages',          desc: 'Hospedagem gratuita de portfolio' },
    { id: 'profile_readme_tips',label:'💡 Dicas de README',   desc: 'Como fazer um README incrivel' },
  ];

  topics.forEach((topic) => {
    const btn = document.createElement('button');
    btn.className = 'topic-btn';
    btn.innerHTML = `<span class="topic-label">${topic.label}</span><span class="topic-desc">${topic.desc}</span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tutorResult.style.display = 'block';
      tutorResult.innerHTML = localTutorContent(topic.id, topic.label) +
        '<button class="analyze-btn tutor-ai-btn" style="margin-top:8px;">✨ Aprofundar com IA</button>';
      tutorResult.querySelector('.tutor-ai-btn').addEventListener('click', () => loadTutorWithAI(topic.label));
    });
    container.appendChild(btn);
  });
}

async function loadTutorWithAI(topicLabel) {
  if (isLoading) return;
  isLoading = true;
  tutorResult.innerHTML = typingHtml();
  try {
    const ctx = JSON.stringify({ platform: currentPlatform, profile: currentProfile });
    const response = await callAI(buildTutorPrompt(currentPlatform, topicLabel, ctx));
    tutorResult.innerHTML = formatMarkdown(response);
  } catch (err) {
    tutorResult.innerHTML = `<div class="error-msg">❌ ${formatAiError(err)}</div>`;
  }
  isLoading = false;
}

function localTutorContent(topicId, topicLabel) {
  const content = {
    photo:        ['Uma foto profissional facilita reconhecimento e passa confianca.', 'Use boa iluminacao, rosto visivel e fundo simples.'],
    headline:     ['A headline aparece junto ao seu nome em buscas e comentarios.', 'Combine funcao, especialidade e o tipo de problema que voce resolve.'],
    about:        ['O campo Sobre transforma fatos do curriculo em narrativa.', 'Abra com seu foco, traga resultados concretos e termine com um convite de contato.'],
    experience:   ['Experiencias fortes mostram impacto, nao so responsabilidades.', 'Prefira verbos de acao e numeros: reduzi, aumentei, entreguei, liderei.'],
    skills:       ['Skills ajudam recrutadores e a busca interna a encontrar voce.', 'Priorize competencias que voce pratica e que combinam com seu objetivo atual.'],
    certifications:['Certificacoes validam aprendizado e especializacao.', 'Informe emissor, data e credencial; remova itens que nao representam seu foco.'],
    recommendations:['Recomendacoes sao prova social de como e trabalhar com voce.', 'Peca relatos especificos sobre colaboracao, resultado e contexto.'],
    open_to_work: ['A moldura Open to Work sinaliza disponibilidade para oportunidades.', 'Configure os cargos, locais e modalidades para receber contatos mais relevantes.'],
    ats:          ['ATS sao sistemas que organizam candidaturas por palavras-chave.', 'Use termos do cargo desejado de forma natural em headline, Sobre e experiencias.'],
    linkedin_score:['O Social Selling Index avalia presenca, rede e relacionamento.', 'Priorize perfil claro e conversas relevantes.'],
    readme:       ['O README do perfil e sua pagina de apresentacao dentro do GitHub.', 'Explique quem voce e, tecnologias, projetos e formas de contato.'],
    pinned_repos: ['Repositorios fixados sao sua vitrine para quem chega ao perfil.', 'Fixe projetos com README, demonstracao e objetivo claro.'],
    contributions:['O grafico mostra atividade publica ao longo do ano.', 'Contribuicoes relevantes valem mais que volume.'],
    stars:        ['Stars indicam que outros acharam seu repositorio util ou interessante.', 'Crescem com projetos resolvendo problemas reais e boa documentacao.'],
    followers:    ['Seguidores acompanham seus projetos e atividade publica.', 'Compartilhe projetos, ajude em issues e mantenha presenca consistente.'],
    bio:          ['A bio e sua apresentacao em poucas palavras.', 'Diga area, tecnologias e inclua um contato quando fizer sentido.'],
    fork:         ['Fork cria uma copia de repositorio para experimentar ou propor mudancas.', 'Base para contribuir em projetos via pull request.'],
    issues_prs:   ['Issues registram perguntas, bugs e ideias; PRs propõem mudancas.', 'Descreva bem o contexto e mantenha cada contribuicao pequena.'],
    github_pages: ['GitHub Pages publica um site diretamente de um repositorio.', 'Otimo para portfolio, documentacao ou demo de projeto.'],
    profile_readme_tips:['Um README forte facilita entender seu trabalho em segundos.', 'Inclua objetivo, demo, tecnologias e proximos passos.'],
  };
  const [intro, action] = content[topicId] || [`Entenda melhor: ${topicLabel}.`, 'Observe este item no seu perfil e adapte-o ao seu objetivo.'];
  return `<h3>🎓 ${topicLabel}</h3><p>${intro}</p><p><strong>Dica pratica:</strong> ${action}</p><p class="local-note">✓ Explicacao local — nao gastou cota de IA.</p>`;
}

// --- Analise de Qualidade ---
analyzeBtn.addEventListener('click', async () => {
  if (isLoading) return;
  isLoading = true;
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<span>⏳</span> Analisando...';
  aiResult.style.display = 'block';
  aiResult.innerHTML = typingHtml();
  try {
    const response = await callAI(buildAnalysisPrompt(currentPlatform, currentProfile));
    lastAiAnalysisText = response;
    aiResult.innerHTML = formatMarkdown(response);
    analyzeBtn.innerHTML = '<span>🔄</span> Reanalisar';
    
    // Salva no historico automaticamente
    await saveToHistory({
      platform: currentPlatform,
      profileName: currentProfile.name || currentProfile.username || 'Perfil',
      profileUrl: currentProfile.profileUrl || '',
      score: currentScoreData ? currentScoreData.total : 0,
      level: currentScoreData ? currentScoreData.level.label : 'Geral',
      analysisText: response,
      profileData: currentProfile,
    });
  } catch (err) {
    aiResult.innerHTML = `<div class="error-msg">❌ ${formatAiError(err)}</div>`;
    analyzeBtn.innerHTML = '<span>✨</span> Tentar Novamente';
  }
  analyzeBtn.disabled = false;
  isLoading = false;
});

// --- Exportar PDF do Relatorio ---
exportPdfBtn.addEventListener('click', () => {
  const pName = currentProfile.name || currentProfile.username || 'Perfil';
  const score = currentScoreData ? currentScoreData.total : 0;
  const level = currentScoreData ? currentScoreData.level.label : '';
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const aiHtml = lastAiAnalysisText ? formatMarkdown(lastAiAnalysisText) : '<p>Execute a analise por IA para incluir os detalhes completos neste relatorio.</p>';

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatorio de Perfil - ${pName} - ProfileTutor</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1f2328; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 2px solid #0969da; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 20px; font-weight: 800; color: #0969da; }
    .badge { background: #e8f1fb; color: #0969da; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .score-box { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 12px; padding: 18px; margin-bottom: 24px; display: flex; justify-content: space-around; text-align: center; }
    .score-val { font-size: 32px; font-weight: 800; color: #1a7f37; }
    .score-lbl { font-size: 12px; color: #656d76; text-transform: uppercase; font-weight: 600; }
    h2, h3 { color: #1f2328; margin-top: 20px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    .footer { margin-top: 40px; border-top: 1px solid #d0d7de; padding-top: 12px; font-size: 11px; color: #656d76; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🧠 ProfileTutor • Relatório de Auditoria</div>
      <div style="font-size: 13px; color: #656d76;">Perfil: <strong>${pName}</strong> | Data: ${dateStr}</div>
    </div>
    <div class="badge">${currentPlatform.toUpperCase()}</div>
  </div>

  <div class="score-box">
    <div>
      <div class="score-val">${score}/100</div>
      <div class="score-lbl">Pontuação Geral</div>
    </div>
    <div>
      <div class="score-val" style="font-size: 24px; color: #0969da; padding-top: 6px;">${level}</div>
      <div class="score-lbl">Nível de Maturidade</div>
    </div>
  </div>

  <h2>📋 Diagnóstico Detalhado & Recomendações</h2>
  <div class="content">${aiHtml}</div>

  <div class="footer">
    Gerado automaticamente por ProfileTutor — Auditor de Perfis LinkedIn & GitHub com IA.<br/>
    Desenvolvido por Roberto LMC (github.com/ElPadrinhoBR)
  </div>
  <script>
    window.onload = () => { setTimeout(() => window.print(), 300); };
  </script>
</body>
</html>
  `);
  printWindow.document.close();
});

// --- Modo Investigador ---
investigateBtn.addEventListener('click', async () => {
  if (isLoading) return;
  isLoading = true;
  investigateBtn.disabled = true;
  investigateBtn.innerHTML = '<span>⏳</span> Investigando...';
  investigatorResult.style.display = 'block';
  investigatorResult.innerHTML = typingHtml();
  try {
    const response = await callAI(buildInvestigatorPrompt(currentPlatform, currentProfile));
    investigatorResult.innerHTML = formatMarkdown(response);
    investigateBtn.innerHTML = '<span>🔄</span> Re-investigar';
  } catch (err) {
    investigatorResult.innerHTML = `<div class="error-msg">❌ ${formatAiError(err)}</div>`;
    investigateBtn.innerHTML = '<span>🔍</span> Tentar Novamente';
  }
  investigateBtn.disabled = false;
  isLoading = false;
});

// --- Modo Comparativo ---
compareBtn.addEventListener('click', async () => {
  if (isLoading) return;
  const historyIdx = compareHistorySelect.value;
  const customTarget = compareCustomName.value.trim();

  let targetProfile = null;

  if (historyIdx !== '') {
    const history = await getHistory();
    const item = history[parseInt(historyIdx, 10)];
    if (item) {
      targetProfile = item.profileData || { name: item.profileName, score: item.score, platform: item.platform };
    }
  }

  if (!targetProfile && customTarget) {
    targetProfile = { name: customTarget, headline: customTarget, bio: customTarget };
  }

  if (!targetProfile) {
    alert('Selecione um perfil salvo do histórico ou digite os dados do concorrente para comparar.');
    return;
  }

  isLoading = true;
  compareBtn.disabled = true;
  compareBtn.innerHTML = '<span>⏳</span> Comparando com IA...';
  compareResult.style.display = 'block';
  compareResult.innerHTML = typingHtml();

  try {
    const prompt = buildComparisonPrompt(currentPlatform, currentProfile, targetProfile);
    const response = await callAI(prompt);
    compareResult.innerHTML = formatMarkdown(response);
    compareBtn.innerHTML = '<span>🔄</span> Re-comparar';
  } catch (err) {
    compareResult.innerHTML = `<div class="error-msg">❌ ${formatAiError(err)}</div>`;
    compareBtn.innerHTML = '<span>⚖️</span> Tentar Novamente';
  }
  compareBtn.disabled = false;
  isLoading = false;
});

// --- Histórico de Análises ---
async function saveToHistory(item) {
  const history = await getHistory();
  const newEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...item
  };
  // Limita a 20 entradas
  const updated = [newEntry, ...history.filter(h => h.profileName !== item.profileName)].slice(0, 20);
  await new Promise((r) => chrome.storage.local.set({ analysisHistory: updated }, r));
  loadHistoryList();
}

async function getHistory() {
  const res = await new Promise((r) => chrome.storage.local.get(['analysisHistory'], r));
  return res.analysisHistory || [];
}

async function loadHistoryList() {
  const history = await getHistory();
  historyList.innerHTML = '';
  compareHistorySelect.innerHTML = '<option value="">-- Selecionar do Histórico --</option>';

  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-history">Nenhuma análise salva ainda. Analise um perfil para salvar seu histórico automaticamente!</div>';
    return;
  }

  history.forEach((item, idx) => {
    // Adiciona ao select do comparador
    const opt = document.createElement('option');
    opt.value = idx.toString();
    opt.textContent = `${item.profileName} (${item.platform.toUpperCase()} - ${item.score}/100)`;
    compareHistorySelect.appendChild(opt);

    // Adiciona card na lista de histórico
    const card = document.createElement('div');
    card.className = 'history-card';
    const dateFormatted = new Date(item.timestamp).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    card.innerHTML = `
      <div class="history-info">
        <div class="history-name">${escapeHtml(item.profileName)}</div>
        <div class="history-meta">${item.platform.toUpperCase()} • ${dateFormatted}</div>
      </div>
      <div class="history-score-badge" style="color: ${item.score >= 70 ? '#3fb950' : item.score >= 40 ? '#58a6ff' : '#d29922'}">
        ${item.score}/100
      </div>
    `;

    card.addEventListener('click', () => {
      historyDetailResult.style.display = 'block';
      historyDetailResult.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4>${escapeHtml(item.profileName)} (${item.level})</h4>
          <span style="font-size:11px; color:var(--text-muted);">${dateFormatted}</span>
        </div>
        ${formatMarkdown(item.analysisText || 'Sem detalhes gravados.')}
      `;
      historyDetailResult.scrollIntoView({ behavior: 'smooth' });
    });

    historyList.appendChild(card);
  });
}

clearHistoryBtn.addEventListener('click', async () => {
  if (!confirm('Deseja limpar todo o histórico de análises salvas?')) return;
  await new Promise((r) => chrome.storage.local.set({ analysisHistory: [] }, r));
  historyDetailResult.style.display = 'none';
  loadHistoryList();
});

// --- Modo Inspetor (Hover) ---
hoverModeBtn.addEventListener('click', toggleHoverMode);
hoverOffBtn.addEventListener('click', () => toggleHoverMode(true));

async function toggleHoverMode(forceOff) {
  const enable = forceOff === true ? false : !hoverModeActive;
  try {
    const result = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'TOGGLE_HOVER_MODE', payload: { enable } }, resolve);
    });
    if (result && result.success !== false) {
      hoverModeActive = enable;
      updateHoverModeUI();
    }
  } catch (err) {
    console.warn('[ProfileTutor] Nao foi possivel ativar hover mode:', err);
  }
}

function updateHoverModeUI() {
  if (hoverModeActive) {
    hoverModeBtn.classList.add('hover-active');
    hoverModeBtn.title = 'Modo Inspetor ATIVO — clique para desativar';
    hoverPanelBanner.style.display = 'flex';
  } else {
    hoverModeBtn.classList.remove('hover-active');
    hoverModeBtn.title = 'Modo Inspetor: passe o mouse sobre itens do perfil';
    hoverPanelBanner.style.display = 'none';
    hoverInfoCard.style.display = 'none';
    lastHoveredElement = null;
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'HOVER_ELEMENT' && hoverModeActive && message.element) {
    const el = message.element;
    lastHoveredElement = el;
    hoverInfoLabel.textContent  = el.label;
    hoverInfoTip.textContent    = el.tip;
    hoverInfoAction.innerHTML   = '<strong>✅ Acao:</strong> ' + el.action;
    hoverInfoCard.style.display = 'block';
    hoverInfoCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

hoverAskAiBtn.addEventListener('click', async () => {
  if (!lastHoveredElement || isLoading) return;
  isLoading = true;
  hoverAskAiBtn.disabled = true;
  hoverAskAiBtn.textContent = '⏳ Consultando IA...';
  try {
    const ctx = JSON.stringify({ platform: currentPlatform, profile: currentProfile });
    const response = await callAI(buildTutorPrompt(currentPlatform, lastHoveredElement.label, ctx));
    switchMode('tutor');
    tutorResult.style.display = 'block';
    tutorResult.innerHTML = formatMarkdown(response);
    tutorResult.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    hoverInfoAction.innerHTML += `<br/><span style="color:#f85149">❌ ${formatAiError(err)}</span>`;
  }
  hoverAskAiBtn.disabled = false;
  hoverAskAiBtn.textContent = '✨ Aprofundar com IA';
  isLoading = false;
});

// --- Chat Contextual ---
sendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});

async function sendChatMessage() {
  const msg = chatInput.value.trim();
  if (!msg || isLoading) return;
  isLoading = true;
  chatInput.value = '';
  appendChatMessage('user', msg);
  chatHistory.push({ role: 'user', content: msg });
  const typingEl = appendTypingIndicator();
  try {
    const response = await callAI(buildChatPrompt(currentPlatform, msg, currentProfile, chatHistory.slice(-6)));
    typingEl.remove();
    appendChatMessage('assistant', response);
    chatHistory.push({ role: 'assistant', content: response });
  } catch (err) {
    typingEl.remove();
    appendChatMessage('assistant', '❌ ' + formatAiError(err));
  }
  isLoading = false;
}

function appendChatMessage(role, content) {
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.innerHTML = `<div class="chat-avatar">${role === 'user' ? '👤' : '🧠'}</div>
    <div class="chat-bubble">${role === 'assistant' ? formatMarkdown(content) : escapeHtml(content)}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function appendTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'chat-msg assistant';
  div.innerHTML = '<div class="chat-avatar">🧠</div><div class="chat-bubble">' + typingHtml() + '</div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

// --- Navegacao de Modos ---
document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const modeBtn = document.querySelector(`[data-mode="${mode}"]`);
  if (modeBtn) modeBtn.classList.add('active');

  scoreCard.style.display          = (mode === 'analysis')    ? 'flex'  : 'none';
  analysisPanel.style.display      = (mode === 'analysis')    ? 'block' : 'none';
  tutorPanel.style.display         = (mode === 'tutor')       ? 'block' : 'none';
  investigatorPanel.style.display  = (mode === 'investigator')? 'block' : 'none';
  comparePanel.style.display       = (mode === 'compare')     ? 'block' : 'none';
  historyPanel.style.display       = (mode === 'history')     ? 'block' : 'none';
  chatPanel.style.display          = (mode === 'chat')        ? 'flex'  : 'none';

  if (mode === 'history') loadHistoryList();
}

// --- Utilitarios ---
function showScreen(screen) {
  noApiKeyScreen.style.display    = 'none';
  notSupportedScreen.style.display= 'none';
  loadingScreen.style.display     = 'none';
  mainContent.style.display       = 'none';
  if (screen === 'noApiKey')    noApiKeyScreen.style.display     = 'flex';
  else if (screen === 'notSupported') notSupportedScreen.style.display = 'flex';
  else if (screen === 'loading')      loadingScreen.style.display      = 'flex';
  else if (screen === 'main')         mainContent.style.display        = 'flex';
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['aiProvider', 'geminiApiKey', 'groqApiKey'], (r) => {
      const provider = r.aiProvider || 'gemini';
      if (provider === 'groq') {
        resolve(r.groqApiKey || r.geminiApiKey || null);
      } else {
        resolve(r.geminiApiKey || r.groqApiKey || null);
      }
    });
  });
}

async function getPageData() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_PAGE_DATA' }, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!response) return reject(new Error('Sem resposta'));
      resolve(response);
    });
  });
}

async function callAI(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'CALL_AI', payload: { prompt } }, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!response) return reject(new Error('Sem resposta do background'));
      if (!response.success) return reject(new Error(response.error || 'Erro desconhecido'));
      resolve(response.data);
    });
  });
}

async function updateQuotaStatus() {
  const result = await new Promise((r) => chrome.storage.local.get(['aiUsage', 'aiProvider'], r));
  const usage = result.aiUsage || {};
  const count = usage.date === new Date().toDateString() ? (usage.count || 0) : 0;
  const provider = result.aiProvider === 'groq' ? '⚡ Groq' : '✨ Gemini';
  quotaStatus.textContent = `${provider} • ${count} uso${count === 1 ? '' : 's'} hoje • tutor local grátis`;
}

function formatAiError(error) {
  updateQuotaStatus();
  if (/quota|rate.?limit|429/i.test(error.message)) return 'Limite temporario da IA. O Tutor local continua disponivel sem custo.';
  if (/api.?key|invalid.?key|403/i.test(error.message)) return 'Chave API invalida ou expirada. Verifique nas Configuracoes (⚙️).';
  return error.message;
}

function typingHtml() {
  return '<div class="typing-indicator"><span></span><span></span><span></span></div>';
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => '<ul>' + m + '</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^([^<].+)$/gm, '<p>$1</p>');
}

function escapeHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
goToSettingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
refreshBtn.addEventListener('click', () => { chatHistory = []; if (hoverModeActive) toggleHoverMode(true); init(); });
hidePanelBtn.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'HIDE_PANEL' }));
chrome.storage.onChanged.addListener(() => updateQuotaStatus());

init();
