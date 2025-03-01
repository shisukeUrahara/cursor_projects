class FlappyBird3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.bird = null;
        this.pipes = [];
        this.score = 0;

        // Use values closer to flappy3d.html
        this.speed = 0.05;
        this.gravity = -0.02 * 0.6; // Adjusted from flappy3d.html for better feel
        this.jumpForce = 0.5 * 0.6; // Adjusted from flappy3d.html for better feel

        this.birdVelocity = 0;
        this.gameRunning = false;
        this.passedPipes = new Set();
        this.pipeSpawnInterval = 2000; // milliseconds
        this.pipeSpawnRate = 0.005; // Reduced spawn rate for better spacing
        this.minPipeDistance = 15; // Increased minimum distance between pipes
        this.lastPipePosition = 0; // Track the last pipe's position
        this.lastPipeTime = 0;
        this.clock = new THREE.Clock();
        this.highScoreManager = new HighScoreManager();

        // Game boundaries
        this.bounds = {
            minY: -10, // Lower boundary like in flappy3d.html
            maxY: 10,  // Higher boundary like in flappy3d.html
            pipeGap: 6  // Increased gap size for easier passage
        };

        this.characterManager = new CharacterManager();
        this.characterType = 'bird'; // Default character

        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10; // Position like in flappy3d.html

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 5);
        this.scene.add(directionalLight);

        // Create bird
        this.createBird();

        // Create ground
        this.createGround();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    createBird() {
        // Remove any existing bird
        if (this.bird) {
            this.scene.remove(this.bird);
        }

        // Get the selected character model
        this.bird = this.characterManager.getCharacterModel(this.characterType);
        this.bird.position.set(-5, 0, 0);
        this.scene.add(this.bird);
    }

    createGround() {
        // No visible ground in flappy3d.html, but we'll keep a reference plane
        const geometry = new THREE.BoxGeometry(50, 1, 10);
        const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
        const ground = new THREE.Mesh(geometry, material);
        ground.position.y = -10.5; // Just below the lower boundary
        this.scene.add(ground);
    }

    createPipe() {
        // Use the pipe creation logic from flappy3d.html with modifications
        const gap = this.bounds.pipeGap;

        // Limit the height range to ensure the gap is always passable
        // Ensure the gap is never too close to the top or bottom boundaries
        const minHeight = -4; // Minimum height for the gap center
        const maxHeight = 4;  // Maximum height for the gap center
        const height = Math.random() * (maxHeight - minHeight) + minHeight;

        // Create top pipe
        const topPipeGeometry = new THREE.BoxGeometry(1, 20, 1);
        const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0x00CC00 }); // Green
        const topPipe = new THREE.Mesh(topPipeGeometry, pipeMaterial);
        topPipe.position.set(10, height + gap / 2 + 10, 0);

        // Create bottom pipe
        const bottomPipeGeometry = new THREE.BoxGeometry(1, 20, 1);
        const bottomPipe = new THREE.Mesh(bottomPipeGeometry, pipeMaterial);
        bottomPipe.position.set(10, height - gap / 2 - 10, 0);

        // Group pipes together
        const pipeGroup = new THREE.Group();
        pipeGroup.add(topPipe);
        pipeGroup.add(bottomPipe);
        pipeGroup.userData = { passed: false, id: Date.now() };

        this.scene.add(pipeGroup);
        this.pipes.push(pipeGroup);

        // Update last pipe position
        this.lastPipePosition = 10;
    }

    jump() {
        if (this.gameRunning) {
            this.birdVelocity = this.jumpForce;
        }
    }

    startGame() {
        this.resetGame();
        this.gameRunning = true;
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('score-display').classList.remove('hidden');

        // Add event listener for jump
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.jump();
            }
        });

        // Also allow touch/click to jump
        window.addEventListener('mousedown', () => this.jump());
        window.addEventListener('touchstart', () => this.jump());
    }

    resetGame() {
        // Reset bird position
        this.bird.position.set(-5, 0, 0);
        this.bird.rotation.set(0, 0, 0);
        this.birdVelocity = 0;

        // Remove all pipes
        for (const pipe of this.pipes) {
            this.scene.remove(pipe);
        }
        this.pipes = [];

        // Reset score
        this.score = 0;
        this.passedPipes = new Set();
        document.getElementById('score').textContent = this.score;

        // Reset time
        this.lastPipeTime = 0;
        this.clock.start();
    }

    gameOver() {
        this.gameRunning = false;

        // Show game over screen
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;

        // Check if it's a high score
        if (this.highScoreManager.isHighScore(this.score)) {
            document.getElementById('high-score-input').classList.remove('hidden');
        } else {
            document.getElementById('high-score-input').classList.add('hidden');
        }

        // Display high scores
        this.highScoreManager.displayHighScores();
    }

    update() {
        if (!this.gameRunning) return;

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime() * 1000; // Convert to milliseconds

        // Apply gravity to bird
        this.birdVelocity += this.gravity;
        this.bird.position.y += this.birdVelocity;

        // Rotate bird based on velocity - all characters are birds now
        this.bird.rotation.z = THREE.MathUtils.clamp(
            -this.birdVelocity * 2,
            -Math.PI / 4,
            Math.PI / 4
        );

        // Check if bird hits the boundaries (ground or sky)
        if (this.bird.position.y < this.bounds.minY || this.bird.position.y > this.bounds.maxY) {
            this.gameOver();
            return;
        }

        // Improved pipe spawning with better spacing
        const shouldSpawnPipe = Math.random() < this.pipeSpawnRate;
        const noRecentPipes = this.pipes.length === 0 ||
            (this.pipes.length > 0 &&
                this.pipes[this.pipes.length - 1].position.x < 10 - this.minPipeDistance);

        if (shouldSpawnPipe && noRecentPipes) {
            this.createPipe();
        }

        // Move pipes and check collisions
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.position.x -= this.speed;

            // Check if pipe is passed - only count when bird passes through the gap
            if (pipe.position.x + 0.5 < this.bird.position.x - 0.5 && !this.passedPipes.has(pipe.userData.id)) {
                // Check if bird is within the gap height
                const topPipe = pipe.children[0];
                const bottomPipe = pipe.children[1];
                const gapTop = topPipe.position.y - 10; // Bottom of top pipe
                const gapBottom = bottomPipe.position.y + 10; // Top of bottom pipe

                if (this.bird.position.y < gapTop && this.bird.position.y > gapBottom) {
                    // Bird passed through the gap
                    this.passedPipes.add(pipe.userData.id);
                    this.score++;
                    document.getElementById('score').textContent = this.score;
                }
            }

            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }

            // Remove pipes that are out of view
            if (pipe.position.x < -15) {
                this.scene.remove(pipe);
                this.pipes.splice(i, 1);
            }
        }
    }

    checkCollision(pipe) {
        // Create a precise collision box for the bird
        const birdGeometry = this.bird.geometry;
        const birdPosition = this.bird.position.clone();

        // Get bird dimensions (accounting for scale)
        const birdSize = {
            x: 1 * this.bird.scale.x,
            y: 1 * this.bird.scale.y,
            z: 1 * this.bird.scale.z
        };

        // Create a custom bird collision box that's slightly smaller than the actual bird
        const birdBox = new THREE.Box3();
        birdBox.min.set(
            birdPosition.x - birdSize.x * 0.4,
            birdPosition.y - birdSize.y * 0.4,
            birdPosition.z - birdSize.z * 0.4
        );
        birdBox.max.set(
            birdPosition.x + birdSize.x * 0.4,
            birdPosition.y + birdSize.y * 0.4,
            birdPosition.z + birdSize.z * 0.4
        );

        // Check collision with each pipe
        for (let i = 0; i < pipe.children.length; i++) {
            const pipeChild = pipe.children[i];

            // Get pipe dimensions
            const pipeSize = {
                x: 1, // Width of pipe
                y: 20, // Height of pipe
                z: 1  // Depth of pipe
            };

            // Get pipe position in world space
            const pipePosition = new THREE.Vector3();
            pipePosition.copy(pipeChild.position);
            pipePosition.add(pipe.position);

            // Create a custom pipe collision box
            const pipeBox = new THREE.Box3();
            pipeBox.min.set(
                pipePosition.x - pipeSize.x * 0.45,
                pipePosition.y - pipeSize.y * 0.5,
                pipePosition.z - pipeSize.z * 0.45
            );
            pipeBox.max.set(
                pipePosition.x + pipeSize.x * 0.45,
                pipePosition.y + pipeSize.y * 0.5,
                pipePosition.z + pipeSize.z * 0.45
            );

            // Check if the boxes intersect
            if (birdBox.intersectsBox(pipeBox)) {
                return true;
            }
        }

        return false;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    // Add a method to set the character
    setCharacter(type) {
        this.characterType = type;
        this.createBird();
    }
} 