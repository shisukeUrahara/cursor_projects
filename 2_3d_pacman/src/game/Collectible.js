import { COLORS } from '../utils/Constants.js';

export class Collectible {
    constructor(type, position) {
        this.type = type; // 'pellet' or 'powerPellet'
        this.mesh = this.createMesh(type);
        if (position) {
            this.mesh.position.copy(position);
        }
    }

    createMesh(type) {
        const geometry = type === 'powerPellet'
            ? new THREE.SphereGeometry(0.2, 16, 16)
            : new THREE.SphereGeometry(0.1, 8, 8);

        const material = new THREE.MeshPhongMaterial({
            color: type === 'powerPellet' ? COLORS.POWER_PELLET : COLORS.PELLET,
            emissive: type === 'powerPellet' ? COLORS.POWER_PELLET : COLORS.PELLET,
            emissiveIntensity: 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.5;
        return mesh;
    }

    update() {
        // Rotate and bob up and down
        this.mesh.rotation.y += 0.02;
        this.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.1;
    }
} 