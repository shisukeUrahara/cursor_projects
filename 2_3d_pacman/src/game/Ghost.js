import { GAME_SETTINGS, COLORS } from '../utils/Constants.js';

export class Ghost {
    constructor(color, startPosition) {
        this.speed = GAME_SETTINGS.GHOST_SPEED;
        this.mesh = this.createMesh(color);
        this.normalColor = color;
        this.frightened = false;
        this.direction = new THREE.Vector3(1, 0, 0);

        if (startPosition) {
            this.mesh.position.copy(startPosition);
        }
    }

    createMesh(color) {
        // Create ghost body
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0.5, 0);
        return mesh;
    }

    setFrightened(isFrightened) {
        this.frightened = isFrightened;
        this.mesh.material.color.setHex(isFrightened ? 0x0000ff : this.normalColor);
    }

    update() {
        // Basic AI movement
        if (Math.random() < 0.02) { // Randomly change direction
            this.direction.set(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }

        // Move ghost
        const speed = this.frightened ? this.speed * 0.5 : this.speed;
        this.mesh.position.add(
            this.direction.clone().multiplyScalar(speed)
        );

        // Keep within bounds
        const MAZE_BOUNDS = 6;
        this.mesh.position.x = Math.max(-MAZE_BOUNDS, Math.min(MAZE_BOUNDS, this.mesh.position.x));
        this.mesh.position.z = Math.max(-MAZE_BOUNDS, Math.min(MAZE_BOUNDS, this.mesh.position.z));

        // Floating animation
        this.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.1;
    }
} 