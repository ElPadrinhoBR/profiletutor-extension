// content/linkedin.js - Extrator + Modo Inspetor Completo para LinkedIn
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

  // ===================== MODO INSPETOR EXPANDIDO =====================
  var _hoverActive = false;
  var _tooltip = null;
  var _hoverTimeout = null;

  var HOVER_MAP = [
    // 1. BANNER & FOTO
    {
      selector: '.profile-background-image, [class*="background-image"], .cover-img',
      id: 'banner', label: '🖼️ Banner de Fundo (Capa)',
      tip: 'O banner ocupa o maior espaço visual do perfil. Transmite seu posicionamento profissional antes mesmo do texto.',
      action: 'Use uma capa customizada (1584x396px) com seu slogan, stack técnica e contato.',
    },
    {
      selector: 'img.pv-top-card-profile-picture__image--show, img.EntityPhoto-circle-5, button img.avatar',
      id: 'photo', label: '📷 Foto de Perfil',
      tip: 'Perfis com foto profissional recebem até 21x mais visualizações e 9x mais pedidos de conexão.',
      action: 'Foto recente em alta resolução (400x400px+), rosto centralizado e fundo neutro.',
    },
    {
      selector: 'h1.text-heading-xlarge, h1',
      id: 'name', label: '📛 Nome Profissional',
      tip: 'Deve ser o nome pelo qual você quer ser encontrado no mercado de trabalho.',
      action: 'Evite símbolos ou emojis no nome para não prejudicar buscas e filtros de ATS.',
    },
    {
      selector: '.text-body-medium.break-words, .ph5 .mt2 .text-body-medium',
      id: 'headline', label: '✍️ Headline (Título Profissional)',
      tip: 'Aparece abaixo do seu nome em TODO o LinkedIn (comentários, mensagens, buscas de recrutadores).',
      action: 'Estrutura: [Cargo Alvo] | [Especialidade Técnica] | [Impacto/Resultados].',
    },
    {
      selector: '[class*="open-to-work"], [class*="open_to_work"]',
      id: 'open_to_work', label: '🟢 Moldura Open to Work',
      tip: 'Sinaliza aos recrutadores que você está ativamente buscando novas oportunidades.',
      action: 'Configure cargos desejados, tipo de contrato e locais em Preferências de emprego.',
    },
    {
      selector: '.pv-top-card-v2-ctas, .pvs-profile-actions, button.artdeco-button--primary',
      id: 'profile_actions', label: '🔘 Botões de Ação (Conectar / Mensagem)',
      tip: 'Ponto de contato direto para recrutadores e conexões enviarem mensagens ou propostas.',
      action: 'Mantenha mensagens diretas abertas e personalize notas de conexão.',
    },

    // 2. DESTAQUES & MODO DE CRIAÇÃO
    {
      selector: '#featured, section[aria-label*="Destaque"], section[aria-label*="Featured"]',
      id: 'featured', label: '⭐ Seção em Destaque (Featured)',
      tip: 'Permite fixar seus melhores projetos, certificados, publicações virais ou links de portfólio no topo.',
      action: 'Fixe links do seu GitHub, artigos técnicos ou posts com maior engajamento.',
    },
    {
      selector: '#creator_mode, [class*="creator-mode"]',
      id: 'creator_mode', label: '💡 Modo de Criação de Conteúdo',
      tip: 'Destaca hashtags de tópicos que você aborda e transforma o botão Conectar em Seguir.',
      action: 'Ative se você publica conteúdos técnicos e quer crescer como autoridade na sua área.',
    },
    {
      selector: '#activities, section[class*="activity"]',
      id: 'activity', label: '💬 Atividades & Publicações Recentes',
      tip: 'Recrutadores avaliam se o profissional está ativo no mercado através de postagens e comentários.',
      action: 'Comente em posts da sua área 2-3 vezes por semana para manter o perfil aquecido no algoritmo.',
    },

    // 3. SOBRE, EXPERIÊNCIAS E SKILLS
    {
      selector: '#about',
      id: 'about', label: '📝 Seção Sobre (Resumo Executivo)',
      tip: 'Sua carta de apresentação. Conta sua história, conquistas e proposta de valor profissional.',
      action: '1º parágrafo: foco e paixão. 2º: realizações e tecnologias. 3º: chamada para contato.',
    },
    {
      selector: '#experience',
      id: 'experience', label: '💼 Experiências Profissionais',
      tip: 'O histórico detalhado de atuação. Recrutadores buscam resultados mensuráveis.',
      action: 'Use verbos de ação + métricas: "Desenvolvi X reduzindo tempo de resposta em Y%".',
    },
    {
      selector: '#education',
      id: 'education', label: '🎓 Formação Acadêmica',
      tip: 'Valida sua base teórica e compromisso com aprendizado formal e contínuo.',
      action: 'Adicione cursos superiores, bootcamps relevantes e atividades acadêmicas.',
    },
    {
      selector: '#skills',
      id: 'skills', label: '🛠️ Competências & Skills',
      tip: 'Essencial para a busca booleana e algoritmos de recomendação de vagas do LinkedIn.',
      action: 'Adicione 20 a 50 competências. Peça validações (endorsements) para as principais.',
    },
    {
      selector: '#licenses_and_certifications, #certifications',
      id: 'certifications', label: '🏆 Licenças & Certificações',
      tip: 'Prova social de conhecimento técnico atualizado em tecnologias de ponta.',
      action: 'Adicione emissor, data e o link de credencial verificável.',
    },
    {
      selector: '#recommendations',
      id: 'recommendations', label: '🌟 Recomendações de Terceiros',
      tip: 'O maior fator de confiança do LinkedIn. Depoimentos reais de quem trabalhou com você.',
      action: 'Tenha pelo menos 3 recomendações de gestores, colegas de equipe ou clientes.',
    },
    {
      selector: '#projects',
      id: 'projects', label: '🚀 Projetos Realizados',
      tip: 'Vitrine ideal para mostrar projetos práticos, repositórios do GitHub e trabalhos em equipe.',
      action: 'Descreva o problema resolvido e adicione o link do GitHub ou deploy.',
    },
    {
      selector: '#languages',
      id: 'languages', label: '🌍 Idiomas',
      tip: 'Abre portas para posições remotas globais e multinacionais.',
      action: 'Indique honestamente o nível de proficiência (Básico, Intermediário, Avançado ou Fluente).',
    },
    {
      selector: '#interests',
      id: 'interests', label: '🎯 Interesses, Empresas & Grupos',
      tip: 'Mostra quais empresas e líderes de tecnologia você acompanha.',
      action: 'Siga empresas dos seus sonhos e participe de grupos ativos da sua área.',
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
        if (target.matches && target.matches(HOVER_MAP[i].selector)) { match = HOVER_MAP[i]; break; }
        var ancestor = target.closest && target.closest(HOVER_MAP[i].selector);
        if (ancestor) { match = HOVER_MAP[i]; break; }
      } catch(ex) {}
    }
    if (match) {
      clearTimeout(_hoverTimeout);
      _hoverTimeout = setTimeout(function() { _showTooltip(match, e); _notifyPanel(match); }, 150);
    }
  }

  function _onMouseOut() {
    clearTimeout(_hoverTimeout);
    if (_tooltip) _tooltip.style.opacity = '0';
  }

  function _showTooltip(match, e) {
    if (!_tooltip) return;
    _tooltip.innerHTML = '<div class="pt-tt-header">' + match.label + '</div>' +
      '<div class="pt-tt-tip">' + match.tip + '</div>' +
      '<div class="pt-tt-action"><strong>✅ Ação recomendada:</strong> ' + match.action + '</div>';
    var x = e.clientX + 14, y = e.clientY + 14;
    if (x + 320 > window.innerWidth) x = e.clientX - 330;
    if (y + 170 > window.innerHeight) y = e.clientY - 180;
    _tooltip.style.left = x + 'px';
    _tooltip.style.top = y + 'px';
    _tooltip.style.opacity = '1';
  }

  function _notifyPanel(match) {
    try {
      chrome.runtime.sendMessage({
        type: 'HOVER_ELEMENT', platform: 'linkedin',
        element: { id: match.id, label: match.label, tip: match.tip, action: match.action }
      });
    } catch(e) {}
  }

  function _createTooltip() {
    if (document.getElementById('__pt_tooltip')) return;
    var style = document.createElement('style');
    style.id = '__pt_style';
    style.textContent = '#__pt_tooltip{position:fixed;z-index:2147483647;max-width:320px;background:#161b22;border:1.5px solid #0A66C2;border-radius:10px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,0.6);pointer-events:none;transition:opacity 0.15s ease;opacity:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:12px;line-height:1.5;color:#e6edf3;}'
      + '#__pt_tooltip .pt-tt-header{font-weight:700;font-size:13px;color:#58a6ff;margin-bottom:6px;border-bottom:1px solid #30363d;padding-bottom:4px;}'
      + '#__pt_tooltip .pt-tt-tip{color:#c9d1d9;margin-bottom:8px;}'
      + '#__pt_tooltip .pt-tt-action{background:rgba(10,102,194,0.15);border-left:3px solid #0A66C2;padding:6px 8px;border-radius:0 6px 6px 0;color:#f0f6fc;font-size:11.5px;}'
      + '#__pt_banner{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483646;background:#0A66C2;color:white;padding:8px 18px;border-radius:24px;font-family:-apple-system,sans-serif;font-size:12.5px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,0.4);pointer-events:none;border:1px solid rgba(255,255,255,0.2);}';
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
      banner.textContent = '🧠 ProfileTutor: Modo Inspetor ATIVO — passe o mouse sobre abas e seções';
      document.body.appendChild(banner);
    }
  }

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
