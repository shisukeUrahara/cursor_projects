import { COLORS, GAME_SETTINGS } from '../utils/Constants.js';

const CELL_SIZE = 2;
const WALL_SIZE = 1.6;
const WALL_HALF = WALL_SIZE * 0.5;
const WALL_HEIGHT = 3.2;

export class Maze {
    constructor(layout) {
        this.layout = layout;
        this.cellSize = CELL_SIZE;
        this.wallHalfSize = WALL_HALF;

        this.mesh = new THREE.Group();
        this.wallPositions = [];
        this.openCells = [];

        this.offsetX = -((layout[0].length * CELL_SIZE) / 2) + CELL_SIZE / 2;
        this.offsetZ = -((layout.length * CELL_SIZE) / 2) + CELL_SIZE / 2;

        this.bounds = {
            minX: this.offsetX - CELL_SIZE / 2,
            maxX: this.offsetX + (layout[0].length - 1) * CELL_SIZE + CELL_SIZE / 2,
            minZ: this.offsetZ - CELL_SIZE / 2,
            maxZ: this.offsetZ + (layout.length - 1) * CELL_SIZE + CELL_SIZE / 2
        };

        this.#createFloor();
        this.#createWalls();
    }

    #createFloor() {
        const floorWidth = this.layout[0].length * CELL_SIZE;
        const floorDepth = this.layout.length * CELL_SIZE;
        const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth, 1, 1);
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0x161616
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = false;
        this.mesh.add(floor);
    }

    #createWalls() {
        const wallGeometry = new THREE.BoxGeometry(WALL_SIZE, WALL_HEIGHT, WALL_SIZE);
        wallGeometry.computeBoundingSphere();
        const wallMaterial = new THREE.MeshLambertMaterial({
            color: COLORS.MAZE
        });

        let wallCount = 0;
        for (let z = 0; z < this.layout.length; z++) {
            for (let x = 0; x < this.layout[z].length; x++) {
                if (this.layout[z][x] === 1) {
                    wallCount++;
                } else {
                    this.openCells.push({ x, z });
                }
            }
        }

        if (wallCount === 0) {
            return;
        }

        const instancedMesh = new THREE.InstancedMesh(wallGeometry, wallMaterial, wallCount);
        instancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3(1, 1, 1);

        let index = 0;
        for (let z = 0; z < this.layout.length; z++) {
            for (let x = 0; x < this.layout[z].length; x++) {
                if (this.layout[z][x] !== 1) {
                    continue;
                }

                position.copy(this.gridToWorld(x, z));
                position.y = WALL_HEIGHT / 2;

                matrix.compose(position, rotation, scale);
                instancedMesh.setMatrixAt(index, matrix);
                this.wallPositions.push(position.clone());
                index++;
            }
        }

        instancedMesh.instanceMatrix.needsUpdate = true;
        this.mesh.add(instancedMesh);
        this.walls = instancedMesh;
    }

    gridToWorld(x, z) {
        const worldX = this.offsetX + x * CELL_SIZE;
        const worldZ = this.offsetZ + z * CELL_SIZE;
        return new THREE.Vector3(worldX, 0, worldZ);
    }

    worldToGrid(position) {
        const gridX = Math.round((position.x - this.offsetX) / CELL_SIZE);
        const gridZ = Math.round((position.z - this.offsetZ) / CELL_SIZE);
        return { x: gridX, z: gridZ };
    }

    resolveCollision(position) {
        const radius = GAME_SETTINGS.PLAYER_RADIUS;
        let collided = false;

        for (const wallPosition of this.wallPositions) {
            const dx = position.x - wallPosition.x;
            const dz = position.z - wallPosition.z;

            if (Math.abs(dx) >= this.wallHalfSize + radius || Math.abs(dz) >= this.wallHalfSize + radius) {
                continue;
            }

            const overlapX = this.wallHalfSize + radius - Math.abs(dx);
            const overlapZ = this.wallHalfSize + radius - Math.abs(dz);

            if (overlapX < overlapZ) {
                const signX = dx >= 0 ? 1 : -1;
                position.x += signX * overlapX;
            } else {
                const signZ = dz >= 0 ? 1 : -1;
                position.z += signZ * overlapZ;
            }
            collided = true;
        }

        position.x = Math.min(this.bounds.maxX - radius, Math.max(this.bounds.minX + radius, position.x));
        position.z = Math.min(this.bounds.maxZ - radius, Math.max(this.bounds.minZ + radius, position.z));

        return collided;
    }

    isWallAt(position, radius = GAME_SETTINGS.PLAYER_RADIUS * 0.9) {
        for (const wallPosition of this.wallPositions) {
            const dx = position.x - wallPosition.x;
            const dz = position.z - wallPosition.z;
            if (Math.abs(dx) < this.wallHalfSize + radius && Math.abs(dz) < this.wallHalfSize + radius) {
                return true;
            }
        }
        return false;
    }

    getRandomOpenPosition() {
        if (this.openCells.length === 0) {
            return new THREE.Vector3(0, 0, 0);
        }

        const cell = this.openCells[Math.floor(Math.random() * this.openCells.length)];
        const position = this.gridToWorld(cell.x, cell.z);
        position.y = 0.5;
        return position;
    }

    getBounds() {
        return this.bounds;
    }
}