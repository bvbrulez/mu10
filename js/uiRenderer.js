export function renderTeamInputs(container, names) {
  container.innerHTML = names.map((name, i) =>
    `<input type="text" id="team_${i}" class="team-input" placeholder="Team ${i + 1}" value="${esc(name)}">`
  ).join('');
}

export function renderMatches(container, teamNames, scores) {
  const n = teamNames.length;
  let idx = 0;
  const parts = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const hs = scores[`${idx}_home`] || '';
      const as = scores[`${idx}_away`] || '';
      parts.push(`
        <div class="match">
          <span class="team-label">${esc(teamNames[i])}</span>
          <button class="btn-step" data-idx="${idx}" data-type="home" data-dir="-1" type="button">−</button>
          <input type="text" inputmode="numeric" pattern="[0-9]*"
                 class="score-input" data-idx="${idx}" data-type="home"
                 value="${hs}" placeholder="-">
          <button class="btn-step" data-idx="${idx}" data-type="home" data-dir="1" type="button">+</button>
          <span class="vs">:</span>
          <button class="btn-step" data-idx="${idx}" data-type="away" data-dir="-1" type="button">−</button>
          <input type="text" inputmode="numeric" pattern="[0-9]*"
                 class="score-input" data-idx="${idx}" data-type="away"
                 value="${as}" placeholder="-">
          <button class="btn-step" data-idx="${idx}" data-type="away" data-dir="1" type="button">+</button>
          <span class="team-label">${esc(teamNames[j])}</span>
        </div>
      `);
      idx++;
    }
  }
  container.innerHTML = parts.join('');
}

export function renderStandingsTable(tbody, standings) {
  const medals = ['🥇', '🥈', '🥉'];
  const klass = ['gold', 'silver', 'bronze'];

  if (!standings || standings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="info-text">Keine Ergebnisse eingegeben</td></tr>';
    return;
  }

  tbody.innerHTML = standings.map((s, i) => {
    const gd = s.gf - s.ga;
    const rank = i < 3 ? medals[i] : `${i + 1}.`;
    return `
      <tr class="${klass[i] || ''}">
        <td class="rank">${rank}</td>
        <td class="team-name-cell">${esc(s.name)}</td>
        <td>${s.sp}</td>
        <td>${s.gf}</td>
        <td>${s.ga}</td>
        <td>${gd > 0 ? '+' : ''}${gd}</td>
        <td><strong>${s.pts}</strong></td>
      </tr>
    `;
  }).join('');
}

export function renderMatchHistory(container, history) {
  if (!history || history.length === 0) {
    container.innerHTML = '<p class="info-text">Noch keine abgeschlossenen Spiele.</p>';
    return;
  }
  container.innerHTML = history.slice().reverse().map(m => {
    const d = new Date(m.timestamp);
    const dateStr = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `
      <div class="history-item">
        <span class="history-teams">${esc(m.homeName)} ${m.homeScore} : ${m.awayScore} ${esc(m.awayName)}</span>
        <span class="history-date">${dateStr}</span>
      </div>
    `;
  }).join('');
}

function esc(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
