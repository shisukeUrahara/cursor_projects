export class InputManager {
  constructor({ onFlap, onPause, onToggleSound }) {
    this.onFlap = onFlap;
    this.onPause = onPause;
    this.onToggleSound = onToggleSound;
    this.isTouching = false;
    this.#bindEvents();
  }

  #bindEvents() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        this.onFlap();
      }

      if (event.code === "KeyP") {
        this.onPause();
      }

      if (event.code === "KeyM") {
        this.onToggleSound();
      }
    });

    window.addEventListener("mousedown", () => this.onFlap());
    window.addEventListener("touchstart", (event) => {
      this.isTouching = true;
      event.preventDefault();
      this.onFlap();
    });

    window.addEventListener("touchend", () => {
      this.isTouching = false;
    });
  }
}
