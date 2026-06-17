/**
 * GameManager - Verwaltet alle Spieleinträge
 * Übernimmt: Hinzufügen, Löschen, Speichern und Laden von Spielen
 */
class GameManager {
    constructor() {
        this.games = JSON.parse(localStorage.getItem('games')) || [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const gameForm = document.getElementById('gameForm');
        if (gameForm) {
            gameForm.addEventListener('submit', (e) => this.addGame(e));
        }
    }

    /**
     * Fügt ein neues Spiel hinzu
     */
    addGame(e) {
        e.preventDefault();

        const team1 = document.getElementById('team1').value.trim();
        const score1 = parseInt(document.getElementById('score1').value);
        const score2 = parseInt(document.getElementById('score2').value);
        const team2 = document.getElementById('team2').value.trim();

        if (!team1 || !team2 || isNaN(score1) || isNaN(score2)) {
            alert('Bitte alle Felder ausfüllen!');
            return;
        }

        this.games.push({
            id: Date.now(),
            team1,
            score1,
            team2,
            score2
        });

        this.saveGames();
        uiRenderer.updateUI();
        document.getElementById('gameForm').reset();
        document.getElementById('team1').focus();
    }

    /**
     * Löscht ein Spiel anhand der ID
     */
    deleteGame(id) {
        this.games = this.games.filter(game => game.id !== id);
        this.saveGames();
        uiRenderer.updateUI();
    }

    /**
     * Löscht alle Spiele nach Bestätigung
     */
    resetAll() {
        if (confirm('Möchtest du wirklich alle Spiele löschen?')) {
            this.games = [];
            this.saveGames();
            uiRenderer.updateUI();
        }
    }

    /**
     * Speichert alle Spiele im localStorage
     */
    saveGames() {
        localStorage.setItem('games', JSON.stringify(this.games));
    }

    /**
     * Gibt alle Spiele zurück
     */
    getGames() {
        return this.games;
    }
}

const gameManager = new GameManager();