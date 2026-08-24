// utils/prompts.js - Prompts especializados por modo e plataforma

export function buildAnalysisPrompt(platform, profileData) {
  var data = JSON.stringify(profileData, null, 2);
  if (platform === 'linkedin') {
    return 'Voce e um especialista em carreira e recrutamento. Analise este perfil do LinkedIn e forneca:\n\n' +
      '1. **PONTUACAO** (0-100): Uma pontuacao geral\n' +
      '2. **NIVEL**: Iniciante / Intermediario / Avancado / Expert\n' +
      '3. **PONTOS FORTES**: O que esta bom (lista com emojis)\n' +
      '4. **PONTOS CRITICOS**: O que FALTA ou precisa de melhoria urgente (lista com emojis)\n' +
      '5. **TOP 3 ACOES**: As 3 acoes de maior impacto (numeradas)\n' +
      '6. **ANALISE POR SECAO**:\n' +
      '   - Foto: avalie\n   - Headline: avalie\n   - Sobre: avalie\n   - Experiencias: avalie\n   - Skills: avalie\n   - Certificacoes: avalie\n   - Recomendacoes: avalie\n\n' +
      'Use emojis, seja amigavel e encorajador. Responda em Portugues do Brasil.\n\nDADOS DO PERFIL:\n' + data;
  }
  if (platform === 'github') {
    return 'Voce e um especialista em portfolios GitHub e desenvolvimento de software. Analise este perfil e forneca:\n\n' +
      '1. **PONTUACAO** (0-100): Uma pontuacao geral\n' +
      '2. **NIVEL**: Iniciante / Intermediario / Avancado / Expert\n' +
      '3. **PONTOS FORTES**: O que impressiona (lista com emojis)\n' +
      '4. **PONTOS CRITICOS**: O que FALTA (lista com emojis)\n' +
      '5. **TOP 3 ACOES**: As 3 acoes de maior impacto (numeradas)\n' +
      '6. **ANALISE POR SECAO**:\n' +
      '   - README do perfil: avalie\n   - Repos pinados: avalie\n   - Contribuicoes: avalie\n   - Seguidores: avalie\n   - Bio e info: avalie\n\n' +
      'Use emojis, seja tecnico e direto. Responda em Portugues do Brasil.\n\nDADOS DO PERFIL:\n' + data;
  }
  return 'Analise este perfil: ' + data;
}

export function buildTutorPrompt(platform, item, context) {
  var plat = platform === 'linkedin' ? 'LinkedIn' : 'GitHub';
  return 'Voce e o ProfileTutor, um tutor amigavel e didatico especializado em perfis profissionais.\n\n' +
    'O usuario esta em um perfil do ' + plat + ' e quer entender sobre: "' + item + '"\n\n' +
    'Contexto: ' + context + '\n\n' +
    'Explique de forma clara:\n' +
    '1. **O que e**: Definicao simples\n' +
    '2. **Por que importa**: Relevancia para recrutadores/avaliadores\n' +
    '3. **Como funciona**: Mecanica ou funcionamento\n' +
    '4. **Benchmarks**: O que e considerado bom / medio / ruim\n' +
    '5. **Dica de ouro**: Um conselho pratico especifico\n\n' +
    'Use emojis, seja didatico e encorajador. Responda em Portugues do Brasil.';
}

export function buildInvestigatorPrompt(platform, profileData) {
  var data = JSON.stringify(profileData, null, 2);
  if (platform === 'linkedin') {
    return 'Voce e um headhunter experiente. Analise este perfil do LinkedIn de outra pessoa e forneca:\n\n' +
      '1. **RESUMO EXECUTIVO**: Quem e essa pessoa em 3 linhas\n' +
      '2. **PERFIL PROFISSIONAL**: Senioridade, area, especialidades\n' +
      '3. **PONTOS FORTES**: Principais diferenciais\n' +
      '4. **TRAJETORIA**: Analise da evolucao de carreira\n' +
      '5. **PALAVRAS-CHAVE**: Skills e tecnologias em destaque\n' +
      '6. **PERGUNTAS INTELIGENTES**: 3 perguntas para uma entrevista/conversa\n' +
      '7. **FIT CULTURAL**: Que tipo de empresa combina com esse perfil\n\n' +
      'Seja perspicaz e profissional. Responda em Portugues do Brasil.\n\nDADOS:\n' + data;
  }
  if (platform === 'github') {
    return 'Voce e um tech recruiter especializado em portfolios. Analise este perfil do GitHub e forneca:\n\n' +
      '1. **RESUMO DO DESENVOLVEDOR**: Quem e esse dev em 3 linhas\n' +
      '2. **STACK TECNICO**: Linguagens e tecnologias identificadas\n' +
      '3. **NIVEL DE ATIVIDADE**: Avalie engajamento e consistencia\n' +
      '4. **PROJETOS DE DESTAQUE**: Analise dos repos pinados\n' +
      '5. **PONTOS FORTES TECNICOS**: O que impressiona\n' +
      '6. **PERGUNTAS TECNICAS**: 3 perguntas tecnicas para esse dev\n' +
      '7. **OPORTUNIDADES**: Que tipos de vaga seriam ideais\n\n' +
      'Seja tecnico e preciso. Responda em Portugues do Brasil.\n\nDADOS:\n' + data;
  }
  return 'Investigue este perfil: ' + data;
}

export function buildChatPrompt(platform, userMessage, profileData, history) {
  var data = profileData ? JSON.stringify(profileData, null, 2) : 'Nenhum dado disponivel';
  var plat = platform === 'linkedin' ? 'LinkedIn' : 'GitHub';
  var historyText = '';
  if (history && history.length > 0) {
    historyText = '\n\nHISTORICO:\n';
    for (var i = 0; i < history.length; i++) {
      historyText += (history[i].role === 'user' ? 'Usuario' : 'Tutor') + ': ' + history[i].content + '\n';
    }
  }
  return 'Voce e o ProfileTutor, assistente especializado em perfis do ' + plat + '. ' +
    'Seja amigavel, didatico, use emojis e responda em Portugues do Brasil.' +
    historyText + '\n\nCONTEXTO DO PERFIL:\n' + data +
    '\n\nPERGUNTA DO USUARIO: ' + userMessage +
    '\n\nResponda de forma util e personalizada com base no perfil acima.';
}
