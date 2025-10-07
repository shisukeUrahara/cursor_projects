export const GAME_MODES = Object.freeze({
  CLASSIC: "classic",
  PRACTICE: "practice",
});

export const GAME_STATES = Object.freeze({
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  GAME_OVER: "game_over",
});

export const PIPE_CONFIG = Object.freeze({
  GAP_BASE: 8,
  GAP_VARIATION: 2.5,
  SPAWN_INTERVAL: 2400,
  SPEED: 7.6,
  SPAWN_DISTANCE: 36,
});

export const BIRD_CONFIG = Object.freeze({
  GRAVITY: -18,
  FLAP_STRENGTH: 8.5,
  MAX_DESCENT: -14,
  MAX_ASCENT: 12,
  DAMPING: 0.98,
  BASE_TILT: Math.PI / 12,
});

export const WORLD_CONFIG = Object.freeze({
  FLOOR_LEVEL: -8,
  SKY_LEVEL: 16,
  FOV: 60,
  CAMERA_DISTANCE: 24,
  SCROLL_SPEED: 7.6,
});

export const STORAGE_KEYS = Object.freeze({
  BEST_SCORE: "flappy3d_best_score",
  SOUND_ENABLED: "flappy3d_sound",
});
