// options/options.js

// Elementos de Provider
const optGemini = document.getElementById('optGemini');
const optGroq = document.getElementById('optGroq');
const optOpenRouter = document.getElementById('optOpenRouter');
const providerStatus = document.getElementById('providerStatus');

// Elementos OpenRouter
const openrouterKeyInput = document.getElementById('openrouterKeyInput');
const openrouterModelInput = document.getElementById('openrouterModelInput');
const toggleOpenrouterKeyBtn = document.getElementById('toggleOpenrouterKeyBtn');
const saveOpenRouterBtn = document.getElementById('saveOpenRouterBtn');
const openrouterStatus = document.getElementById('openrouterStatus');

// Elementos Gemini
const geminiKeyInput = document.getElementById('geminiKeyInput');
const geminiModelInput = document.getElementById('geminiModelInput');
const toggleGeminiKeyBtn = document.getElementById('toggleGeminiKeyBtn');
const saveGeminiBtn = document.getElementById('saveGeminiBtn');
const geminiStatus = document.getElementById('geminiStatus');

// Elementos Groq
const groqKeyInput = document.getElementById('groqKeyInput');
const groqModelInput = document.getElementById('groqModelInput');
const toggleGroqKeyBtn = document.getElementById('toggleGroqKeyBtn');
const saveGroqBtn = document.getElementById('saveGroqBtn');
const groqStatus = document.getElementById('groqStatus');

// Utilitários
const showCurrentBtn = document.getElementById('showCurrentBtn');
const currentConfig = document.getElementById('currentConfig');
const clearDataBtn = document.getElementById('clearDataBtn');
const clearStatus = document.getElementById('clearStatus');

let currentActiveProvider = 'gemini';
let showingConfig = false;

// Carrega configuracoes salvas
chrome.storage.local.get(
  ['aiProvider', 'geminiApiKey', 'geminiModel', 'groqApiKey', 'groqModel', 'openrouterApiKey', 'openrouterModel'],
  (result) => {
    currentActiveProvider = result.aiProvider || 'gemini';
    setProviderUI(currentActiveProvider);

    // OpenRouter
    if (result.openrouterApiKey) openrouterKeyInput.value = result.openrouterApiKey;
    openrouterModelInput.value = result.openrouterModel || 'deepseek/deepseek-r1:free';

    // Gemini
    if (result.geminiApiKey) geminiKeyInput.value = result.geminiApiKey;
    geminiModelInput.value = result.geminiModel || 'gemini-2.0-flash';

    // Groq
    if (result.groqApiKey) groqKeyInput.value = result.groqApiKey;
    groqModelInput.value = result.groqModel || 'llama-3.3-70b-versatile';
  }
);

// Toggle de Provedor
optGemini.addEventListener('click', () => selectProvider('gemini'));
optGroq.addEventListener('click', () => selectProvider('groq'));
optOpenRouter.addEventListener('click', () => selectProvider('openrouter'));

function selectProvider(provider) {
  currentActiveProvider = provider;
  setProviderUI(provider);
  chrome.storage.local.set({ aiProvider: provider }, () => {
    const labels = {
      gemini: '✨ Google Gemini',
      groq: '⚡ Groq Cloud',
      openrouter: '🌐 OpenRouter (DeepSeek/Llama/Claude)'
    };
    showStatus(providerStatus, `Provedor ativo: ${labels[provider]}`, 'success');
  });
}

function setProviderUI(provider) {
  optGemini.className = 'provider-option' + (provider === 'gemini' ? ' active gemini-active' : '');
  optGroq.className = 'provider-option' + (provider === 'groq' ? ' active groq-active' : '');
  optOpenRouter.className = 'provider-option' + (provider === 'openrouter' ? ' active openrouter-active' : '');
}

// Chips de Modelos
document.querySelectorAll('.model-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const model = chip.dataset.model;
    const parentCard = chip.closest('.card');
    if (!parentCard) return;

    const input = parentCard.querySelector('input[type="text"]');
    if (input) {
      input.value = model;
      input.focus();
    }
  });
});

// Salvar OpenRouter
saveOpenRouterBtn.addEventListener('click', () => {
  const key = openrouterKeyInput.value.trim();
  const model = openrouterModelInput.value.trim() || 'deepseek/deepseek-r1:free';

  if (!key || key.length < 8) {
    showStatus(openrouterStatus, 'Chave OpenRouter vazia ou muito curta.', 'error');
    return;
  }

  chrome.storage.local.set({ openrouterApiKey: key, openrouterModel: model }, () => {
    showStatus(openrouterStatus, 'Configuracoes do OpenRouter salvas com sucesso!', 'success');
  });
});

// Salvar Gemini
saveGeminiBtn.addEventListener('click', () => {
  const key = geminiKeyInput.value.trim();
  const model = geminiModelInput.value.trim() || 'gemini-2.0-flash';

  if (!key || key.length < 8) {
    showStatus(geminiStatus, 'Chave Gemini vazia ou muito curta.', 'error');
    return;
  }

  chrome.storage.local.set({ geminiApiKey: key, geminiModel: model }, () => {
    showStatus(geminiStatus, 'Configuracoes do Gemini salvas com sucesso!', 'success');
  });
});

// Salvar Groq
saveGroqBtn.addEventListener('click', () => {
  const key = groqKeyInput.value.trim();
  const model = groqModelInput.value.trim() || 'llama-3.3-70b-versatile';

  if (!key || key.length < 8) {
    showStatus(groqStatus, 'Chave Groq vazia ou muito curta.', 'error');
    return;
  }

  chrome.storage.local.set({ groqApiKey: key, groqModel: model }, () => {
    showStatus(groqStatus, 'Configuracoes do Groq salvas com sucesso!', 'success');
  });
});

// Alternar visibilidade das chaves
toggleOpenrouterKeyBtn.addEventListener('click', () => togglePassword(openrouterKeyInput, toggleOpenrouterKeyBtn));
toggleGeminiKeyBtn.addEventListener('click', () => togglePassword(geminiKeyInput, toggleGeminiKeyBtn));
toggleGroqKeyBtn.addEventListener('click', () => togglePassword(groqKeyInput, toggleGroqKeyBtn));

function togglePassword(input, btn) {
  const isPwd = input.type === 'password';
  input.type = isPwd ? 'text' : 'password';
  btn.textContent = isPwd ? '🙈' : '👁️';
}

// Mostrar Configuração Atual
showCurrentBtn.addEventListener('click', () => {
  if (showingConfig) {
    currentConfig.style.display = 'none';
    showCurrentBtn.textContent = 'Ver configuracao atual';
    showingConfig = false;
    return;
  }

  chrome.storage.local.get(
    ['aiProvider', 'geminiApiKey', 'geminiModel', 'groqApiKey', 'groqModel', 'openrouterApiKey', 'openrouterModel'],
    (res) => {
      const provider = res.aiProvider || 'gemini';
      const gemKey = mask(res.geminiApiKey);
      const gemMod = res.geminiModel || 'gemini-2.0-flash';
      const groqKey = mask(res.groqApiKey);
      const groqMod = res.groqModel || 'llama-3.3-70b-versatile';
      const orKey = mask(res.openrouterApiKey);
      const orMod = res.openrouterModel || 'deepseek/deepseek-r1:free';

      currentConfig.innerHTML = `
<strong>AI_PROVIDER:</strong>        ${provider.toUpperCase()}<br/>
----------------------------------------<br/>
<strong>OPENROUTER_API_KEY:</strong> ${orKey}<br/>
<strong>OPENROUTER_MODEL:</strong>   ${orMod}<br/>
----------------------------------------<br/>
<strong>GEMINI_API_KEY:</strong>     ${gemKey}<br/>
<strong>GEMINI_MODEL:</strong>       ${gemMod}<br/>
----------------------------------------<br/>
<strong>GROQ_API_KEY:</strong>       ${groqKey}<br/>
<strong>GROQ_MODEL:</strong>         ${groqMod}
`;
      currentConfig.style.display = 'block';
      showCurrentBtn.textContent = 'Ocultar configuracao';
      showingConfig = true;
    }
  );
});

function mask(key) {
  if (!key) return '(nao configurada)';
  if (key.length <= 10) return '••••••••';
  return key.substring(0, 6) + '••••••••' + key.slice(-4);
}

// Limpar Dados
clearDataBtn.addEventListener('click', () => {
  if (!confirm('Deseja realmente remover todas as chaves e preferencias salvas?')) return;
  chrome.storage.local.clear(() => {
    openrouterKeyInput.value = '';
    openrouterModelInput.value = 'deepseek/deepseek-r1:free';
    geminiKeyInput.value = '';
    geminiModelInput.value = 'gemini-2.0-flash';
    groqKeyInput.value = '';
    groqModelInput.value = 'llama-3.3-70b-versatile';
    selectProvider('gemini');
    showStatus(clearStatus, 'Todos os dados foram limpos.', 'success');
  });
});

function showStatus(el, msg, type) {
  el.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  el.className = 'status-msg ' + type;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 3500);
}
