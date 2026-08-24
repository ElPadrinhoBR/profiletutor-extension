// panel/panel.js - Logica principal do Side Panel
import { buildAnalysisPrompt, buildTutorPrompt, buildInvestigatorPrompt, buildChatPrompt } from '../utils/prompts.js';
import { scoreLinkedIn, scoreGitHub } from '../utils/scorer.js';

// --- Estado global ---
let currentMode = 'analysis';
let currentPlatform = null;
let currentProfile = null;
let chatHistory = [];
let isLoading = false;
let hoverModeActive = false;
let lastHoveredElement = null;

// --- Elementos DOM ---
const $ = (id) => document.getElementById(id);
const platformBadge    = $('platformBadge');
const noApiKeyScreen   = $('noApiKeyScreen');
const notSupportedScreen = $('notSupportedScreen');
const loadingScreen    = $('loadingScreen');
const loadingText      = $('loadingText');
const mainContent      = $('mainContent');
const scoreCard        = $('scoreCard');
const scoreNumber      = $('scoreNumber');
const scoreLevel       = $('scoreLevel');
const scoreName        = $('scoreName');
const scoreRing        = $('scoreRing');
const analysisPanel    = $('analysisPanel');
const tutorPanel       = $('tutorPanel');
const investigatorPanel = $('investigatorPanel');
const chatPanel        = $('chatPanel');
const analyzeBtn       = $('analyzeBtn');
const investigateBtn   = $('investigateBtn');
const sendBtn          = $('sendBtn');
const refreshBtn       = $('refreshBtn');
const settingsBtn      = $('settingsBtn');
const goToSettingsBtn  = $('goToSettingsBtn');
const hidePanelBtn     = $('hidePanelBtn');
const quotaStatus      = $('quotaStatus');
const aiResult         = $('aiResult');
const tutorResult      = $('tutorResult');
const investigatorResult = $('investigatorResult');
const chatMessages     = $('chatMessages');
const chatInput        = $('chatInput');
const hoverModeBtn     = $('hoverModeBtn');
const hoverPanelBanner = $('hoverPanelBanner');
const hoverInfoCard    = $('hoverInfoCard');
const hoverInfoLabel   = $('hoverInfoLabel');
const hoverInfoTip     = $('hoverInfoTip');
const hoverInfoAction  = $('hoverInfoAction');
const hoverAskAiBtn    = $('hoverAskAiBtn');
const hoverOffBtn      = $('hoverOffBtn');

// --- Inicializacao ---
async function init() {
  showScreen('loading');
  loadingText.textContent = 'Verificando configuracoes...';

  // Verifica API key
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
  } catch (err) {
    showScreen('notSupported');
  }
}

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
  const scoreData = currentPlatform === 'linkedin'
    ? scoreLinkedIn(currentProfile)
    : scoreGitHub(currentProfile);
  animateScore(scoreData.total, scoreData.level);
  setupTutorTopics();

  $('investigatorDesc').textContent = (currentProfile && !currentProfile.isOwnProfile)
    ? 'Analise detalhada de: ' + (currentProfile.name || currentProfile.username || 'Este perfil')
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
    const response = await callGemini(buildTutorPrompt(currentPlatform, topicLabel, ctx));
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
    linkedin_score:['O Social Selling Index avalia presenca, rede e relacionamento.', 'Priorize perfil claro e conversas relevantes — o indice e consequencia, nao meta.'],
    readme:       ['O README do perfil e sua pagina de apresentacao dentro do GitHub.', 'Explique quem voce e, tecnologias, projetos e formas de contato sem poluir.'],
    pinned_repos: ['Repositorios fixados sao sua vitrine para quem chega ao perfil.', 'Fixe projetos com README, demonstracao e objetivo claro.'],
    contributions:['O grafico mostra atividade publica ao longo do ano.', 'Contribuicoes relevantes valem mais que volume: qualidade sobre quantidade.'],
    stars:        ['Stars indicam que outros acharam seu repositorio util ou interessante.', 'Crescem com projetos resolvendo problemas reais e boa documentacao.'],
    followers:    ['Seguidores acompanham seus projetos e atividade publica.', 'Compartilhe projetos, ajude em issues e mantenha presenca consistente.'],
    bio:          ['A bio e sua apresentacao em poucas palavras.', 'Diga area, tecnologias e inclua um contato quando fizer sentido.'],
    fork:         ['Fork cria uma copia de repositorio para experimentar ou propor mudancas.', 'Base para contribuir em projetos via pull request.'],
    issues_prs:   ['Issues registram perguntas, bugs e ideias; PRs propõem mudancas.', 'Descreva bem o contexto e mantenha cada contribuicao pequena e focada.'],
    github_pages: ['GitHub Pages publica um site diretamente de um repositorio.', 'Otimo para portfolio, documentacao ou demonstracao de projeto estatico.'],
    profile_readme_tips:['Um README forte facilita entender seu trabalho em segundos.', 'Inclua objetivo, demo, tecnologias e proximos passos.'],
  };
  const [intro, action] = content[topicId] || [`Entenda melhor: ${topicLabel}.`, 'Observe este item no seu perfil e adapte-o ao seu objetivo.'];
  return `<h3>🎓 ${topicLabel}</h3><p>${intro}</p><p><strong>Dica pratica:</strong> ${action}</p><p class="local-note">✓ Explicacao local — nao usou IA nem sua cota.</p>`;
}

// ===================== MODO HOVER =====================
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

// Recebe eventos de hover vindos do content script via background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'HOVER_ELEMENT' && hoverModeActive && message.element) {
    const el = message.element;
    lastHoveredElement = el;
    hoverInfoLabel.textContent  = el.label;
    hoverInfoTip.textContent    = el.tip;
    hoverInfoAction.innerHTML   = '<strong>✅ Acao:</strong> ' + el.action;
    hoverInfoCard.style.display = 'block';
    // Scroll suave para o card de info
    hoverInfoCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

hoverAskAiBtn.addEventListener('click', async () => {
  if (!lastHoveredElement || isLoading) return;
  isLoading = true;
  hoverAskAiBtn.disabled = true;
  hoverAskAiBtn.textContent = '⏳ Consultando IA...';
  const prevContent = hoverInfoCard.innerHTML;
  try {
    const ctx = JSON.stringify({ platform: currentPlatform, profile: currentProfile });
    const response = await callGemini(buildTutorPrompt(currentPlatform, lastHoveredElement.label, ctx));
    // Vai para o painel tutor e mostra la
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

// ===================== BOTOES PRINCIPAIS =====================
analyzeBtn.addEventListener('click', async () => {
  if (isLoading) return;
  isLoading = true;
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<span>⏳</span> Analisando...';
  aiResult.style.display = 'block';
  aiResult.innerHTML = typingHtml();
  try {
    const response = await callGemini(buildAnalysisPrompt(currentPlatform, currentProfile));
    aiResult.innerHTML = formatMarkdown(response);
    analyzeBtn.innerHTML = '<span>🔄</span> Reanalisar';
  } catch (err) {
    aiResult.innerHTML = `<div class="error-msg">❌ ${formatAiError(err)}</div>`;
    analyzeBtn.innerHTML = '<span>✨</span> Tentar Novamente';
  }
  analyzeBtn.disabled = false;
  isLoading = false;
});

investigateBtn.addEventListener('click', async () => {
  if (isLoading) return;
  isLoading = true;
  investigateBtn.disabled = true;
  investigateBtn.innerHTML = '<span>⏳</span> Investigando...';
  investigatorResult.style.display = 'block';
  investigatorResult.innerHTML = typingHtml();
  try {
    const response = await callGemini(buildInvestigatorPrompt(currentPlatform, currentProfile));
    investigatorResult.innerHTML = formatMarkdown(response);
    investigateBtn.innerHTML = '<span>🔄</span> Re-investigar';
  } catch (err) {
    investigatorResult.innerHTML = `<div class="error-msg">❌ ${formatAiError(err)}</div>`;
    investigateBtn.innerHTML = '<span>🔍</span> Tentar Novamente';
  }
  investigateBtn.disabled = false;
  isLoading = false;
});

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
    const response = await callGemini(buildChatPrompt(currentPlatform, msg, currentProfile, chatHistory.slice(-6)));
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

// --- Navegacao ---
document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});
function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const modeBtn = document.querySelector(`[data-mode="${mode}"]`);
  if (modeBtn) modeBtn.classList.add('active');
  scoreCard.style.display          = mode === 'analysis'    ? 'flex'  : 'none';
  analysisPanel.style.display      = mode === 'analysis'    ? 'block' : 'none';
  tutorPanel.style.display         = mode === 'tutor'       ? 'block' : 'none';
  investigatorPanel.style.display  = mode === 'investigator'? 'block' : 'none';
  chatPanel.style.display          = mode === 'chat'        ? 'flex'  : 'none';
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
  return new Promise((resolve) => chrome.storage.local.get(['geminiApiKey'], (r) => resolve(r.geminiApiKey || null)));
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
async function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'CALL_GEMINI', payload: { prompt } }, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!response) return reject(new Error('Sem resposta do worker'));
      if (!response.success) return reject(new Error(response.error || 'Erro desconhecido'));
      resolve(response.data);
    });
  });
}

async function updateQuotaStatus() {
  const result = await new Promise((r) => chrome.storage.local.get(['aiUsage'], r));
  const usage = result.aiUsage || {};
  const count = usage.date === new Date().toDateString() ? (usage.count || 0) : 0;
  quotaStatus.textContent = `IA: ${count} uso${count === 1 ? '' : 's'} hoje • tutor local e gratis`;
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
