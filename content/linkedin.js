// content/linkedin.js - Extrator + Modo Hover para LinkedIn
(function () {
  'use strict';

  // ===================== EXTRACAO DO PERFIL =====================
  window.__profileTutorExtract = function () {
    var profile = {};
    try {
      profile.name = _getText('h1.text-heading-xlarge') || _getText('h1');
      profile.headline = _getText('.text-body-medium.break-words') || _getText('.ph5 .mt2 .text-body-medium');
      profile.location = _getText('.text-body-small.inline.t-black--light.break-words');

      var photoEl = document.querySelector('img.pv-top-card-profile-picture__image--show')
        || document.querySelector('img.EntityPhoto-circle-5')
        || document.querySelector('button img.avatar');
      profile.hasPhoto = !!photoEl;
      profile.photoUrl = photoEl ? photoEl.src : null;
      profile.isDefaultPhoto = !photoEl;

      profile.openToWork = _hasEl('[class*="open-to-work"]') || document.body.innerText.indexOf('#OpenToWork') > -1;
      profile.isHiring = document.body.innerText.indexOf("I'm hiring") > -1 || document.body.innerText.indexOf('Estou contratando') > -1;
      profile.about = _getText('#about ~ div .inline-show-more-text') || _getText('.pv-shared-text-with-see-more .inline-show-more-text') || '';

      profile.experiences = _extractList('#experience', function(item) {
        var title = _qText(item, '.t-bold span');
        var company = _qText(item, '.t-14.t-normal span');
        var duration = _qText(item, '.pvs-entity__caption-wrapper');
        return (title || company) ? { title: title, company: company, duration: duration } : null;
      });

      profile.education = _extractList('#education', function(item) {
        var school = _qText(item, '.t-bold span');
        var degree = _qText(item, '.t-14.t-normal span');
        return school ? { school: school, degree: degree } : null;
      });

      profile.skills = _extractTextList('#skills', '.t-bold span', 20);
      profile.certifications = _extractTextList('#licenses_and_certifications, #certifications', '.t-bold span', 50);

      var recSection = document.querySelector('#recommendations');
      profile.recommendationsCount = recSection
        ? (recSection.parentElement ? recSection.parentElement.querySelectorAll('li.artdeco-list__item').length : 0)
        : 0;

      profile.languages = _extractTextList('#languages', '.t-bold span', 20);
      profile.isOwnProfile = _hasEl('[data-view-name="profile-edit-button"]') || _hasEl('[aria-label*="Editar"]');
      profile.profileUrl = window.location.href;
      profile.platform = 'linkedin';
      profile.extractedAt = new Date().toISOString();
    } catch (err) {
      profile.extractError = err.message;
    }
    return profile;
  };

  // ===================== MODO HOVER =====================
  var _hoverActive = false;
  var _tooltip = null;
  var _hoverTimeout = null;

  // Mapa de seletores → dicas de otimizacao
  var HOVER_MAP = [
    {
      selector: 'img.pv-top-card-profile-picture__image--show, img.EntityPhoto-circle-5, button img.avatar',
      id: 'photo',
      label: '📷 Foto de Perfil',
      tip: 'Use uma foto profissional com boa iluminacao, rosto visivel e fundo neutro. Perfis com foto recebem ate 21x mais visualizacoes.',
      action: 'Substitua por uma foto em alta resolucao (400x400px+) com rosto centralizado.',
    },
    {
      selector: 'h1.text-heading-xlarge',
      id: 'name',
      label: '📛 Seu Nome',
      tip: 'Seu nome deve ser o nome profissional pelo qual e reconhecido. Evite apelidos ou caracteres especiais que dificultem buscas.',
      action: 'Certifique-se de que e o mesmo nome usado no curriculo e em outros canais profissionais.',
    },
    {
      selector: '.text-body-medium.break-words',
      id: 'headline',
      label: '✍️ Headline',
      tip: 'A headline aparece ao lado do seu nome em TODAS as buscas, comentarios e sugestoes. E seu cartao de visitas mais visto.',
      action: 'Formato ideal: [Cargo] | [Especialidade] | [Diferencial]. Ex: Dev Full Stack | React & Node | Foco em Performance.',
    },
    {
      selector: '.text-body-small.inline.t-black--light.break-words',
      id: 'location',
      label: '📍 Localizacao',
      tip: 'A localizacao influencia buscas por proximidade e filtros de vagas. Recrutadores filtram por regiao.',
      action: 'Use cidade + estado. Se trabalha remoto, adicione "Remoto" ou "Disponivel para remoto" na headline.',
    },
    {
      selector: '[class*="open-to-work"], [class*="open_to_work"]',
      id: 'open_to_work',
      label: '🟢 Open to Work',
      tip: 'A moldura verde aumenta a visibilidade com recrutadores. Configure os tipos de cargo e modalidade desejados.',
      action: 'Em Configuracoes > Preferencias de emprego, escolha: cargos-alvo, localidade, tipo de emprego e visibilidade (so recrutadores ou todos).',
    },
    {
      selector: '#about',
      id: 'about',
      label: '📝 Secao Sobre',
      tip: 'O campo "Sobre" e sua carta de apresentacao. Deve contar sua historia, nao so listar habilidades.',
      action: 'Estrutura recomendada: 1) Quem sou e meu foco. 2) Principais resultados concretos. 3) Tecnologias/areas. 4) Convite para contato.',
    },
    {
      selector: '#experience',
      id: 'experience',
      label: '💼 Experiencias',
      tip: 'Experiencias sao o coração do perfil. Recrutadores passam a maior parte do tempo aqui.',
      action: 'Para cada cargo: use verbos de acao + numeros. Ex: "Reduzi o tempo de build em 40% implementando cache no CI/CD". Evite so listar responsabilidades.',
    },
    {
      selector: '#education',
      id: 'education',
      label: '🎓 Educacao',
      tip: 'Educacao valida formacao academica e mostra trajetoria de aprendizado.',
      action: 'Adicione cursos, bootcamps e certificacoes relevantes alem da graduacao. Mantenha as datas atualizadas.',
    },
    {
      selector: '#skills',
      id: 'skills',
      label: '🛠️ Competencias/Skills',
      tip: 'Skills sao usadas pelo algoritmo do LinkedIn para recomendar seu perfil a recrutadores que buscam por essas habilidades.',
      action: 'Adicione 20-50 skills relevantes. Priorize as que voce realmente usa. Peca endorsements para as principais.',
    },
    {
      selector: '#licenses_and_certifications, #certifications',
      id: 'certifications',
      label: '🏆 Certificacoes',
      tip: 'Certificacoes provam aprendizado formal e diferenciam candidatos com experiencias similares.',
      action: 'Adicione o emissor, data e link de credencial. Remova certificacoes antigas e irrelevantes para seu objetivo atual.',
    },
    {
      selector: '#recommendations',
      id: 'recommendations',
      label: '⭐ Recomendacoes',
      tip: 'Recomendacoes sao o social proof mais valioso do LinkedIn. Mostram como e trabalhar com voce na pratica.',
      action: 'Peca recomendacoes especificas: "Pode mencionar o projeto X e como lidamos com o prazo?". 3+ recomendacoes e o ideal.',
    },
    {
      selector: '#languages',
      id: 'languages',
      label: '🌍 Idiomas',
      tip: 'Idiomas abrem oportunidades internacionais e demonstram versatilidade.',
      action: 'Seja honesto sobre o nivel. Use: Basico / Intermediario / Avancado / Fluente / Nativo.',
    },
    {
      selector: '#projects',
      id: 'projects',
      label: '🚀 Projetos',
      tip: 'A secao de projetos permite mostrar trabalhos praticos, mesmo sem experiencia formal.',
      action: 'Adicione link do GitHub, deploy ou demo. Descreva o problema resolvido, tecnologias e impacto.',
    },
  ];

  window.__profileTutorHover = function (enable, platform) {
    _hoverActive = enable;
    if (enable) {
      _createTooltip();
      document.addEventListener('mouseover', _onMouseOver, true);
      document.addEventListener('mouseout', _onMouseOut, true);
      document.body.style.cursor = 'crosshair';
      _showBanner(true);
    } else {
      _removeTooltip();
      document.removeEventListener('mouseover', _onMouseOver, true);
      document.removeEventListener('mouseout', _onMouseOut, true);
      document.body.style.cursor = '';
      _showBanner(false);
    }
  };

  function _onMouseOver(e) {
    if (!_hoverActive) return;
    var target = e.target;
    var match = null;

    for (var i = 0; i < HOVER_MAP.length; i++) {
      try {
        if (target.matches && target.matches(HOVER_MAP[i].selector)) {
          match = HOVER_MAP[i]; break;
        }
        var ancestor = target.closest && target.closest(HOVER_MAP[i].selector);
        if (ancestor) { match = HOVER_MAP[i]; break; }
      } catch(ex) {}
    }

    if (match) {
      clearTimeout(_hoverTimeout);
      _hoverTimeout = setTimeout(function() {
        _showTooltip(match, e);
        _notifyPanel(match);
      }, 200);
    }
  }

  function _onMouseOut(e) {
    clearTimeout(_hoverTimeout);
    if (_tooltip) _tooltip.style.opacity = '0';
  }

  function _showTooltip(match, e) {
    if (!_tooltip) return;
    _tooltip.innerHTML = '<div class="pt-tt-header">' + match.label + '</div>' +
      '<div class="pt-tt-tip">' + match.tip + '</div>' +
      '<div class="pt-tt-action"><strong>✅ Acao:</strong> ' + match.action + '</div>';

    var x = e.clientX + 12;
    var y = e.clientY + 12;
    if (x + 300 > window.innerWidth) x = e.clientX - 310;
    if (y + 140 > window.innerHeight) y = e.clientY - 150;

    _tooltip.style.left = x + 'px';
    _tooltip.style.top = y + 'px';
    _tooltip.style.opacity = '1';
  }

  function _notifyPanel(match) {
    try {
      chrome.runtime.sendMessage({
        type: 'HOVER_ELEMENT',
        platform: 'linkedin',
        element: { id: match.id, label: match.label, tip: match.tip, action: match.action }
      });
    } catch(e) {}
  }

  function _createTooltip() {
    if (document.getElementById('__pt_tooltip')) return;
    var style = document.createElement('style');
    style.id = '__pt_style';
    style.textContent = '#__pt_tooltip{position:fixed;z-index:2147483647;max-width:300px;background:#1a1f27;border:1px solid #0A66C2;border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,0.5);pointer-events:none;transition:opacity 0.15s;opacity:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:12px;line-height:1.5;color:#e6edf3;}'
      + '#__pt_tooltip .pt-tt-header{font-weight:700;font-size:13px;color:#58a6ff;margin-bottom:6px;}'
      + '#__pt_tooltip .pt-tt-tip{color:#c9d1d9;margin-bottom:8px;}'
      + '#__pt_tooltip .pt-tt-action{background:rgba(10,102,194,0.15);border-left:3px solid #0A66C2;padding:6px 8px;border-radius:0 6px 6px 0;color:#e6edf3;font-size:11px;}'
      + '#__pt_banner{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:2147483646;background:#0A66C2;color:white;padding:8px 16px;border-radius:20px;font-family:-apple-system,sans-serif;font-size:12px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;}';
    document.head.appendChild(style);

    _tooltip = document.createElement('div');
    _tooltip.id = '__pt_tooltip';
    document.body.appendChild(_tooltip);
  }

  function _removeTooltip() {
    var tt = document.getElementById('__pt_tooltip');
    if (tt) tt.remove();
    var st = document.getElementById('__pt_style');
    if (st) st.remove();
    _showBanner(false);
    _tooltip = null;
  }

  function _showBanner(show) {
    var existing = document.getElementById('__pt_banner');
    if (existing) existing.remove();
    if (show) {
      var banner = document.createElement('div');
      banner.id = '__pt_banner';
      banner.textContent = '🧠 ProfileTutor: Modo Inspetor ATIVO — passe o mouse sobre os itens';
      document.body.appendChild(banner);
    }
  }

  // --- Auxiliares ---
  function _getText(sel, fb) { try { var el = document.querySelector(sel); return el ? el.innerText.trim() : (fb||''); } catch(e) { return fb||''; } }
  function _qText(el, sel) { try { var f = el.querySelector(sel); return f ? f.innerText.trim() : ''; } catch(e) { return ''; } }
  function _hasEl(sel) { try { return !!document.querySelector(sel); } catch(e) { return false; } }
  function _extractList(anchorSel, mapFn) {
    var result = [];
    try {
      var sec = document.querySelector(anchorSel);
      if (!sec || !sec.parentElement) return result;
      var items = sec.parentElement.querySelectorAll('li.artdeco-list__item');
      for (var i = 0; i < items.length; i++) { var v = mapFn(items[i]); if (v) result.push(v); }
    } catch(e) {}
    return result;
  }
  function _extractTextList(anchorSel, itemSel, max) {
    var result = [];
    try {
      var sec = document.querySelector(anchorSel);
      if (!sec || !sec.parentElement) return result;
      var items = sec.parentElement.querySelectorAll(itemSel);
      for (var i = 0; i < Math.min(items.length, max); i++) {
        var t = items[i].innerText.trim();
        if (t) result.push(t);
      }
    } catch(e) {}
    return result;
  }

  try { chrome.runtime.sendMessage({ type: 'CONTENT_READY', platform: 'linkedin' }); } catch(e) {}
})();
