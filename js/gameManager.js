const KEYS = {
  SCORES: 'mu10_scores',
  HISTORY: 'mu10_history',
  TEAMS: 'mu10_teams',
  TEAM_COUNT: 'mu10_teamCount'
};

const DEFAULT_TEAMS = ['Team A', 'Team B', 'Team C', 'Team D'];
const MIN_TEAMS = 3;
const MAX_TEAMS = 8;

function safe(method, key, value) {
  try {
    if (method === 'get') return localStorage.getItem(key);
    if (method === 'set') { localStorage.setItem(key, value); return true; }
    if (method === 'remove') { localStorage.removeItem(key); return true; }
  } catch {
    return method === 'get' ? null : false;
  }
}

export function getMinTeams() { return MIN_TEAMS; }
export function getMaxTeams() { return MAX_TEAMS; }

export function getTeamCount() {
  const v = safe('get', KEYS.TEAM_COUNT);
  return v ? Math.max(MIN_TEAMS, Math.min(MAX_TEAMS, parseInt(v, 10))) : 4;
}

export function setTeamCount(count) {
  const c = Math.max(MIN_TEAMS, Math.min(MAX_TEAMS, count));
  safe('set', KEYS.TEAM_COUNT, String(c));
  return c;
}

export function getTeamNames() {
  const v = safe('get', KEYS.TEAMS);
  if (v) {
    try { return JSON.parse(v); } catch {}
  }
  return [...DEFAULT_TEAMS];
}

export function setTeamNames(names) {
  safe('set', KEYS.TEAMS, JSON.stringify(names));
}

export function getPairings(teamNames) {
  const pairings = [];
  const n = teamNames.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairings.push({ home: { id: i, name: teamNames[i] }, away: { id: j, name: teamNames[j] } });
    }
  }
  return pairings;
}

export function getScores() {
  const v = safe('get', KEYS.SCORES);
  if (v) {
    try { return JSON.parse(v); } catch {}
  }
  return {};
}

export function saveScore(matchIdx, type, value) {
  const scores = getScores();
  const key = `${matchIdx}_${type}`;
  if (value === '' || value === null || value === undefined) {
    delete scores[key];
  } else {
    scores[key] = value;
  }
  safe('set', KEYS.SCORES, JSON.stringify(scores));
}

export function clearScores() {
  safe('remove', KEYS.SCORES);
}

export function getMatchHistory() {
  const v = safe('get', KEYS.HISTORY);
  if (v) {
    try { return JSON.parse(v); } catch {}
  }
  return [];
}

export function addMatchToHistory(match) {
  const history = getMatchHistory();
  history.push({ ...match, timestamp: Date.now() });
  safe('set', KEYS.HISTORY, JSON.stringify(history));
}

export function clearMatchHistory() {
  safe('remove', KEYS.HISTORY);
}
