import { Game } from "./systems/Game.js";
import { InputManager } from "./systems/InputManager.js";
import { OverlayController } from "./ui/OverlayController.js";
import { GAME_MODES } from "./constants.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvasContainer = document.getElementById("canvas-wrapper");
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlay-message");
  const comboIndicator = document.getElementById("combo-indicator");
  const scoreValue = document.getElementById("score-value");
  const bestScoreValue = document.getElementById("best-score-value");
  const startButton = document.getElementById("start-button");
  const practiceButton = document.getElementById("practice-button");
  const soundToggle = document.getElementById("sound-toggle");

  const overlayController = new OverlayController({
    overlayElement: overlay,
    messageElement: overlayMessage,
    comboElement: comboIndicator,
    scoreElement: scoreValue,
    bestScoreElement: bestScoreValue,
  });

  const game = new Game({ canvasContainer, overlayController, soundToggle });

  new InputManager({
    onFlap: () => game.flap(),
    onPause: () => game.togglePause(),
    onToggleSound: () => soundToggle.click(),
  });

  startButton.addEventListener("click", () => {
    overlayController.hideOverlay();
    game.start(GAME_MODES.CLASSIC);
  });

  practiceButton.addEventListener("click", () => {
    overlayController.showOverlay("Free Fly mode engaged – glide without limits!");
    game.start(GAME_MODES.PRACTICE);
    setTimeout(() => overlayController.hideOverlay(), 1400);
  });
});
