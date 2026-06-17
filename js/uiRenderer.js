/**
 * UIRenderer - Rendert die Benutzeroberfläche
 * Übernimmt: Aktualisierung der Spielliste und Tabelle
 */
class UIRenderer {
    /**
     * Aktualisiert beide UI-Komponenten (Spielliste und Tabelle)
     */
    updateUI() {
        this.updateGamesList();
        this.updateStandingsTable();
    }

    /**
     * Aktualisiert die Liste der bisherigen Spiele
     */
    updateGamesList() {
        const gamesList = document.getElementById('gamesList');
        const games = gameManager.getGames();

        if (games.length === 0) {
            gamesList.innerHTML = '<div class="no-games">Noch keine Spiele hinzugefügt</div>';
            return;
        }

        gamesList.innerHTML = games.map(game => this.createGameItemHTML(game)).join('');
    }

    /**
     * Erstellt das HTML für einen Spieleintrag
     */
    createGameItemHTML(game) {
        return `
            <div class="game-item">
                <div class="game-info">
                    <div class="game-teams">${game.team1} vs ${game.team2}</div>
                    <div class="game-score">${game.score1} : ${game.score2}</div>
                </div>
                <button class="delete-btn" onclick="gameManager.deleteGame(${game.id})">Löschen</button>
            </div>
        `;
    }

    /**
     * Aktualisiert die Tabelle
     */
    updateStandingsTable() {
        const games = gameManager.getGames();
        const standings = standingsCalculator.calculate(games);
        const tbody = document.getElementById('standingsBody');

        if (standings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="no-games">Keine Daten vorhanden</td></tr>';
            return;
        }

        tbody.innerHTML = standings.map((team, index) => this.createTableRowHTML(team, index)).join('');
    }

    /**
     * Erstellt das HTML für eine Tabellenzeile
     */
    createTableRowHTML(team, index) {
        const goalDiff = team.goalsFor - team.goalsAgainst;
        const goalDiffStr = goalDiff > 0 ? '+' + goalDiff : goalDiff;

        return `
            <tr>
                <td class="rank">${index + 1}.</td>
                <td class="team-name">${team.team}</td>
                <td class="stat">${team.played}</td>
                <td class="stat">${team.wins}</td>
                <td class="stat">${team.draws}</td>
                <td class="stat">${team.losses}</td>
                <td class="stat">${team.goalsFor}:${team.goalsAgainst}</td>
                <td class="stat">${goalDiffStr}</td>
                <td><span class="points">${team.points}</span></td>
            </tr>
        `;
    }
}

const uiRenderer = new UIRenderer();

// Initial render when page loads
document.addEventListener('DOMContentLoaded', () => {
    uiRenderer.updateUI();
});