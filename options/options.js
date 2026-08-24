// options/options.js

// Elementos de Provider
const optGemini = document.getElementById('optGemini');
const optGroq = document.getElementById('optGroq');
const providerStatus = document.getElementById('providerStatus');

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
  ['aiProvider', 'geminiApiKey', 'geminiModel', 'groqApiKey', 'groqModel'],
  (result) => {
    // Provedor ativo
    currentActiveProvider = result.aiProvider || 'gemini';
    setProviderUI(currentActiveProvider);

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

function selectProvider(provider) {
  currentActiveProvider = provider;
  setProviderUI(provider);
  chrome.storage.local.set({ aiProvider: provider }, () => {
    showStatus(
      providerStatus,
      `Provedor ativo alterado para: ${provider === 'groq' ? '⚡ Groq Cloud' : '✨ Google Gemini'}`,
      'success'
    );
  });
}

function setProviderUI(provider) {
  if (provider === 'groq') {
    optGroq.classList.add('active', 'groq-active');
    optGemini.classList.remove('active', 'groq-active');
  } else {
    optGemini.classList.add('active');
    optGroq.classList.remove('active', 'groq-active');
  }
}

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
toggleGeminiKeyBtn.addEventListener('click', () => {
  const isPwd = geminiKeyInput.type === 'password';
  geminiKeyInput.type = isPwd ? 'text' : 'password';
  toggleGeminiKeyBtn.textContent = isPwd ? '🙈' : '👁️';
});

toggleGroqKeyBtn.addEventListener('click', () => {
  const isPwd = groqKeyInput.type === 'password';
  groqKeyInput.type = isPwd ? 'text' : 'password';
  toggleGroqKeyBtn.textContent = isPwd ? '🙈' : '👁️';
});

// Mostrar Configuração Atual
showCurrentBtn.addEventListener('click', () => {
  if (showingConfig) {
    currentConfig.style.display = 'none';
    showCurrentBtn.textContent = 'Ver configuracao atual';
    showingConfig = false;
    return;
  }

  chrome.storage.local.get(
    ['aiProvider', 'geminiApiKey', 'geminiModel', 'groqApiKey', 'groqModel'],
    (res) => {
      const provider = res.aiProvider || 'gemini';
      const gemKey = mask(res.geminiApiKey);
      const gemMod = res.geminiModel || 'gemini-2.0-flash';
      const groqKey = mask(res.groqApiKey);
      const groqMod = res.groqModel || 'llama-3.3-70b-versatile';

      currentConfig.innerHTML = `
<strong>AI_PROVIDER:</strong> ${provider.toUpperCase()}<br/>
----------------------------------------<br/>
<strong>GEMINI_API_KEY:</strong> ${gemKey}<br/>
<strong>GEMINI_MODEL:</strong>   ${gemMod}<br/>
----------------------------------------<br/>
<strong>GROQ_API_KEY:</strong>   ${groqKey}<br/>
<strong>GROQ_MODEL:</strong>     ${groqMod}
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
