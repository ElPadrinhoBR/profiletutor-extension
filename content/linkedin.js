// content/linkedin.js - Extrator + Modo Inspetor Completo e Ultra-Resiliente para LinkedIn
(function () {
  'use strict';

  // ===================== EXTRACAO DO PERFIL =====================
  window.__profileTutorExtract = function () {
    var profile = {};
    try {
      profile.platform = 'linkedin';
      profile.profileUrl = window.location.href;
      profile.extractedAt = new Date().toISOString();

      // Verifica se esta em um perfil (/in/ ou /pub/)
      var isProfileUrl = window.location.pathname.indexOf('/in/') > -1 || window.location.pathname.indexOf('/pub/') > -1;
      profile.isProfilePage = isProfileUrl;

      // --- NOME ---
      var nameSelectors = [
        'h1.text-heading-xlarge',
        'h1.inline.t-24.v-align-middle.break-words',
        'h1[class*="text-heading"]',
        '.pv-text-details__left-panel h1',
        '.pv-top-card--list h1',
        'section.artdeco-card h1',
        'div.ph5 h1',
        'h1'
      ];
      profile.name = _findFirstText(nameSelectors);

      // Fallback do nome via Document Title (ex: "Roberto LMC | LinkedIn")
      if (!profile.name && document.title) {
        var cleanTitle = document.title.replace(/\s*\|\s*LinkedIn.*$/i, '').replace(/\s*-\s*LinkedIn.*$/i, '').trim();
        if (cleanTitle && cleanTitle.toLowerCase() !== 'linkedin' && cleanTitle.toLowerCase() !== 'feed') {
          profile.name = cleanTitle;
        }
      }

      // --- HEADLINE ---
      var headlineSelectors = [
        '.text-body-medium.break-words',
        '.pv-text-details__left-panel .text-body-medium',
        'div[data-generated-suggestion-target]',
        '.ph5 .mt2 .text-body-medium',
        'section.artdeco-card .text-body-medium',
        '.pv-top-card--list-bullet .text-body-medium'
      ];
      profile.headline = _findFirstText(headlineSelectors);
      if (!profile.headline) {
        var metaDesc = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
        if (metaDesc) profile.headline = metaDesc.getAttribute('content') || '';
      }

      // --- LOCALIZACAO ---
      var locationSelectors = [
        '.text-body-small.inline.t-black--light.break-words',
        '.pv-text-details__left-panel span.text-body-small',
        '[data-field="location_name"]',
        'section.artdeco-card .text-body-small',
        '.pv-top-card--list-bullet .text-body-small'
      ];
      profile.location = _findFirstText(locationSelectors);

      // --- FOTO DE PERFIL ---
      var photoSelectors = [
        'img.pv-top-card-profile-picture__image--show',
        'img.EntityPhoto-circle-5',
        'img.evi-image',
        'img[class*="profile-photo"]',
        '.pv-top-card__photo img',
        'button[aria-label*="foto"] img',
        'button img.avatar',
        '.presence-entity__image'
      ];
      var photoEl = null;
      for (var p = 0; p < photoSelectors.length; p++) {
        var el = document.querySelector(photoSelectors[p]);
        if (el && el.src) { photoEl = el; break; }
      }
      profile.hasPhoto = !!photoEl;
      profile.photoUrl = photoEl ? photoEl.src : null;
      profile.isDefaultPhoto = !photoEl || (photoEl.src && photoEl.src.indexOf('ghost') > -1);

      // --- OPEN TO WORK & HIRING ---
      profile.openToWork = _hasEl('[class*="open-to-work"]') || _hasEl('[class*="open_to_work"]') || document.body.innerText.indexOf('#OpenToWork') > -1;
      profile.isHiring = document.body.innerText.indexOf("I'm hiring") > -1 || document.body.innerText.indexOf('Estou contratando') > -1;

      // --- SOBRE (ABOUT) ---
      var aboutSelectors = [
        '#about ~ div .inline-show-more-text',
        '#about ~ .pvs-list__outer-container .inline-show-more-text',
        'section:has(#about) .inline-show-more-text',
        'section[data-section="about"] .inline-show-more-text',
        '.pv-shared-text-with-see-more .inline-show-more-text',
        '#about + div span.visually-hidden'
      ];
      profile.about = _findFirstText(aboutSelectors);
      if (!profile.about) {
        var aboutSec = document.getElementById('about');
        if (aboutSec && aboutSec.parentElement) {
          profile.about = aboutSec.parentElement.innerText.replace(/^Sobre\s*/i, '').replace(/^About\s*/i, '').trim();
        }
      }

      // --- EXPERIENCIAS ---
      profile.experiences = [];
      var expSec = document.getElementById('experience') || document.querySelector('section[data-section="experience"]');
      if (expSec && expSec.parentElement) {
        var expItems = expSec.parentElement.querySelectorAll('li.artdeco-list__item, li.pvs-list__item--line-separated');
        for (var i = 0; i < expItems.length; i++) {
          var item = expItems[i];
          var title = _findFirstText(['.t-bold span', 'span[aria-hidden="true"]'], item);
          var company = _findFirstText(['.t-14.t-normal span', '.t-normal span'], item);
          var duration = _findFirstText(['.pvs-entity__caption-wrapper', '.t-14.t-black--light span'], item);
          if (title || company) {
            profile.experiences.push({ title: title, company: company, duration: duration });
          }
        }
      }

      // --- EDUCACAO ---
      profile.education = [];
      var eduSec = document.getElementById('education') || document.querySelector('section[data-section="education"]');
      if (eduSec && eduSec.parentElement) {
        var eduItems = eduSec.parentElement.querySelectorAll('li.artdeco-list__item, li.pvs-list__item--line-separated');
        for (var j = 0; j < eduItems.length; j++) {
          var ed = eduItems[j];
          var school = _findFirstText(['.t-bold span', 'span[aria-hidden="true"]'], ed);
          var degree = _findFirstText(['.t-14.t-normal span', '.t-normal span'], ed);
          if (school) profile.education.push({ school: school, degree: degree });
        }
      }

      // --- SKILLS ---
      profile.skills = [];
      var skillsSec = document.getElementById('skills') || document.querySelector('section[data-section="skills"]');
      if (skillsSec && skillsSec.parentElement) {
        var skillEls = skillsSec.parentElement.querySelectorAll('.t-bold span, .pvs-entity__primary-title span');
        for (var k = 0; k < Math.min(skillEls.length, 25); k++) {
          var sk = (skillEls[k].innerText || '').trim();
          if (sk && sk.length > 1 && profile.skills.indexOf(sk) === -1) {
            profile.skills.push(sk);
          }
        }
      }

      // --- CERTIFICACOES ---
      profile.certifications = [];
      var certSec = document.getElementById('licenses_and_certifications') || document.getElementById('certifications');
      if (certSec && certSec.parentElement) {
        var certEls = certSec.parentElement.querySelectorAll('.t-bold span');
        for (var c = 0; c < Math.min(certEls.length, 30); c++) {
          var ct = (certEls[c].innerText || '').trim();
          if (ct && ct.length > 1 && profile.certifications.indexOf(ct) === -1) {
            profile.certifications.push(ct);
          }
        }
      }

      // --- RECOMENDACOES ---
      var recSec = document.getElementById('recommendations');
      profile.recommendationsCount = recSec && recSec.parentElement
        ? recSec.parentElement.querySelectorAll('li.artdeco-list__item').length
        : 0;

      // --- IDIOMAS ---
      profile.languages = [];
      var langSec = document.getElementById('languages');
      if (langSec && langSec.parentElement) {
        var langEls = langSec.parentElement.querySelectorAll('.t-bold span');
        for (var l = 0; l < langEls.length; l++) {
          var lg = (langEls[l].innerText || '').trim();
          if (lg && profile.languages.indexOf(lg) === -1) profile.languages.push(lg);
        }
      }

      // --- SE E PERFIL PROPRIO ---
      profile.isOwnProfile = _hasEl('[data-view-name="profile-edit-button"]')
        || _hasEl('[aria-label*="Editar"]')
        || _hasEl('a[href*="/in/edit/"]')
        || window.location.pathname.indexOf('/in/me') > -1;

      // Se o nome nao foi encontrado mas estamos em linkedin.com, atribui um placeholder de perfil
      if (!profile.name && isProfileUrl) {
        profile.name = window.location.pathname.replace(/^\/in\//, '').replace(/\/.*$/, '') || 'Perfil LinkedIn';
      }

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
    {
      selector: '.profile-background-image, [class*="background-image"], .cover-img, .pv-top-card__cover',
      id: 'banner', label: '🖼️ Banner de Fundo (Capa)',
      tip: 'O banner ocupa o maior espaço visual do perfil. Transmite seu posicionamento profissional antes mesmo do texto.',
      action: 'Use uma capa customizada (1584x396px) com seu slogan, stack técnica e contato.',
    },
    {
      selector: 'img.pv-top-card-profile-picture__image--show, img.EntityPhoto-circle-5, button img.avatar, .pv-top-card__photo',
      id: 'photo', label: '📷 Foto de Perfil',
      tip: 'Perfis com foto profissional recebem até 21x mais visualizações e 9x mais pedidos de conexão.',
      action: 'Foto recente em alta resolução (400x400px+), rosto centralizado e fundo neutro.',
    },
    {
      selector: 'h1.text-heading-xlarge, h1.inline, .pv-text-details__left-panel h1',
      id: 'name', label: '📛 Nome Profissional',
      tip: 'Deve ser o nome pelo qual você quer ser encontrado no mercado de trabalho.',
      action: 'Evite símbolos ou emojis no nome para não prejudicar buscas e filtros de ATS.',
    },
    {
      selector: '.text-body-medium.break-words, .ph5 .mt2 .text-body-medium, .pv-text-details__left-panel .text-body-medium',
      id: 'headline', label: '✍️ Headline (Título Profissional)',
      tip: 'Aparece abaixo do seu nome em TODO o LinkedIn (comentários, mensagens, buscas de recrutadores).',
      action: 'Estrutura: [Cargo Alvo] | [Especialidade Técnica] | [Impacto/Resultados].',
    },
    {
      selector: '.text-body-small.inline.t-black--light.break-words, .pv-text-details__left-panel span.text-body-small',
      id: 'location', label: '📍 Localização',
      tip: 'Filtro essencial usado por recrutadores para busca por proximidade e vagas presenciais/remotas.',
      action: 'Preencha cidade/estado e informe sua disponibilidade para atuar remotamente.',
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
    {
      selector: '#about, section[data-section="about"]',
      id: 'about', label: '📝 Seção Sobre (Resumo Executivo)',
      tip: 'Sua carta de apresentação. Conta sua história, conquistas e proposta de valor profissional.',
      action: '1º parágrafo: foco e paixão. 2º: realizações e tecnologias. 3º: chamada para contato.',
    },
    {
      selector: '#experience, section[data-section="experience"]',
      id: 'experience', label: '💼 Experiências Profissionais',
      tip: 'O histórico detalhado de atuação. Recrutadores buscam resultados mensuráveis.',
      action: 'Use verbos de ação + métricas: "Desenvolvi X reduzindo tempo de resposta em Y%".',
    },
    {
      selector: '#education, section[data-section="education"]',
      id: 'education', label: '🎓 Formação Acadêmica',
      tip: 'Valida sua base teórica e compromisso com aprendizado formal e contínuo.',
      action: 'Adicione cursos superiores, bootcamps relevantes e atividades acadêmicas.',
    },
    {
      selector: '#skills, section[data-section="skills"]',
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

  // --- Auxiliares ---
  function _findFirstText(selectors, rootEl) {
    var root = rootEl || document;
    for (var i = 0; i < selectors.length; i++) {
      try {
        var el = root.querySelector(selectors[i]);
        if (el) {
          var t = (el.innerText || el.textContent || '').trim();
          if (t) return t;
        }
      } catch(e) {}
    }
    return '';
  }

  function _hasEl(sel) {
    try { return !!document.querySelector(sel); } catch(e) { return false; }
  }

  try { chrome.runtime.sendMessage({ type: 'CONTENT_READY', platform: 'linkedin' }); } catch(e) {}
})();
