const teamIds = ['team1', 'team2', 'team3', 'team4'];
const defaults = ['Team A', 'Team B', 'Team C', 'Team D'];
const medals = ['🥇', '🥈', '🥉'];

function esc(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function getTeamName(id) {
  return document.getElementById(id).value.trim() || '???';
}

function getPairings() {
  const teams = teamIds.map(id => ({ id, name: getTeamName(id) }));
  const pairings = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairings.push({ home: teams[i], away: teams[j] });
    }
  }
  return pairings;
}

function renderMatches() {
  const container = document.getElementById('matches');
  const pairings = getPairings();
  container.innerHTML = pairings.map((m, idx) => {
    const homeId = `score_h_${idx}`;
    const awayId = `score_a_${idx}`;
    const storedHome = localStorage.getItem(homeId) || '';
    const storedAway = localStorage.getItem(awayId) || '';
    return `
      <div class="match">
        <span class="team-label">${esc(m.home.name)}</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" id="${homeId}" value="${storedHome}" placeholder="-">
        <span class="vs">:</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" id="${awayId}" value="${storedAway}" placeholder="-">
        <span class="team-label">${esc(m.away.name)}</span>
      </div>
    `;
  }).join('');
}

function saveScore(idx) {
  const homeEl = document.getElementById(`score_h_${idx}`);
  const awayEl = document.getElementById(`score_a_${idx}`);
  if (homeEl) localStorage.setItem(`score_h_${idx}`, homeEl.value);
  if (awayEl) localStorage.setItem(`score_a_${idx}`, awayEl.value);
}

function validateScore(val) {
  return /^\d+$/.test(val);
}

function klass(i) {
  if (i === 0) return 'gold';
  if (i === 1) return 'silver';
  if (i === 2) return 'bronze';
  return '';
}

function rang(i) {
  if (i < 3) return medals[i];
  return i + 1;
}

function berechnen() {
  const pairings = getPairings();
  const stats = {};
  teamIds.forEach(id => {
    stats[id] = { name: getTeamName(id), sp: 0, s: 0, u: 0, n: 0, gf: 0, ga: 0, pts: 0 };
  });

  let hasError = false;
  pairings.forEach((m, idx) => {
    const hVal = document.getElementById(`score_h_${idx}`).value;
    const aVal = document.getElementById(`score_a_${idx}`).value;

    if (hVal === '' && aVal === '') return;

    if (!validateScore(hVal) || !validateScore(aVal)) {
      hasError = true;
      document.getElementById(`score_h_${idx}`).classList.add('match-error');
      document.getElementById(`score_a_${idx}`).classList.add('match-error');
      return;
    }
    document.getElementById(`score_h_${idx}`).classList.remove('match-error');
    document.getElementById(`score_a_${idx}`).classList.remove('match-error');

    const homeScore = parseInt(hVal, 10);
    const awayScore = parseInt(aVal, 10);

    const h = m.home.id;
    const a = m.away.id;
    stats[h].sp++;
    stats[a].sp++;
    stats[h].gf += homeScore;
    stats[h].ga += awayScore;
    stats[a].gf += awayScore;
    stats[a].ga += homeScore;

    if (homeScore > awayScore) {
      stats[h].s++; stats[h].pts += 3;
      stats[a].n++;
    } else if (homeScore < awayScore) {
      stats[a].s++; stats[a].pts += 3;
      stats[h].n++;
    } else {
      stats[h].u++; stats[h].pts += 1;
      stats[a].u++; stats[a].pts += 1;
    }
  });

  if (hasError) {
    alert('Bitte nur ganze Zahlen (0, 1, 2, ...) eingeben.');
    return;
  }

  const sorted = teamIds.slice().sort((a, b) => {
    if (stats[b].pts !== stats[a].pts) return stats[b].pts - stats[a].pts;
    const gdA = stats[a].gf - stats[a].ga;
    const gdB = stats[b].gf - stats[b].ga;
    if (gdB !== gdA) return gdB - gdA;
    return stats[b].gf - stats[a].gf;
  });

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = sorted.map((id, i) => {
    const s = stats[id];
    const gd = s.gf - s.ga;
    return `
      <tr class="${klass(i)}">
        <td class="rank">${rang(i)}</td>
        <td class="team-name-cell">${esc(s.name)}</td>
        <td>${s.sp}</td>
        <td>${s.gf}</td>
        <td>${s.ga}</td>
        <td>${gd > 0 ? '+' : ''}${gd}</td>
        <td><strong>${s.pts}</strong></td>
      </tr>
    `;
  }).join('');

  document.getElementById('tableCard').classList.remove('hidden');
}

function zuruecksetzen() {
  teamIds.forEach((id, i) => {
    document.getElementById(id).value = defaults[i];
  });
  const pairings = getPairings();
  pairings.forEach((_, idx) => {
    const homeEl = document.getElementById(`score_h_${idx}`);
    const awayEl = document.getElementById(`score_a_${idx}`);
    if (homeEl) { homeEl.value = ''; localStorage.removeItem(`score_h_${idx}`); }
    if (awayEl) { awayEl.value = ''; localStorage.removeItem(`score_a_${idx}`); }
  });
  document.getElementById('tableCard').classList.add('hidden');
  renderMatches();
}

document.addEventListener('DOMContentLoaded', () => {
  teamIds.forEach(id => {
    document.getElementById(id).addEventListener('input', renderMatches);
  });

  document.getElementById('matches').addEventListener('input', (e) => {
    const input = e.target;
    if (input.id && input.id.startsWith('score_')) {
      input.classList.remove('match-error');
      const matchIdx = input.id.split('_')[2];
      saveScore(matchIdx);
    }
  });

  document.getElementById('btnCalc').addEventListener('click', berechnen);
  document.getElementById('btnReset').addEventListener('click', zuruecksetzen);

  renderMatches();
});
