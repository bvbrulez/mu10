export function calculateStandings(teamNames, scores) {
  const n = teamNames.length;
  const pairings = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairings.push({ home: { id: i, name: teamNames[i] }, away: { id: j, name: teamNames[j] } });
    }
  }

  const stats = {};
  for (let i = 0; i < n; i++) {
    stats[i] = { id: i, name: teamNames[i], sp: 0, s: 0, u: 0, n: 0, gf: 0, ga: 0, pts: 0 };
  }

  const matches = [];

  pairings.forEach((p, idx) => {
    const hVal = scores[`${idx}_home`] || '';
    const aVal = scores[`${idx}_away`] || '';
    if (hVal === '' && aVal === '') return;
    if (!/^\d+$/.test(hVal) || !/^\d+$/.test(aVal)) return;

    const hs = parseInt(hVal, 10);
    const as = parseInt(aVal, 10);
    const h = p.home.id, a = p.away.id;

    stats[h].sp++;
    stats[a].sp++;
    stats[h].gf += hs; stats[h].ga += as;
    stats[a].gf += as; stats[a].ga += hs;

    if (hs > as) { stats[h].s++; stats[h].pts += 3; stats[a].n++; }
    else if (hs < as) { stats[a].s++; stats[a].pts += 3; stats[h].n++; }
    else { stats[h].u++; stats[h].pts += 1; stats[a].u++; stats[a].pts += 1; }

    matches.push({ homeId: h, awayId: a, hs, as });
  });

  const sorted = [...Array(n).keys()].sort((a, b) => {
    if (stats[b].pts !== stats[a].pts) return stats[b].pts - stats[a].pts;
    const h2h = getH2H(a, b, matches);
    if (h2h !== 0) return h2h;
    const gdA = stats[a].gf - stats[a].ga;
    const gdB = stats[b].gf - stats[b].ga;
    if (gdB !== gdA) return gdB - gdA;
    return stats[b].gf - stats[a].gf;
  });

  return sorted.map(id => stats[id]);
}

function getH2H(a, b, matches) {
  let ptsA = 0, ptsB = 0;
  matches.forEach(m => {
    if (!(m.homeId === a && m.awayId === b) && !(m.homeId === b && m.awayId === a)) return;
    const aScore = m.homeId === a ? m.hs : m.as;
    const bScore = m.homeId === b ? m.hs : m.as;
    if (aScore > bScore) ptsA += 3;
    else if (bScore > aScore) ptsB += 3;
    else { ptsA += 1; ptsB += 1; }
  });
  return ptsB - ptsA;
}
