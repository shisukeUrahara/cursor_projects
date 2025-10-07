import { GAME_STATES } from "../constants.js";

export class OverlayController {
  constructor({ overlayElement, messageElement, comboElement, scoreElement, bestScoreElement }) {
    this.overlayElement = overlayElement;
    this.messageElement = messageElement;
    this.comboElement = comboElement;
    this.scoreElement = scoreElement;
    this.bestScoreElement = bestScoreElement;
  }

  showOverlay(message) {
    this.messageElement.textContent = message;
    this.overlayElement.classList.remove("hidden");
  }

  hideOverlay() {
    this.overlayElement.classList.add("hidden");
  }

  updateScore(score) {
    this.scoreElement.textContent = score;
  }

  updateBestScore(bestScore) {
    if (bestScore > 0) {
      this.bestScoreElement.parentElement.classList.remove("hidden");
      this.bestScoreElement.textContent = bestScore;
    }
  }

  showCombo(combo, multiplier) {
    this.comboElement.textContent = `Combo x${multiplier} – ${combo} clean passes!`;
    this.comboElement.classList.remove("hidden");
    clearTimeout(this.comboTimeout);
    this.comboTimeout = setTimeout(() => {
      this.comboElement.classList.add("hidden");
    }, 1200);
  }

  handleStateChange(state) {
    if (state === GAME_STATES.GAME_OVER) {
      this.overlayElement.classList.remove("hidden");
      this.messageElement.textContent = "That one was close! Try again?";
    } else if (state === GAME_STATES.PAUSED) {
      this.overlayElement.classList.remove("hidden");
      this.messageElement.textContent = "Paused. Take a breather.";
    } else if (state === GAME_STATES.RUNNING) {
      this.overlayElement.classList.add("hidden");
    }
  }
}
