// options/options.js

const apiKeyInput   = document.getElementById('apiKeyInput');
const saveKeyBtn    = document.getElementById('saveKeyBtn');
const keyStatus     = document.getElementById('keyStatus');
const toggleKeyBtn  = document.getElementById('toggleKeyBtn');
const modelInput    = document.getElementById('modelInput');
const saveModelBtn  = document.getElementById('saveModelBtn');
const modelStatus   = document.getElementById('modelStatus');
const clearDataBtn  = document.getElementById('clearDataBtn');
const clearStatus   = document.getElementById('clearStatus');
const showCurrentBtn= document.getElementById('showCurrentBtn');
const currentConfig = document.getElementById('currentConfig');

let showingConfig = false;

chrome.storage.local.get(['geminiApiKey', 'geminiModel'], (result) => {
  if (result.geminiApiKey) apiKeyInput.value = result.geminiApiKey;
  modelInput.value = result.geminiModel || 'gemini-2.0-flash';
});

// Salva API Key — sem restricao de prefixo
saveKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key || key.length < 8) {
    showStatus(keyStatus, 'Chave muito curta ou vazia.', 'error');
    return;
  }
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    showStatus(keyStatus, 'Chave salva com sucesso!', 'success');
  });
});

// Mostrar/ocultar chave
toggleKeyBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  toggleKeyBtn.textContent = isPassword ? 'Ocultar' : 'Mostrar';
});

// Salva modelo (campo livre)
saveModelBtn.addEventListener('click', () => {
  const model = modelInput.value.trim();
  if (!model) { showStatus(modelStatus, 'Digite o nome do modelo.', 'error'); return; }
  chrome.storage.local.set({ geminiModel: model }, () => {
    showStatus(modelStatus, 'Modelo salvo: ' + model, 'success');
  });
});

// Toggle config atual
showCurrentBtn.addEventListener('click', () => {
  if (showingConfig) {
    currentConfig.style.display = 'none';
    showCurrentBtn.textContent = 'Ver configuracao atual';
    showingConfig = false;
    return;
  }
  chrome.storage.local.get(['geminiApiKey', 'geminiModel'], (result) => {
    const key = result.geminiApiKey || '(nao configurada)';
    const maskedKey = key.length > 12
      ? key.substring(0, 6) + '...' + key.slice(-4)
      : key;
    currentConfig.innerHTML =
      'GEMINI_API_KEY = ' + maskedKey + '<br/>GEMINI_MODEL = ' + (result.geminiModel || 'gemini-2.0-flash');
    currentConfig.style.display = 'block';
    showCurrentBtn.textContent = 'Ocultar';
    showingConfig = true;
  });
});

// Limpa dados
clearDataBtn.addEventListener('click', () => {
  if (!confirm('Tem certeza? Isso remove sua chave API e todas as configuracoes.')) return;
  chrome.storage.local.clear(() => {
    apiKeyInput.value = '';
    modelInput.value = 'gemini-2.0-flash';
    showStatus(clearStatus, 'Dados limpos com sucesso.', 'success');
  });
});

function showStatus(el, msg, type) {
  el.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  el.className = 'status-msg ' + type;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}
