/**
 * StandingsCalculator - Berechnet die Tabelle aus den Spielergebnissen
 * Übernimmt: Statistiken, Punkte, Rangfolge
 */
class StandingsCalculator {
    /**
     * Berechnet die aktuelle Tabelle
     */
    calculate(games) {
        const standings = {};

        games.forEach(game => {
            this.initializeTeam(standings, game.team1);
            this.initializeTeam(standings, game.team2);
            this.updateTeamStats(standings, game);
        });

        return this.sortStandings(standings);
    }

    /**
     * Initialisiert ein Team in der Tabelle, falls es noch nicht vorhanden ist
     */
    initializeTeam(standings, teamName) {
        if (!standings[teamName]) {
            standings[teamName] = {
                team: teamName,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0
            };
        }
    }

    /**
     * Updated die Statistiken eines Teams basierend auf einem Spielergebnis
     */
    updateTeamStats(standings, game) {
        // Update Team 1
        standings[game.team1].played++;
        standings[game.team1].goalsFor += game.score1;
        standings[game.team1].goalsAgainst += game.score2;

        // Update Team 2
        standings[game.team2].played++;
        standings[game.team2].goalsFor += game.score2;
        standings[game.team2].goalsAgainst += game.score1;

        // Determine winner and award points
        if (game.score1 > game.score2) {
            standings[game.team1].wins++;
            standings[game.team1].points += 3;
            standings[game.team2].losses++;
        } else if (game.score1 < game.score2) {
            standings[game.team2].wins++;
            standings[game.team2].points += 3;
            standings[game.team1].losses++;
        } else {
            standings[game.team1].draws++;
            standings[game.team1].points += 1;
            standings[game.team2].draws++;
            standings[game.team2].points += 1;
        }
    }

    /**
     * Sortiert die Tabelle nach Punkten, Differenz und geschossenen Toren
     */
    sortStandings(standings) {
        return Object.values(standings).sort((a, b) => {
            // Sortiere nach Punkten
            if (b.points !== a.points) return b.points - a.points;
            
            // Bei gleichen Punkten: sortiere nach Differenz
            const diffA = a.goalsFor - a.goalsAgainst;
            const diffB = b.goalsFor - b.goalsAgainst;
            if (diffB !== diffA) return diffB - diffA;
            
            // Bei gleicher Differenz: sortiere nach geschossenen Toren
            return b.goalsFor - a.goalsFor;
        });
    }
}

const standingsCalculator = new StandingsCalculator();