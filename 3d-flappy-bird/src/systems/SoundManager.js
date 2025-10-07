import { STORAGE_KEYS } from "../constants.js";

export class SoundManager {
  constructor() {
    this.enabled = this.#loadPreference();
    this.sounds = {
      flap: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-game-click-1114.mp3"),
      score: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.wav"),
      hit: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.wav"),
    };
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.4;
    });
  }

  #loadPreference() {
    const stored = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return stored === null ? true : stored === "true";
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, this.enabled);
    return this.enabled;
  }

  play(name) {
    if (!this.enabled) {
      return;
    }
    const sound = this.sounds[name];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}
