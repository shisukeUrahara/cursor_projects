import { GAME_SETTINGS } from '../utils/Constants.js';

const DIRECTIONS = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1)
];

export class Ghost {
    constructor(color, startPosition) {
        this.baseSpeed = GAME_SETTINGS.GHOST_SPEED;
        this.mesh = this.#createMesh(color);
        this.normalColor = new THREE.Color(color);
        this.frightened = false;
        this.direction = new THREE.Vector3(1, 0, 0);
        this.turnCooldown = 0;
        this.phase = Math.random() * Math.PI * 2;
        this.tempVector = new THREE.Vector3();

        if (startPosition) {
            this.mesh.position.copy(startPosition);
        }
    }

    #createMesh(color) {
        const geometry = new THREE.CapsuleGeometry(0.45, 0.4, 6, 12);
        const material = new THREE.MeshLambertMaterial({
            color,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0.5, 0);
        return mesh;
    }

    setFrightened(isFrightened) {
        this.frightened = isFrightened;
        if (isFrightened) {
            this.mesh.material.color.setHex(0x2a4bff);
        } else {
            this.mesh.material.color.copy(this.normalColor);
        }
    }

    setPosition(position) {
        this.mesh.position.copy(position);
    }

    reset(position) {
        this.setPosition(position);
        this.direction.set(1, 0, 0);
        this.turnCooldown = 0;
        this.phase = Math.random() * Math.PI * 2;
        this.setFrightened(false);
    }

    update(deltaTime, maze) {
        this.turnCooldown = Math.max(0, this.turnCooldown - deltaTime);

        const speed = (this.frightened ? this.baseSpeed * 0.6 : this.baseSpeed) * deltaTime;

        if (this.turnCooldown <= 0 || Math.random() < 0.01) {
            this.#chooseDirection(maze);
            this.turnCooldown = 0.35;
        }

        const nextPosition = this.tempVector.copy(this.mesh.position).addScaledVector(this.direction, speed);
        if (maze.isWallAt(nextPosition, 0.38)) {
            this.#chooseDirection(maze, true);
        } else {
            this.mesh.position.copy(nextPosition);
        }

        const bounds = maze.getBounds();
        this.mesh.position.x = Math.min(bounds.maxX - 0.4, Math.max(bounds.minX + 0.4, this.mesh.position.x));
        this.mesh.position.z = Math.min(bounds.maxZ - 0.4, Math.max(bounds.minZ + 0.4, this.mesh.position.z));

        const time = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        this.mesh.position.y = 0.5 + Math.sin(time * 0.001 + this.phase) * 0.1;
    }

    #chooseDirection(maze, force = false) {
        const options = [];
        for (const dir of DIRECTIONS) {
            if (!force && dir.dot(this.direction) < -0.9) {
                // Avoid reversing direction unless forced
                continue;
            }

            const checkPosition = this.tempVector.copy(this.mesh.position)
                .addScaledVector(dir, maze.cellSize * 0.6);
            if (!maze.isWallAt(checkPosition, 0.35)) {
                options.push(dir);
            }
        }

        if (options.length === 0) {
            options.push(...DIRECTIONS);
        }

        const choice = options[Math.floor(Math.random() * options.length)];
        this.direction.copy(choice);
    }
}