import { COLORS } from '../utils/Constants.js';

export class Maze {
    constructor(layout) {
        this.layout = layout;
        this.mesh = new THREE.Group();
        this.walls = [];
        this.createMaze();
    }

    createMaze() {
        // Create opaque walls with double size
        const wallGeometry = new THREE.BoxGeometry(2, 6, 2); // Double width and depth, taller height
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x2121de, // Back to original blue
            side: THREE.DoubleSide,
            transparent: false, // Make walls opaque
            roughness: 0.8,
            metalness: 0.2
        });

        // Add floor with double size
        const floorSize = Math.max(this.layout[0].length, this.layout.length) * 2; // Double floor size
        const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            side: THREE.DoubleSide,
            roughness: 1.0
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.mesh.add(floor);

        // Create walls with doubled positioning
        const offsetX = -this.layout[0].length;  // Double the offset
        const offsetZ = -this.layout.length;     // Double the offset

        for (let z = 0; z < this.layout.length; z++) {
            for (let x = 0; x < this.layout[z].length; x++) {
                if (this.layout[z][x] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
                    wall.position.set(
                        (x * 2) + offsetX, // Double spacing
                        3,                 // Half of wall height
                        (z * 2) + offsetZ  // Double spacing
                    );

                    this.walls.push(wall);
                    this.mesh.add(wall);
                }
            }
        }
    }

    addWallEdges(position) {
        // Add glowing edges to make walls more visible
        const edgeGeometry = new THREE.BoxGeometry(1.1, 4.1, 1.1);
        const edgeMaterial = new THREE.MeshBasicMaterial({
            color: 0x4444ff,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });

        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.copy(position);
        this.mesh.add(edge);
    }

    addHedgeDetails(position) {
        // Add small leaves or flowers randomly
        if (Math.random() < 0.3) {
            const leafGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const leafMaterial = new THREE.MeshPhongMaterial({
                color: 0x50C878, // Emerald green
                roughness: 1.0
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

            // Random position on the hedge
            leaf.position.set(
                position.x + (Math.random() - 0.5) * 0.5,
                position.y + (Math.random() - 0.5) * 2,
                position.z + (Math.random() - 0.5) * 0.5
            );

            this.mesh.add(leaf);
        }
    }

    checkCollision(position) {
        const COLLISION_THRESHOLD = 1.6; // Increased for larger walls
        let collided = false;

        for (const wall of this.walls) {
            const dx = position.x - wall.position.x;
            const dz = position.z - wall.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < COLLISION_THRESHOLD) {
                const angle = Math.atan2(dz, dx);
                const pushDistance = COLLISION_THRESHOLD - distance;

                position.x += Math.cos(angle) * pushDistance;
                position.z += Math.sin(angle) * pushDistance;
                collided = true;
            }
        }

        // Keep within doubled maze bounds
        const MAZE_BOUNDS = {
            x: this.layout[0].length,
            z: this.layout.length
        };

        position.x = Math.max(-MAZE_BOUNDS.x * 2, Math.min(MAZE_BOUNDS.x * 2, position.x));
        position.z = Math.max(-MAZE_BOUNDS.z * 2, Math.min(MAZE_BOUNDS.z * 2, position.z));

        return collided;
    }
} 