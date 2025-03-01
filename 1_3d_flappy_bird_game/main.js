document.addEventListener('DOMContentLoaded', () => {
    const game = new FlappyBird3D();
    const highScoreManager = new HighScoreManager();

    // Display high scores on load
    highScoreManager.displayHighScores();

    // Start button event listener
    document.getElementById('start-button').addEventListener('click', () => {
        game.startGame();
    });

    // Restart button event listener
    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('game-over').classList.add('hidden');
        game.startGame();
    });

    // Save high score
    document.getElementById('save-score').addEventListener('click', () => {
        const playerName = document.getElementById('player-name').value.trim() || 'Anonymous';
        highScoreManager.addHighScore(playerName, game.score);
        highScoreManager.displayHighScores();
        document.getElementById('high-score-input').classList.add('hidden');
        document.getElementById('player-name').value = '';
    });

    // Allow pressing Enter to save high score
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('save-score').click();
        }
    });
}); 