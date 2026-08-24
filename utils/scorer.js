// utils/scorer.js - Calculo de pontuacao local (sem IA)

export function scoreLinkedIn(profile) {
  var s = {};
  s.photo = (profile.hasPhoto && !profile.isDefaultPhoto) ? 10 : (profile.hasPhoto ? 5 : 0);
  var hl = (profile.headline || '').length;
  s.headline = hl > 80 ? 15 : hl > 40 ? 10 : hl > 0 ? 5 : 0;
  var ab = (profile.about || '').length;
  s.about = ab > 300 ? 15 : ab > 150 ? 10 : ab > 0 ? 5 : 0;
  var exp = (profile.experiences || []).length;
  s.experience = exp >= 3 ? 20 : exp === 2 ? 14 : exp === 1 ? 8 : 0;
  s.education = (profile.education || []).length >= 1 ? 10 : 0;
  var sk = (profile.skills || []).length;
  s.skills = sk >= 10 ? 10 : sk >= 5 ? 7 : sk > 0 ? 4 : 0;
  s.certifications = (profile.certifications || []).length > 0 ? 5 : 0;
  var rec = profile.recommendationsCount || 0;
  s.recommendations = rec >= 3 ? 10 : rec >= 1 ? 5 : 0;
  s.languages = (profile.languages || []).length > 0 ? 5 : 0;
  var total = Object.values(s).reduce(function(a, b) { return a + b; }, 0);
  return { total: Math.min(total, 100), scores: s, level: getLevel(total), platform: 'linkedin' };
}

export function scoreGitHub(profile) {
  var s = {};
  s.photo = (profile.hasPhoto && !profile.isDefaultAvatar) ? 10 : (profile.hasPhoto ? 5 : 0);
  s.readme = profile.hasProfileReadme ? 20 : 0;
  var bio = (profile.bio || '').length;
  s.bio = bio > 50 ? 10 : bio > 0 ? 5 : 0;
  var repos = profile.publicRepos || 0;
  s.repos = repos >= 20 ? 15 : repos >= 10 ? 10 : repos >= 3 ? 5 : 0;
  var pinned = (profile.pinnedRepos || []).length;
  s.pinned = pinned >= 4 ? 10 : pinned >= 2 ? 6 : pinned >= 1 ? 3 : 0;
  var contrib = profile.contributionsLastYear || 0;
  s.contributions = contrib >= 365 ? 15 : contrib >= 100 ? 10 : contrib >= 30 ? 5 : 0;
  var fol = profile.followers || 0;
  s.followers = fol >= 100 ? 10 : fol >= 20 ? 6 : fol >= 1 ? 3 : 0;
  s.links = (profile.website || profile.email) ? 5 : 0;
  var totalStars = (profile.pinnedRepos || []).reduce(function(sum, r) { return sum + (r.stars || 0); }, 0);
  s.stars = totalStars >= 100 ? 5 : totalStars >= 10 ? 3 : totalStars > 0 ? 1 : 0;
  var total = Object.values(s).reduce(function(a, b) { return a + b; }, 0);
  return { total: Math.min(total, 100), scores: s, level: getLevel(total), platform: 'github' };
}

function getLevel(score) {
  if (score >= 85) return { label: 'Expert', emoji: '🏆', color: '#FFD700' };
  if (score >= 65) return { label: 'Avancado', emoji: '🚀', color: '#4CAF50' };
  if (score >= 40) return { label: 'Intermediario', emoji: '📈', color: '#2196F3' };
  return { label: 'Iniciante', emoji: '🌱', color: '#FF9800' };
}
