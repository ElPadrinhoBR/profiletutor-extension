// background.js - Service Worker do ProfileTutor
try { importScripts('config.js'); } catch (e) {
  console.warn('[ProfileTutor] config.js nao encontrado. Configure a chave nas opcoes.');
}

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isSupported = tab.url.includes('linkedin.com') || tab.url.includes('github.com');
    chrome.sidePanel.setOptions({ tabId, path: 'panel/panel.html', enabled: isSupported });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // --- Chama a IA Gemini ---
  if (message.type === 'CALL_GEMINI') {
    chrome.storage.local.get(['geminiApiKey', 'geminiModel'], (result) => {
      const apiKey = result.geminiApiKey;
      const model = result.geminiModel || 'gemini-2.0-flash';
      handleGeminiCall({ apiKey, model, prompt: message.payload.prompt })
        .then((data) => {
          trackUsage();
          sendResponse({ success: true, data });
        })
        .catch((err) => sendResponse({ success: false, error: err.message }));
    });
    return true;
  }

  // --- Obtem dados da pagina atual ---
  if (message.type === 'GET_PAGE_DATA') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) return sendResponse({ success: false, error: 'Nenhuma aba ativa' });
      const tab = tabs[0];
      const platform = detectPlatform(tab.url);
      if (!platform) return sendResponse({ success: false, error: 'Plataforma nao suportada' });
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => typeof window.__profileTutorExtract === 'function' ? window.__profileTutorExtract() : null,
        });
        sendResponse({ success: true, data: results[0]?.result, platform });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true;
  }

  // --- Ativa/desativa modo hover na pagina ---
  if (message.type === 'TOGGLE_HOVER_MODE') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) return sendResponse({ success: false });
      const tab = tabs[0];
      const platform = detectPlatform(tab.url);
      if (!platform) return sendResponse({ success: false, error: 'Plataforma nao suportada' });
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (enable, plat) => {
            if (typeof window.__profileTutorHover === 'function') {
              window.__profileTutorHover(enable, plat);
            }
          },
          args: [message.payload.enable, platform],
        });
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true;
  }

  // --- Encaminha mensagem de hover para o painel ---
  if (message.type === 'HOVER_ELEMENT') {
    // Envia para todas as conexoes abertas (painel)
    chrome.runtime.sendMessage(message).catch(() => {});
    return false;
  }

  // --- Oculta painel ---
  if (message.type === 'HIDE_PANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.sidePanel.setOptions({ tabId: tabs[0].id, enabled: false });
    });
    return false;
  }
});

function detectPlatform(url) {
  if (!url) return null;
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('github.com')) return 'github';
  return null;
}

async function handleGeminiCall({ apiKey, prompt, model }) {
  if (!apiKey) throw new Error('Chave da API nao configurada. Abra as Configuracoes (icone engrenagem) e insira sua chave Gemini.');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro HTTP ${response.status}`);
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Resposta vazia da API Gemini.');
  return text;
}

function trackUsage() {
  const today = new Date().toDateString();
  chrome.storage.local.get(['aiUsage'], (result) => {
    const usage = result.aiUsage || {};
    const count = usage.date === today ? (usage.count || 0) + 1 : 1;
    chrome.storage.local.set({ aiUsage: { date: today, count } });
  });
}
