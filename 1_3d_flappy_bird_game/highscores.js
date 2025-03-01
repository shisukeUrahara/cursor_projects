class HighScoreManager {
    constructor() {
        this.highScores = [];
        this.loadHighScores();
    }

    loadHighScores() {
        const savedScores = localStorage.getItem('flappyBird3dHighScores');
        this.highScores = savedScores ? JSON.parse(savedScores) : [];
    }

    saveHighScores() {
        localStorage.setItem('flappyBird3dHighScores', JSON.stringify(this.highScores));
    }

    isHighScore(score) {
        return this.highScores.length < 5 || score > this.highScores[this.highScores.length - 1].score;
    }

    addHighScore(name, score) {
        const newScore = { name, score, date: new Date().toISOString() };
        this.highScores.push(newScore);

        // Sort high scores in descending order
        this.highScores.sort((a, b) => b.score - a.score);

        // Keep only top 5
        if (this.highScores.length > 5) {
            this.highScores = this.highScores.slice(0, 5);
        }

        this.saveHighScores();
        return this.highScores;
    }

    getHighScores() {
        return this.highScores;
    }

    displayHighScores() {
        const highScoresList = document.getElementById('high-scores-list');
        highScoresList.innerHTML = '';

        this.highScores.forEach(score => {
            const listItem = document.createElement('li');
            listItem.textContent = `${score.name}: ${score.score}`;
            highScoresList.appendChild(listItem);
        });
    }
} 