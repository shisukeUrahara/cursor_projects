import { STORAGE_KEYS } from "../constants.js";

export class ScoreManager {
  constructor({ onScoreChange, onBestScoreChange, onCombo }) {
    this.onScoreChange = onScoreChange;
    this.onBestScoreChange = onBestScoreChange;
    this.onCombo = onCombo;
    this.comboCount = 0;
    this.multiplier = 1;
    this.score = 0;
    this.bestScore = Number(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || 0);
    this.onBestScoreChange(this.bestScore);
  }

  reset() {
    this.score = 0;
    this.comboCount = 0;
    this.multiplier = 1;
    this.onScoreChange(this.score);
  }

  addPoint({ cleanPass = false, trackHighScore = true } = {}) {
    if (cleanPass) {
      this.comboCount += 1;
      if (this.comboCount % 3 === 0) {
        this.multiplier = Math.min(this.multiplier + 1, 5);
        this.onCombo(this.comboCount, this.multiplier);
      }
    } else {
      this.comboCount = 0;
      this.multiplier = 1;
    }

    this.score += this.multiplier;
    this.onScoreChange(this.score);

    if (trackHighScore && this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem(STORAGE_KEYS.BEST_SCORE, this.bestScore);
      this.onBestScoreChange(this.bestScore);
    }
  }
}
