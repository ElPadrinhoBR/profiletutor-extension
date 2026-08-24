// content/github.js - Extrator + Modo Hover para GitHub
(function () {
  'use strict';

  // ===================== EXTRACAO DO PERFIL =====================
  window.__profileTutorExtract = function () {
    var profile = {};
    try {
      var isProfile = !!document.querySelector('.p-name') || !!document.querySelector('[itemtype="http://schema.org/Person"]');
      if (!isProfile) { profile.notAProfile = true; profile.currentPage = window.location.href; return profile; }

      profile.name = _getText('.p-name') || _getText('[itemprop="name"]');
      profile.username = _getText('.p-nickname') || window.location.pathname.replace('/', '');
      profile.bio = _getText('.p-note') || _getText('[data-bio-text]');
      profile.company = _getText('[itemprop="worksFor"]') || _getText('.p-org');
      profile.location = _getText('[itemprop="homeLocation"]') || _getText('.p-label');
      profile.website = _getAttr('[itemprop="url"]', 'href') || _getText('.p-url');
      profile.email = _getText('[itemprop="email"]');

      var photoEl = document.querySelector('.avatar-user') || document.querySelector('[itemprop="image"]');
      profile.hasPhoto = !!photoEl;
      profile.photoUrl = photoEl ? photoEl.src : null;
      profile.isDefaultAvatar = profile.photoUrl ? profile.photoUrl.indexOf('identicons') > -1 : false;

      profile.hasProfileReadme = !!document.querySelector('.js-profile-readme');

      var reposLink = document.querySelector('a[href$="?tab=repositories"]');
      profile.publicRepos = reposLink ? _parseInt(reposLink.querySelector('.Counter') ? reposLink.querySelector('.Counter').textContent : '0') : 0;

      var followersEl = document.querySelector('a[href$="followers"] .text-bold');
      var followingEl = document.querySelector('a[href$="following"] .text-bold');
      profile.followers = followersEl ? _parseInt(followersEl.textContent) : 0;
      profile.following = followingEl ? _parseInt(followingEl.textContent) : 0;

      var starsEl = document.querySelector('a[href*="stars"] .text-bold');
      profile.stars = starsEl ? _parseInt(starsEl.textContent) : 0;

      var contribText = _getText('.js-yearly-contributions h2') || _getText('[class*="contributions"] h2') || '';
      profile.contributionsText = contribText;
      var match = contribText.match(/(\d[\d,]*)/);
      profile.contributionsLastYear = match ? _parseInt(match[1]) : 0;

      var pinnedEls = document.querySelectorAll('.pinned-item-list-item');
      profile.pinnedRepos = [];
      for (var i = 0; i < pinnedEls.length; i++) {
        var item = pinnedEls[i];
        profile.pinnedRepos.push({
          name: _qText(item, '.repo') || _qText(item, 'a'),
          desc: _qText(item, 'p.pinned-item-desc'),
          lang: _qText(item, '[itemprop="programmingLanguage"]'),
          stars: _parseInt(_qText(item, 'a[href*="stargazers"] span')),
          forks: _parseInt(_qText(item, 'a[href*="forks"] span')),
        });
      }
      var langs = [];
      for (var j = 0; j < profile.pinnedRepos.length; j++) {
        if (profile.pinnedRepos[j].lang && langs.indexOf(profile.pinnedRepos[j].lang) === -1) langs.push(profile.pinnedRepos[j].lang);
      }
      profile.languages = langs;
      profile.achievementsCount = document.querySelectorAll('.js-achievement-badge-grid img').length;
      profile.organizationsCount = document.querySelectorAll('[itemprop="memberOf"] a').length;
      profile.isOwnProfile = !!document.querySelector('[href="/settings/profile"]') || !!document.querySelector('[data-target="profile-edit-button.showButton"]');
      profile.profileUrl = window.location.href;
      profile.platform = 'github';
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

  var HOVER_MAP = [
    {
      selector: '.avatar-user, [itemprop="image"]',
      id: 'photo', label: '🖼️ Foto de Perfil',
      tip: 'Uma foto personalizada aumenta credibilidade e identificacao. Avatares gerados automaticamente (identicons) passam impressao de perfil abandonado.',
      action: 'Use uma foto real ou logo profissional. Va em Settings > Profile > Upload profile picture.',
    },
    {
      selector: '.p-name, [itemprop="name"]',
      id: 'name', label: '📛 Nome de Exibicao',
      tip: 'O nome de exibicao aparece em destaque no perfil e torna o perfil mais humano e memoravel para recrutadores.',
      action: 'Adicione seu nome completo. Va em Settings > Profile > Name.',
    },
    {
      selector: '.p-nickname, [itemprop="additionalName"]',
      id: 'username', label: '🔗 Username (@)',
      tip: 'Seu username e seu endereco permanente no GitHub. Ele aparece em todos os repositorios, commits e contribuicoes.',
      action: 'Escolha um username profissional e consistente com outras redes. Pode ser alterado em Settings > Account.',
    },
    {
      selector: '.p-note, [data-bio-text]',
      id: 'bio', label: '✍️ Bio',
      tip: 'A bio e o primeiro texto que qualquer visitante le. Voce tem apenas 160 caracteres.',
      action: 'Formato ideal: cargo + linguagens/stack + diferencial. Ex: "Dev Full Stack | React · Node · Python | Open source contributor".',
    },
    {
      selector: '[itemprop="worksFor"], .p-org',
      id: 'company', label: '🏢 Empresa',
      tip: 'Informar empresa ou organizacao demonstra contexto profissional e vinculo com times reconhecidos.',
      action: 'Atualize em Settings > Profile > Company. Use @NomeDaOrg para vincular automaticamente.',
    },
    {
      selector: '[itemprop="homeLocation"], .p-label',
      id: 'location', label: '📍 Localizacao',
      tip: 'Localizacao ajuda recrutadores a filtrar candidatos por regiao e fuso horario.',
      action: 'Adicione sua cidade ou "Remote" se trabalha remotamente. Settings > Profile > Location.',
    },
    {
      selector: '[itemprop="url"], .p-url',
      id: 'website', label: '🌐 Website / Portfolio',
      tip: 'Um link para portfolio, blog ou LinkedIn aumenta muito a credibilidade do perfil.',
      action: 'Adicione link do seu portfolio, LinkedIn ou blog tecnico em Settings > Profile > Website.',
    },
    {
      selector: '.js-profile-readme',
      id: 'readme', label: '📄 README do Perfil',
      tip: 'O README especial (repositorio com mesmo nome do username) e sua pagina personalizada. E o diferencial mais visivel de um perfil profissional.',
      action: 'Se nao tem ainda: crie um repo com o mesmo nome do seu username e adicione um README.md com sua apresentacao, skills e projetos.',
    },
    {
      selector: '.pinned-item-list-item, .js-pinned-items-reorder-container',
      id: 'pinned', label: '📌 Repositorios Pinados',
      tip: 'Repos pinados sao os primeiros que qualquer visitante ve. Eles representam seu portfolio.',
      action: 'Pine 4-6 repositorios com: README completo, descricao clara, linguagem preenchida e se possivel um link de demo. Acesse Customize your pins no seu perfil.',
    },
    {
      selector: '.js-yearly-contributions, [class*="ContributionCalendar"]',
      id: 'contributions', label: '🟩 Grafico de Contribuicoes',
      tip: 'O grafico de atividade mostra sua consistencia ao longo do tempo. Recrutadores buscam contribuicoes regulares.',
      action: 'Faca commits pequenos e regulares. Contribua em projetos open source. Lembre: contribuicoes em repos privados nao aparecem (a menos que ative a opcao).',
    },
    {
      selector: 'a[href$="followers"], a[href$="following"]',
      id: 'followers', label: '👥 Seguidores / Seguindo',
      tip: 'Seguidores indicam relevancia e alcance. Muitos seguindo poucos pode indicar perfil passivo.',
      action: 'Siga devs relevantes da sua area, interaja em issues e compartilhe projetos uteis para ganhar seguidores organicamente.',
    },
    {
      selector: 'a[href$="?tab=repositories"]',
      id: 'repos', label: '📦 Repositorios Publicos',
      tip: 'A quantidade de repositorios mostra experiencia pratica. Qualidade importa mais que quantidade.',
      action: 'Mantenha repos relevantes com README, .gitignore e licenca. Archive ou delete repos vazios/desatualizados.',
    },
    {
      selector: '.js-achievement-badge-grid',
      id: 'achievements', label: '🏅 Conquistas',
      tip: 'Conquistas do GitHub reconhecem atividades como pull requests mesclados, contribuicoes em Arctic Code Vault etc.',
      action: 'Contribua em projetos open source relevantes. Algumas conquistas sao automaticas por participacao ativa na comunidade.',
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
      _hoverTimeout = setTimeout(function() { _showTooltip(match, e); _notifyPanel(match); }, 200);
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
      '<div class="pt-tt-action"><strong>✅ Acao:</strong> ' + match.action + '</div>';
    var x = e.clientX + 12, y = e.clientY + 12;
    if (x + 310 > window.innerWidth) x = e.clientX - 320;
    if (y + 160 > window.innerHeight) y = e.clientY - 170;
    _tooltip.style.left = x + 'px';
    _tooltip.style.top = y + 'px';
    _tooltip.style.opacity = '1';
  }

  function _notifyPanel(match) {
    try {
      chrome.runtime.sendMessage({
        type: 'HOVER_ELEMENT', platform: 'github',
        element: { id: match.id, label: match.label, tip: match.tip, action: match.action }
      });
    } catch(e) {}
  }

  function _createTooltip() {
    if (document.getElementById('__pt_tooltip')) return;
    var style = document.createElement('style');
    style.id = '__pt_style';
    style.textContent = '#__pt_tooltip{position:fixed;z-index:2147483647;max-width:310px;background:#1a1f27;border:1px solid #6e40c9;border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,0.5);pointer-events:none;transition:opacity 0.15s;opacity:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:12px;line-height:1.5;color:#e6edf3;}'
      + '#__pt_tooltip .pt-tt-header{font-weight:700;font-size:13px;color:#a371f7;margin-bottom:6px;}'
      + '#__pt_tooltip .pt-tt-tip{color:#c9d1d9;margin-bottom:8px;}'
      + '#__pt_tooltip .pt-tt-action{background:rgba(110,64,201,0.15);border-left:3px solid #6e40c9;padding:6px 8px;border-radius:0 6px 6px 0;color:#e6edf3;font-size:11px;}'
      + '#__pt_banner{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:2147483646;background:#6e40c9;color:white;padding:8px 16px;border-radius:20px;font-family:-apple-system,sans-serif;font-size:12px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;}';
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

  function _getText(sel, fb) { try { var el = document.querySelector(sel); return el ? (el.innerText||el.textContent||'').trim() : (fb||''); } catch(e) { return fb||''; } }
  function _qText(el, sel) { try { var f = el.querySelector(sel); return f ? (f.innerText||f.textContent||'').trim() : ''; } catch(e) { return ''; } }
  function _getAttr(sel, attr, fb) { try { var el = document.querySelector(sel); return el ? (el.getAttribute(attr)||fb||'') : (fb||''); } catch(e) { return fb||''; } }
  function _parseInt(str) { var n = parseInt((str||'').replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; }

  try { chrome.runtime.sendMessage({ type: 'CONTENT_READY', platform: 'github' }); } catch(e) {}
})();
