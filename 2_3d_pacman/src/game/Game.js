import { GAME_SETTINGS, COLORS, MAZE_LAYOUT } from '../utils/Constants.js';
import { Player } from './Player.js';
import { Maze } from './Maze.js';
import { Ghost } from './Ghost.js';
import { CollectibleManager } from './CollectibleManager.js';

const CAMERA_OFFSET = new THREE.Vector3(0, 16, 12);
const LOOK_AT_TARGET = new THREE.Vector3();

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x040404);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.copy(CAMERA_OFFSET);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
            alpha: false,
            powerPreference: 'low-power',
            preserveDrawingBuffer: false
        });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.shadowMap.enabled = false;
        this.renderer.autoClear = true;

        this.clock = new THREE.Clock();
        this.currentPixelRatio = 1;
        this.fpsSamples = [];
        this.resolutionTimer = 0;

        this.score = 0;
        this.lives = GAME_SETTINGS.INITIAL_LIVES;
        this.gameOver = false;
        this.powerMode = false;
        this.powerModeTimeout = null;

        this.playerStart = new THREE.Vector3();
        this.cameraTarget = new THREE.Vector3();
        this.tempVector = new THREE.Vector3();

        this.ghosts = [];
        this.ghostStartPositions = [];
        this.collectibleManager = null;

        this.graphicsPresets = {
            low: {
                minPixelRatio: 0.7,
                maxPixelRatio: 0.85,
                ambientIntensity: 0.55,
                directionalIntensity: 0.35,
                exposure: 0.95,
                enablePlayerLight: false,
                playerLightIntensity: 0,
                playerLightDistance: 0,
                dynamicResolution: true,
                targetFPS: 32,
                enableShadows: false
            },
            medium: {
                minPixelRatio: 0.8,
                maxPixelRatio: 1.15,
                ambientIntensity: 0.65,
                directionalIntensity: 0.45,
                exposure: 1.05,
                enablePlayerLight: true,
                playerLightIntensity: 0.65,
                playerLightDistance: 6.5,
                dynamicResolution: true,
                targetFPS: 60,
                enableShadows: false
            },
            high: {
                minPixelRatio: 0.9,
                maxPixelRatio: 1.4,
                ambientIntensity: 0.75,
                directionalIntensity: 0.6,
                exposure: 1.12,
                enablePlayerLight: true,
                playerLightIntensity: 0.85,
                playerLightDistance: 7.5,
                dynamicResolution: true,
                targetFPS: 60,
                enableShadows: false
            }
        };

        this.graphicsPresetName = 'medium';
        this.graphicsPreset = this.graphicsPresets[this.graphicsPresetName];
        this.dynamicResolutionEnabled = true;

        this.scoreValueElement = document.getElementById('score-value');
        this.livesValueElement = document.getElementById('lives-value');

        this.init();
    }

    init() {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.graphicsPreset.maxPixelRatio));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.maze = new Maze(MAZE_LAYOUT);
        this.scene.add(this.maze.mesh);

        this.player = new Player();
        const startCell = {
            x: Math.floor(MAZE_LAYOUT[0].length / 2),
            z: Math.floor(MAZE_LAYOUT.length / 2)
        };
        this.playerStart.copy(this.maze.gridToWorld(startCell.x, startCell.z));
        this.playerStart.y = 0.5;
        this.player.mesh.position.copy(this.playerStart);
        this.scene.add(this.player.mesh);

        this.collectibleManager = new CollectibleManager(MAZE_LAYOUT, this.maze);
        this.collectibleManager.addToScene(this.scene);

        this.#setupLighting();

        const ghostCells = [
            { x: startCell.x, z: startCell.z - 1 },
            { x: startCell.x - 1, z: startCell.z },
            { x: startCell.x + 1, z: startCell.z },
            { x: startCell.x, z: startCell.z + 1 }
        ];

        COLORS.GHOST_COLORS.forEach((color, index) => {
            const cell = ghostCells[index % ghostCells.length];
            const position = this.maze.gridToWorld(cell.x, cell.z);
            position.y = 0.5;
            const ghost = new Ghost(color, position);
            this.ghosts.push(ghost);
            this.ghostStartPositions.push(position.clone());
            this.scene.add(ghost.mesh);
        });

        this.applyGraphicsPreset(this.graphicsPresetName, true);

        this.updateScore(0);
        this.updateLives(0);

        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (event) => this.handleInput(event));

        const graphicsToggle = document.getElementById('graphics-toggle');
        if (graphicsToggle) {
            graphicsToggle.value = this.graphicsPresetName;
            graphicsToggle.addEventListener('change', (event) => {
                this.applyGraphicsPreset(event.target.value);
            });
        }

        this.animate();
    }

    #setupLighting() {
        this.ambientLight = new THREE.HemisphereLight(0x3a4c82, 0x050505, 0.6);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.directionalLight.position.set(6, 12, 8);
        this.scene.add(this.directionalLight);

        this.playerLight = new THREE.PointLight(0xfff1a1, 0.7, 7, 1.4);
        this.playerLight.position.copy(this.playerStart).add(new THREE.Vector3(0, 2, 0));
        this.playerLight.visible = false;
        this.scene.add(this.playerLight);
    }

    applyGraphicsPreset(presetName, initial = false) {
        const preset = this.graphicsPresets[presetName] || this.graphicsPresets.medium;
        this.graphicsPresetName = presetName;
        this.graphicsPreset = preset;

        this.ambientLight.intensity = preset.ambientIntensity;
        this.directionalLight.intensity = preset.directionalIntensity;
        this.renderer.toneMappingExposure = preset.exposure;

        this.renderer.shadowMap.enabled = preset.enableShadows;
        this.directionalLight.castShadow = preset.enableShadows;

        this.playerLight.visible = preset.enablePlayerLight;
        this.playerLight.intensity = preset.playerLightIntensity;
        this.playerLight.distance = preset.playerLightDistance;

        this.dynamicResolutionEnabled = preset.dynamicResolution;
        this.fpsSamples.length = 0;
        this.resolutionTimer = 0;

        if (initial) {
            this.currentPixelRatio = Math.min(window.devicePixelRatio, preset.maxPixelRatio);
        }

        this.currentPixelRatio = Math.min(Math.max(this.currentPixelRatio, preset.minPixelRatio), preset.maxPixelRatio);
        this.renderer.setPixelRatio(this.currentPixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const graphicsToggle = document.getElementById('graphics-toggle');
        if (graphicsToggle && graphicsToggle.value !== this.graphicsPresetName) {
            graphicsToggle.value = this.graphicsPresetName;
        }
    }

    handleInput(event) {
        if (this.gameOver) {
            return;
        }

        const key = event.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
            event.preventDefault();
            const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
            this.player.handleInput(normalizedKey);
        }
    }

    updateScore(delta) {
        this.score += delta;
        if (this.scoreValueElement) {
            this.scoreValueElement.textContent = `${this.score}`;
        }
    }

    updateLives(delta) {
        this.lives += delta;
        if (this.livesValueElement) {
            this.livesValueElement.textContent = `${this.lives}`;
        }
    }

    update(deltaTime) {
        if (this.gameOver) {
            return;
        }

        this.player.update(deltaTime);
        this.maze.resolveCollision(this.player.mesh.position);

        this.collectibleManager.update(deltaTime);

        for (const ghost of this.ghosts) {
            ghost.update(deltaTime, this.maze);
        }

        this.updatePlayerLight();
        this.updateCamera();
        this.checkCollectibles();
        this.checkGhostCollisions();
        this.adjustDynamicResolution(deltaTime);
    }

    checkCollectibles() {
        const result = this.collectibleManager.collectAt(this.player.mesh.position);
        if (!result) {
            return;
        }

        if (result.type === 'powerPellet') {
            this.updateScore(GAME_SETTINGS.POWER_PELLET_VALUE);
            this.activatePowerMode();
        } else {
            this.updateScore(GAME_SETTINGS.PELLET_VALUE);
        }

        if (this.collectibleManager.getRemainingCount() === 0) {
            this.handleWin();
        }
    }

    checkGhostCollisions() {
        const playerPosition = this.player.mesh.position;
        for (let i = 0; i < this.ghosts.length; i++) {
            const ghost = this.ghosts[i];
            const distance = playerPosition.distanceTo(ghost.mesh.position);

            if (distance > 0.8) {
                continue;
            }

            if (this.powerMode) {
                this.updateScore(GAME_SETTINGS.GHOST_SCORE);
                const respawnPosition = this.maze.getRandomOpenPosition();
                ghost.reset(respawnPosition);
            } else {
                this.handlePlayerDeath();
                break;
            }
        }
    }

    activatePowerMode() {
        this.powerMode = true;
        this.ghosts.forEach((ghost) => ghost.setFrightened(true));
        if (this.powerModeTimeout) {
            clearTimeout(this.powerModeTimeout);
        }

        this.powerModeTimeout = setTimeout(() => {
            this.powerMode = false;
            this.ghosts.forEach((ghost) => ghost.setFrightened(false));
        }, GAME_SETTINGS.POWER_MODE_DURATION);
    }

    handlePlayerDeath() {
        this.updateLives(-1);

        if (this.lives <= 0) {
            this.gameOver = true;
            setTimeout(() => alert(`Game Over! Score: ${this.score}`), 50);
            return;
        }

        this.powerMode = false;
        if (this.powerModeTimeout) {
            clearTimeout(this.powerModeTimeout);
            this.powerModeTimeout = null;
        }

        this.player.mesh.position.copy(this.playerStart);
        this.player.velocity.set(0, 0, 0);
        this.player.isMoving = false;

        this.ghosts.forEach((ghost, index) => {
            const startPosition = this.ghostStartPositions[index];
            ghost.reset(startPosition);
        });
    }

    handleWin() {
        if (this.gameOver) {
            return;
        }
        this.gameOver = true;
        setTimeout(() => alert(`You cleared the maze! Score: ${this.score}`), 50);
    }

    updatePlayerLight() {
        if (!this.playerLight || !this.playerLight.visible) {
            return;
        }

        this.playerLight.position.copy(this.player.mesh.position);
        this.playerLight.position.y += 1.5;
    }

    updateCamera() {
        this.cameraTarget.lerp(this.player.mesh.position, 0.12);
        this.tempVector.copy(this.player.mesh.position).add(CAMERA_OFFSET);
        this.camera.position.lerp(this.tempVector, 0.08);

        LOOK_AT_TARGET.copy(this.cameraTarget);
        LOOK_AT_TARGET.y = 0.8;
        this.camera.lookAt(LOOK_AT_TARGET);
    }

    adjustDynamicResolution(deltaTime) {
        if (!this.dynamicResolutionEnabled) {
            return;
        }

        const fps = 1 / Math.max(0.0001, deltaTime);
        this.fpsSamples.push(fps);
        if (this.fpsSamples.length > 120) {
            this.fpsSamples.shift();
        }

        this.resolutionTimer += deltaTime;
        if (this.resolutionTimer < 1.0) {
            return;
        }
        this.resolutionTimer = 0;

        const averageFPS = this.fpsSamples.reduce((sum, value) => sum + value, 0) / this.fpsSamples.length;
        let newRatio = this.currentPixelRatio;

        if (averageFPS < this.graphicsPreset.targetFPS - 5 && newRatio > this.graphicsPreset.minPixelRatio) {
            newRatio = Math.max(this.graphicsPreset.minPixelRatio, newRatio - 0.1);
        } else if (averageFPS > this.graphicsPreset.targetFPS + 5 && newRatio < this.graphicsPreset.maxPixelRatio) {
            newRatio = Math.min(this.graphicsPreset.maxPixelRatio, newRatio + 0.05);
        }

        if (Math.abs(newRatio - this.currentPixelRatio) > 0.01) {
            this.currentPixelRatio = newRatio;
            this.renderer.setPixelRatio(this.currentPixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        this.update(deltaTime);
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
