export const GAME_SETTINGS = {
    PLAYER_SPEED: 0.1,
    GHOST_SPEED: 0.08,
    PELLET_VALUE: 10,
    POWER_PELLET_VALUE: 50,
    GHOST_SCORE: 200,
    INITIAL_LIVES: 3
};

export const COLORS = {
    PLAYER: 0xffff00,  // Yellow
    MAZE: 0x2121de,    // Blue
    PELLET: 0xffffff,  // White
    POWER_PELLET: 0xffbb00,  // Orange
    GHOST_COLORS: [
        0xff0000,  // Red (Blinky)
        0xffb8ff,  // Pink (Pinky)
        0x00ffff,  // Cyan (Inky)
        0xffb851   // Orange (Clyde)
    ]
};

export const MAZE_LAYOUT = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
// 0: empty (pellet), 1: wall, 2: power pellet 