document.addEventListener('DOMContentLoaded', () => {
    const game = new FlappyBird3D();
    const highScoreManager = new HighScoreManager();
    const characterManager = new CharacterManager();

    // Display high scores on load
    highScoreManager.displayHighScores();

    // Start button event listener
    document.getElementById('start-button').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('character-select').classList.remove('hidden');
    });

    // Character selection
    document.querySelectorAll('.character-option').forEach(option => {
        option.addEventListener('click', () => {
            const character = option.dataset.character;
            characterManager.setSelectedCharacter(character);
        });
    });

    // Select character button
    document.getElementById('select-character-button').addEventListener('click', () => {
        const selectedCharacter = characterManager.getSelectedCharacter();
        game.setCharacter(selectedCharacter);
        document.getElementById('character-select').classList.add('hidden');
        game.startGame();
    });

    // Restart button event listener
    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('character-select').classList.remove('hidden');
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