import {
  getTeamCount, setTeamCount, getTeamNames, setTeamNames,
  getPairings, getScores, saveScore, clearScores,
  getMatchHistory, addMatchToHistory, clearMatchHistory,
  getMinTeams, getMaxTeams
} from './gameManager.js';
import { calculateStandings } from './standingsCalculator.js';
import {
  renderTeamInputs, renderMatches, renderStandingsTable, renderMatchHistory
} from './uiRenderer.js';

let teamNames = [];
let savedScores = {};
let savedHistory = [];
let errorEl = null;

function init() {
  const count = getTeamCount();
  const stored = getTeamNames();
  const desired = Math.min(stored.length, count);
  teamNames = stored.slice(0, count);
  while (teamNames.length < count) {
    teamNames.push(`Team ${String.fromCharCode(65 + teamNames.length)}`);
  }
  savedScores = getScores();
  savedHistory = getMatchHistory();

  const teamInputs = document.getElementById('teamInputs');
  const matchesContainer = document.getElementById('matches');
  const tbody = document.getElementById('tableBody');
  const historyContainer = document.getElementById('historyList');
  const teamCountVal = document.getElementById('teamCountVal');
  const errorContainer = document.getElementById('errorContainer');
  errorEl = errorContainer;

  if (teamCountVal) teamCountVal.textContent = count;
  renderTeamInputs(teamInputs, teamNames);
  recalc(matchesContainer, tbody, historyContainer);

  document.getElementById('btnCalc').addEventListener('click', () => {
    copyTable(tbody);
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    clearScores();
    savedScores = {};
    recalc(matchesContainer, tbody, historyContainer);
  });

  document.getElementById('btnResetHistory').addEventListener('click', () => {
    if (confirm('Gesamte History löschen?')) {
      clearMatchHistory();
      savedHistory = [];
      renderMatchHistory(historyContainer, savedHistory);
    }
  });

  document.getElementById('btnTeamDec').addEventListener('click', () => {
    changeTeamCount(-1, teamInputs, matchesContainer, tbody, historyContainer, teamCountVal);
  });

  document.getElementById('btnTeamInc').addEventListener('click', () => {
    changeTeamCount(1, teamInputs, matchesContainer, tbody, historyContainer, teamCountVal);
  });

  teamInputs.addEventListener('input', () => {
    updateTeamNames();
    saveTeamNames();
    recalc(matchesContainer, tbody, historyContainer);
  });

  matchesContainer.addEventListener('input', (e) => {
    const input = e.target;
    if (input.classList.contains('score-input')) {
      const idx = input.dataset.idx;
      const type = input.dataset.type;
      const val = input.value;
      if (!/^\d*$/.test(val)) {
        input.value = val.replace(/\D/g, '');
      }
      saveScore(idx, type, input.value);
      savedScores = getScores();
      checkAutoSave(idx);
      recalc(matchesContainer, tbody, historyContainer);
      input.classList.remove('match-error');
    }
  });

  matchesContainer.addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.classList.contains('btn-step')) {
      const idx = btn.dataset.idx;
      const type = btn.dataset.type;
      const dir = parseInt(btn.dataset.dir, 10);
      const input = matchesContainer.querySelector(`.score-input[data-idx="${idx}"][data-type="${type}"]`);
      if (input) {
        const cur = parseInt(input.value, 10) || 0;
        const next = Math.max(0, cur + dir);
        input.value = next;
        saveScore(idx, type, String(next));
        savedScores = getScores();
        checkAutoSave(idx);
        recalc(matchesContainer, tbody, historyContainer);
      }
    }
  });

  historyContainer.addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.classList.contains('history-del')) {
      const id = parseInt(btn.dataset.id, 10);
      savedHistory = savedHistory.filter((_, i) => i !== id);
      saveHistorySilent(savedHistory);
      renderMatchHistory(historyContainer, savedHistory);
    }
  });

  const btnDark = document.getElementById('btnDark');
  if (btnDark) {
    if (localStorage.getItem('mu10_dark') === 'true' ||
        (!localStorage.getItem('mu10_dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      btnDark.textContent = '☀️';
    }
    btnDark.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('mu10_dark', isDark);
      btnDark.textContent = isDark ? '☀️' : '🌙';
    });
  }
}

function checkAutoSave(idx) {
  const hs = savedScores[`${idx}_home`];
  const as = savedScores[`${idx}_away`];
  if (hs !== undefined && as !== undefined && /^\d+$/.test(hs) && /^\d+$/.test(as)) {
    const pairings = getPairings(teamNames);
    if (idx < pairings.length) {
      const p = pairings[idx];
      const exists = savedHistory.some(
        m => m.homeName === p.home.name && m.awayName === p.away.name &&
             m.homeScore === parseInt(hs, 10) && m.awayScore === parseInt(as, 10)
      );
      if (!exists) {
        addMatchToHistory({
          homeName: p.home.name,
          awayName: p.away.name,
          homeScore: parseInt(hs, 10),
          awayScore: parseInt(as, 10)
        });
        savedHistory = getMatchHistory();
      }
    }
  }
}

function saveHistorySilent(history) {
  try {
    localStorage.setItem('mu10_history', JSON.stringify(history));
  } catch {}
}

function updateTeamNames() {
  teamNames.forEach((_, i) => {
    const el = document.getElementById(`team_${i}`);
    if (el) teamNames[i] = el.value.trim() || `Team ${i + 1}`;
  });
}

function saveTeamNames() {
  setTeamNames(teamNames);
}

function changeTeamCount(delta, teamInputs, matchesContainer, tbody, historyContainer, teamCountVal) {
  let count = getTeamCount();
  count = Math.max(getMinTeams(), Math.min(getMaxTeams(), count + delta));
  setTeamCount(count);
  const stored = getTeamNames();
  teamNames = stored.slice(0, count);
  while (teamNames.length < count) {
    teamNames.push(`Team ${String.fromCharCode(65 + teamNames.length)}`);
  }
  setTeamNames(teamNames);
  if (teamCountVal) teamCountVal.textContent = count;
  renderTeamInputs(teamInputs, teamNames);
  savedScores = {};
  recalc(matchesContainer, tbody, historyContainer);
}

function recalc(matchesContainer, tbody, historyContainer) {
  const pairings = getPairings(teamNames);
  renderMatches(matchesContainer, teamNames, savedScores);
  const standings = calculateStandings(teamNames, savedScores);
  renderStandingsTable(tbody, standings);
  renderMatchHistory(historyContainer, savedHistory);
  const tableCard = document.getElementById('tableCard');
  if (standings.some(s => s.sp > 0)) {
    tableCard.classList.remove('hidden');
  } else {
    tableCard.classList.add('hidden');
  }
  if (errorEl) errorEl.textContent = '';
}

function copyTable(tbody) {
  const rows = tbody.querySelectorAll('tr');
  if (rows.length === 0 || rows[0].querySelector('td[colspan]')) {
    if (errorEl) errorEl.textContent = 'Keine Ergebnisse zum Kopieren.';
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  const lines = ['# Team Sp + - Diff Pkt'];
  const standings = calculateStandings(teamNames, savedScores);
  standings.forEach((s, i) => {
    const gd = s.gf - s.ga;
    const rank = i < 3 ? medals[i] : `${i + 1}.`;
    const gdStr = gd > 0 ? `+${gd}` : String(gd);
    lines.push(`${rank} ${s.name} ${s.sp} ${s.gf} ${s.ga} ${gdStr} ${s.pts}`);
  });
  try {
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      if (errorEl) errorEl.textContent = 'Tabelle kopiert!';
      setTimeout(() => { if (errorEl && errorEl.textContent === 'Tabelle kopiert!') errorEl.textContent = ''; }, 2000);
    });
  } catch {
    if (errorEl) errorEl.textContent = 'Kopieren fehlgeschlagen. Bitte manuell kopieren.';
  }
}

document.addEventListener('DOMContentLoaded', init);
