import { GAME_SETTINGS, COLORS, MAZE_LAYOUT } from '../utils/Constants.js';
import { Player } from './Player.js';
import { Maze } from './Maze.js';
import { Ghost } from './Ghost.js';
import { Collectible } from './Collectible.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });

        this.score = 0;
        this.lives = GAME_SETTINGS.INITIAL_LIVES;
        this.gameOver = false;

        this.ghosts = [];
        this.collectibles = [];

        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);

        // Initialize game objects first
        this.maze = new Maze(MAZE_LAYOUT);
        this.scene.add(this.maze.mesh);

        this.player = new Player();
        this.scene.add(this.player.mesh);

        // Setup lighting after player is created
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const createDirectionalLight = (x, y, z, intensity) => {
            const light = new THREE.DirectionalLight(0xffffff, intensity);
            light.position.set(x, y, z);
            this.scene.add(light);
            return light;
        };

        createDirectionalLight(0, 20, 10, 0.5);
        createDirectionalLight(0, 20, -10, 0.3);
        createDirectionalLight(10, 20, 0, 0.3);
        createDirectionalLight(-10, 20, 0, 0.3);

        // Add player light after player is created
        const pointLight = new THREE.PointLight(0xffffaa, 0.5, 10);
        pointLight.position.copy(this.player.mesh.position);
        pointLight.position.y += 2;
        this.scene.add(pointLight);
        this.playerLight = pointLight;

        // Add ghosts with doubled positions
        const ghostPositions = [
            new THREE.Vector3(-10, 0.5, -10),  // Doubled from -5
            new THREE.Vector3(10, 0.5, -10),   // Doubled from 5
            new THREE.Vector3(-10, 0.5, 10),
            new THREE.Vector3(10, 0.5, 10)
        ];

        COLORS.GHOST_COLORS.forEach((color, index) => {
            const ghost = new Ghost(color, ghostPositions[index]);
            this.ghosts.push(ghost);
            this.scene.add(ghost.mesh);
        });

        // Add collectibles with doubled spacing
        for (let z = 0; z < MAZE_LAYOUT.length; z++) {
            for (let x = 0; x < MAZE_LAYOUT[z].length; x++) {
                if (MAZE_LAYOUT[z][x] === 0 || MAZE_LAYOUT[z][x] === 2) {
                    const position = new THREE.Vector3(
                        (x * 2) - MAZE_LAYOUT[z].length,
                        0.5,
                        (z * 2) - MAZE_LAYOUT.length
                    );
                    const type = MAZE_LAYOUT[z][x] === 2 ? 'powerPellet' : 'pellet';
                    const collectible = new Collectible(type, position);
                    this.collectibles.push(collectible);
                    this.scene.add(collectible.mesh);
                }
            }
        }

        // Adjust camera height for larger maze
        const mazeHeight = 40; // Increased height to see larger maze
        this.camera.position.set(0, mazeHeight, 0);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 0, -1);

        // Setup event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('keydown', this.handleInput.bind(this));

        // Start game loop
        this.animate();
    }

    handleInput(event) {
        if (this.gameOver) return;

        this.player.handleInput(event.key);
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.player.update(deltaTime);
        this.ghosts.forEach(ghost => ghost.update());
        this.collectibles.forEach(collectible => collectible.update());

        this.updateCamera();
        this.checkCollisions();

        if (this.playerLight) {
            this.playerLight.position.copy(this.player.mesh.position);
            this.playerLight.position.y += 2;
        }
    }

    updateCamera() {
        // Follow player from above
        const targetPosition = this.player.mesh.position.clone();
        targetPosition.y = 30; // Keep height constant
        targetPosition.z = 0;  // Stay centered above player

        this.camera.position.lerp(targetPosition, 0.1);
        this.camera.lookAt(this.player.mesh.position);
    }

    checkCollisions() {
        // Check wall collisions
        const playerPosition = this.player.mesh.position;
        this.maze.checkCollision(playerPosition);

        // Check collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            const distance = playerPosition.distanceTo(collectible.mesh.position);

            if (distance < 0.7) { // Collision threshold
                // Remove collectible
                this.scene.remove(collectible.mesh);
                this.collectibles.splice(i, 1);

                // Update score
                if (collectible.type === 'powerPellet') {
                    this.score += GAME_SETTINGS.POWER_PELLET_VALUE;
                    this.activatePowerMode();
                } else {
                    this.score += GAME_SETTINGS.PELLET_VALUE;
                }

                // Update score display
                document.getElementById('score-value').textContent = this.score;
            }
        }

        // Check ghost collisions
        this.ghosts.forEach(ghost => {
            const distance = playerPosition.distanceTo(ghost.mesh.position);
            if (distance < 1) {
                if (this.powerMode) {
                    // Eat ghost
                    this.score += GAME_SETTINGS.GHOST_SCORE;
                    this.resetGhost(ghost);
                } else {
                    // Player dies
                    this.handlePlayerDeath();
                }
            }
        });
    }

    activatePowerMode() {
        this.powerMode = true;
        this.ghosts.forEach(ghost => ghost.setFrightened(true));

        // Power mode duration
        setTimeout(() => {
            this.powerMode = false;
            this.ghosts.forEach(ghost => ghost.setFrightened(false));
        }, 10000); // 10 seconds
    }

    handlePlayerDeath() {
        this.lives--;
        document.getElementById('lives-value').textContent = this.lives;

        if (this.lives <= 0) {
            this.gameOver = true;
            alert('Game Over! Score: ' + this.score);
            return;
        }

        // Reset player position
        this.player.mesh.position.set(0, 0.5, 0);
        this.player.velocity.set(0, 0, 0);

        // Reset ghost positions
        this.ghosts.forEach(ghost => this.resetGhost(ghost));
    }

    resetGhost(ghost) {
        const randomPosition = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            0.5,
            (Math.random() - 0.5) * 10
        );
        ghost.mesh.position.copy(randomPosition);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const deltaTime = 1 / 60; // Fixed time step
        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }
} 