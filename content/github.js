// content/github.js - Extrator + Modo Inspetor Completo para GitHub
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

  // ===================== MODO INSPETOR EXPANDIDO =====================
  var _hoverActive = false;
  var _tooltip = null;
  var _hoverTimeout = null;

  var HOVER_MAP = [
    // 1. ABAS SUPERIORES DE NAVEGAÇÃO
    {
      selector: 'a[data-tab-item="overview"], a[href$="?tab=overview"], nav.UnderlineNav a[href$="/"]',
      id: 'tab_overview', label: '🧭 Aba [Overview] (Visão Geral)',
      tip: 'A página inicial do seu GitHub. Reúne seu README especial, repositórios pinados e o gráfico de contribuições anual.',
      action: 'Mantenha o Overview sempre limpo e com repositórios pinados bem documentados.',
    },
    {
      selector: 'a[data-tab-item="repositories"], a[href*="tab=repositories"]',
      id: 'tab_repositories', label: '📦 Aba [Repositories] (Repositórios)',
      tip: 'Lista todos os seus repositórios públicos. Recrutadores usam a busca e filtros por linguagem aqui.',
      action: 'Adicione descrições e tópicos (tags) em cada repositório. Arquive ou oculte repositórios de teste vazios.',
    },
    {
      selector: 'a[data-tab-item="projects"], a[href*="tab=projects"]',
      id: 'tab_projects', label: '📋 Aba [Projects] (Projetos & Roadmaps)',
      tip: 'Permite criar quadros Kanban e Roadmaps de gerenciamento no estilo Jira/Trello diretamente no GitHub.',
      action: 'Demonstre habilidades de SCRUM/Gestão criando um quadro de projeto público mostrando etapas de desenvolvimento.',
    },
    {
      selector: 'a[data-tab-item="packages"], a[href*="tab=packages"]',
      id: 'tab_packages', label: '📦 Aba [Packages] (GitHub Registry)',
      tip: 'Exibe pacotes publicados por você (npm, Docker, NuGet, Maven, RubyGems). Demonstra capacidade de empacotar bibliotecas reutilizáveis.',
      action: 'Se você desenvolve libs ou imagens Docker, publique pacotes no GitHub Packages para turbinar sua autoridade técnica.',
    },
    {
      selector: 'a[data-tab-item="stars"], a[href*="tab=stars"]',
      id: 'tab_stars', label: '⭐ Aba [Stars] (Repositórios Favoritados)',
      tip: 'Funciona como sua curadoria pessoal de referências de código, frameworks e projetos open source que você acompanha.',
      action: 'Organize suas stars em listas temáticas (ex: "Machine Learning", "Frontend", "DevOps") para demonstrar repertório técnico.',
    },
    {
      selector: 'a[href*="tab=sponsoring"], a[href*="sponsors"]',
      id: 'tab_sponsors', label: '💖 [GitHub Sponsors] (Apoio Open Source)',
      tip: 'Mostra desenvolvedores que você apoia financeiramente ou patrocínios que você recebe pelos seus projetos.',
      action: 'Ative o botão "Sponsor" nos seus repositórios principais se eles forem úteis para a comunidade.',
    },

    // 2. FOTO, PERFIL E BIO
    {
      selector: '.avatar-user, [itemprop="image"]',
      id: 'photo', label: '🖼️ Foto de Perfil',
      tip: 'Uma foto personalizada aumenta credibilidade. Avatares gerados automaticamente (identicons) passam impressão de perfil abandonado.',
      action: 'Use uma foto real nítida ou logo profissional em Settings > Profile.',
    },
    {
      selector: '.p-name, [itemprop="name"]',
      id: 'name', label: '📛 Nome de Exibição',
      tip: 'O nome de exibição aparece em destaque no perfil e torna o perfil mais humano e fácil de encontrar em buscas.',
      action: 'Adicione seu nome profissional completo em Settings > Profile > Name.',
    },
    {
      selector: '.p-nickname, [itemprop="additionalName"]',
      id: 'username', label: '🔗 Username (@)',
      tip: 'Seu identificador permanente em todos os commits, PRs e repositórios.',
      action: 'Mantenha um username limpo e profissional, idealmente igual ao do LinkedIn e outras redes.',
    },
    {
      selector: '.p-note, [data-bio-text], .user-profile-bio',
      id: 'bio', label: '✍️ Bio (Apresentação Curta)',
      tip: 'Apresentação de 160 caracteres visível imediatamente abaixo da sua foto.',
      action: 'Diga seu foco principal, stack e diferencial. Ex: "Desenvolvedor Full Stack • Gestão de TI • SCRUM Master".',
    },
    {
      selector: '[itemprop="worksFor"], .p-org',
      id: 'company', label: '🏢 Empresa / Organização Atual',
      tip: 'Mostra onde você atua. Vincular com @organizacao cria link automático.',
      action: 'Adicione sua empresa ou projeto em Settings > Profile > Company.',
    },
    {
      selector: '[itemprop="homeLocation"], .p-label',
      id: 'location', label: '📍 Localização',
      tip: 'Ajuda recrutadores a identificar sua região e disponibilidade para vagas remotas ou presenciais.',
      action: 'Preencha cidade/país ou adicione "Remoto" em Settings > Profile > Location.',
    },
    {
      selector: '[itemprop="url"], .p-url, a[data-test-selector="profile-website-url"]',
      id: 'website', label: '🌐 Website / Portfólio / LinkedIn',
      tip: 'Link direto para seu portfólio pessoal, blog técnico ou perfil do LinkedIn.',
      action: 'Insira o link do seu LinkedIn ou site oficial em Settings > Profile > Website.',
    },
    {
      selector: '[itemprop="social"], a[rel="nofollow me"], .octicon-link',
      id: 'social_accounts', label: '📱 Redes Sociais Conectadas',
      tip: 'Links oficiais para Twitter/X, LinkedIn, YouTube ou outras redes do desenvolvedor.',
      action: 'Adicione suas redes em Settings > Profile > Social accounts.',
    },

    // 3. README ESPECIAL DO PERFIL
    {
      selector: '.js-profile-readme',
      id: 'readme', label: '📄 README do Perfil (Vitrine Principal)',
      tip: 'O README especial (repositório user/user) é a primeira coisa que recrutadores leem. É o seu cartão de visitas dinâmico.',
      action: 'Inclua apresentação, badges das tecnologias que domina, projetos em destaque, links de contato e métricas.',
    },
    {
      selector: '.js-profile-readme img, .js-profile-readme a',
      id: 'readme_elements', label: '🎨 Badges & Elementos Visuais do README',
      tip: 'Badges de shields.io e ícones deixam o README visualmente agradável, moderno e dinâmico.',
      action: 'Mantenha os links dos badges funcionais e com tema consistente (ex: tokyonight ou dark).',
    },

    // 4. REPOSITÓRIOS FIXADOS (PINNED)
    {
      selector: '.pinned-item-list-item, .js-pinned-items-reorder-container',
      id: 'pinned', label: '📌 Repositórios Pinados (Destaques)',
      tip: 'Seus 4 a 6 principais projetos. Visitantes julgam sua competência técnica por eles.',
      action: 'Fixe projetos com README completo, demo funcional, licença MIT e tecnologias atualizadas.',
    },

    // 5. ATIVIDADES E CONTRIBUIÇÕES
    {
      selector: '.js-yearly-contributions, [class*="ContributionCalendar"]',
      id: 'contributions', label: '🟩 Gráfico de Contribuições Anual',
      tip: 'Mostra consistência ao longo dos 365 dias do ano. Atividades regulares passam segurança técnica.',
      action: 'Mantenha commits consistentes. Habilite "Include private contributions" nas configurações do gráfico se trabalhar em repositórios privados.',
    },
    {
      selector: '.activity-listing, #js-contribution-activity, .contribution-activity-listing',
      id: 'activity_feed', label: '📊 Linha do Tempo de Atividades',
      tip: 'Histórico detalhado de commits criados, pull requests abertos, code reviews e issues resolvidas.',
      action: 'Participe de discussões e revisões em repositórios open source para enriquecer sua atividade pública.',
    },

    // 6. SEGUIDORES, CONQUISTAS E ORGANIZAÇÕES
    {
      selector: 'a[href$="followers"], a[href$="following"]',
      id: 'followers', label: '👥 Seguidores e Seguindo',
      tip: 'Mostra seu alcance e rede dentro do ecossistema GitHub.',
      action: 'Siga desenvolvedores influentes, compartilhe repositórios úteis e colabore em projetos.',
    },
    {
      selector: '.js-achievement-badge-grid, [class*="achievement"]',
      id: 'achievements', label: '🏅 Conquistas do GitHub',
      tip: 'Badges automáticos concedidos pelo GitHub (ex: Pull Shark, Quickdraw, Pair Extraordinaire).',
      action: 'Contribua em repositórios e abra pull requests mesclados para desbloquear mais conquistas.',
    },
    {
      selector: '[itemprop="memberOf"], .avatar-group-item, a[data-hovercard-type="organization"]',
      id: 'organizations', label: '🏢 Organizações & Times',
      tip: 'Indica empresas, comunidades ou grupos open source dos quais você faz parte oficialmente.',
      action: 'Participe de organizações ou crie sua própria org para gerenciar projetos em equipe.',
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
        type: 'HOVER_ELEMENT', platform: 'github',
        element: { id: match.id, label: match.label, tip: match.tip, action: match.action }
      });
    } catch(e) {}
  }

  function _createTooltip() {
    if (document.getElementById('__pt_tooltip')) return;
    var style = document.createElement('style');
    style.id = '__pt_style';
    style.textContent = '#__pt_tooltip{position:fixed;z-index:2147483647;max-width:320px;background:#161b22;border:1.5px solid #6e40c9;border-radius:10px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,0.6);pointer-events:none;transition:opacity 0.15s ease, transform 0.15s ease;opacity:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:12px;line-height:1.5;color:#e6edf3;}'
      + '#__pt_tooltip .pt-tt-header{font-weight:700;font-size:13px;color:#a371f7;margin-bottom:6px;border-bottom:1px solid #30363d;padding-bottom:4px;}'
      + '#__pt_tooltip .pt-tt-tip{color:#c9d1d9;margin-bottom:8px;}'
      + '#__pt_tooltip .pt-tt-action{background:rgba(110,64,201,0.15);border-left:3px solid #a371f7;padding:6px 8px;border-radius:0 6px 6px 0;color:#f0f6fc;font-size:11.5px;}'
      + '#__pt_banner{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483646;background:#6e40c9;color:white;padding:8px 18px;border-radius:24px;font-family:-apple-system,sans-serif;font-size:12.5px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,0.4);pointer-events:none;border:1px solid rgba(255,255,255,0.2);}';
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

  function _getText(sel, fb) { try { var el = document.querySelector(sel); return el ? (el.innerText||el.textContent||'').trim() : (fb||''); } catch(e) { return fb||''; } }
  function _qText(el, sel) { try { var f = el.querySelector(sel); return f ? (f.innerText||f.textContent||'').trim() : ''; } catch(e) { return ''; } }
  function _getAttr(sel, attr, fb) { try { var el = document.querySelector(sel); return el ? (el.getAttribute(attr)||fb||'') : (fb||''); } catch(e) { return fb||''; } }
  function _parseInt(str) { var n = parseInt((str||'').replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; }

  try { chrome.runtime.sendMessage({ type: 'CONTENT_READY', platform: 'github' }); } catch(e) {}
})();
