import { COLORS } from '../utils/Constants.js';

const TEMP_MATRIX = new THREE.Matrix4();
const TEMP_POSITION = new THREE.Vector3();
const TEMP_SCALE = new THREE.Vector3();
const IDENTITY_QUATERNION = new THREE.Quaternion();
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);
const HIDDEN_SCALE = new THREE.Vector3(0.0001, 0.0001, 0.0001);

export class CollectibleManager {
    constructor(layout, maze) {
        this.layout = layout;
        this.maze = maze;
        this.time = 0;

        this.pelletData = [];
        this.powerPelletData = [];

        this.pelletMesh = null;
        this.powerPelletMesh = null;
        this.remainingPelletCount = 0;
        this.remainingPowerCount = 0;

        this.#createCollectibles();
    }

    addToScene(scene) {
        if (this.pelletMesh) {
            scene.add(this.pelletMesh);
        }
        if (this.powerPelletMesh) {
            scene.add(this.powerPelletMesh);
        }
    }

    update(deltaTime) {
        this.time += deltaTime;
        const pelletNeedsUpdate = this.#updatePelletInstances(this.pelletData, this.pelletMesh, 3.0);
        const powerNeedsUpdate = this.#updatePelletInstances(this.powerPelletData, this.powerPelletMesh, 2.0, 1.2);

        if (pelletNeedsUpdate && this.pelletMesh) {
            this.pelletMesh.instanceMatrix.needsUpdate = true;
        }
        if (powerNeedsUpdate && this.powerPelletMesh) {
            this.powerPelletMesh.instanceMatrix.needsUpdate = true;
        }
    }

    collectAt(position) {
        const powerPellet = this.#collectFromList(this.powerPelletData, this.powerPelletMesh, position, 0.55, 'power');
        if (powerPellet) {
            return { type: 'powerPellet' };
        }

        const pellet = this.#collectFromList(this.pelletData, this.pelletMesh, position, 0.45, 'pellet');
        if (pellet) {
            return { type: 'pellet' };
        }

        return null;
    }

    getRemainingCount() {
        return this.remainingPelletCount + this.remainingPowerCount;
    }

    #createCollectibles() {
        const pelletGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const pelletMaterial = new THREE.MeshLambertMaterial({
            color: COLORS.PELLET,
            emissive: COLORS.PELLET,
            emissiveIntensity: 0.35
        });

        const powerGeometry = new THREE.SphereGeometry(0.22, 12, 12);
        const powerMaterial = new THREE.MeshLambertMaterial({
            color: COLORS.POWER_PELLET,
            emissive: COLORS.POWER_PELLET,
            emissiveIntensity: 0.6
        });

        let pelletCount = 0;
        let powerCount = 0;

        for (let z = 0; z < this.layout.length; z++) {
            for (let x = 0; x < this.layout[z].length; x++) {
                if (this.layout[z][x] === 0) {
                    pelletCount++;
                } else if (this.layout[z][x] === 2) {
                    powerCount++;
                }
            }
        }

        this.remainingPelletCount = pelletCount;
        this.remainingPowerCount = powerCount;

        if (pelletCount > 0) {
            this.pelletMesh = new THREE.InstancedMesh(pelletGeometry, pelletMaterial, pelletCount);
            this.pelletMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        }

        if (powerCount > 0) {
            this.powerPelletMesh = new THREE.InstancedMesh(powerGeometry, powerMaterial, powerCount);
            this.powerPelletMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        }

        let pelletIndex = 0;
        let powerIndex = 0;

        for (let z = 0; z < this.layout.length; z++) {
            for (let x = 0; x < this.layout[z].length; x++) {
                const cell = this.layout[z][x];
                if (cell === 0 || cell === 2) {
                    const position = this.maze.gridToWorld(x, z);
                    position.y = cell === 2 ? 0.5 : 0.45;
                    const phase = Math.random() * Math.PI * 2;

                    if (cell === 0 && this.pelletMesh) {
                        this.pelletData.push({ index: pelletIndex, position, phase, active: true });
                        TEMP_MATRIX.compose(position, IDENTITY_QUATERNION, UNIT_SCALE);
                        this.pelletMesh.setMatrixAt(pelletIndex, TEMP_MATRIX);
                        pelletIndex++;
                    } else if (cell === 2 && this.powerPelletMesh) {
                        this.powerPelletData.push({ index: powerIndex, position, phase, active: true });
                        TEMP_MATRIX.compose(position, IDENTITY_QUATERNION, UNIT_SCALE);
                        this.powerPelletMesh.setMatrixAt(powerIndex, TEMP_MATRIX);
                        powerIndex++;
                    }
                }
            }
        }

        if (this.pelletMesh) {
            this.pelletMesh.instanceMatrix.needsUpdate = true;
            this.pelletMesh.frustumCulled = true;
            this.pelletMesh.geometry.computeBoundingSphere();
        }

        if (this.powerPelletMesh) {
            this.powerPelletMesh.instanceMatrix.needsUpdate = true;
            this.powerPelletMesh.frustumCulled = true;
            this.powerPelletMesh.geometry.computeBoundingSphere();
        }
    }

    #updatePelletInstances(list, mesh, bobSpeed, scalePulse = 1) {
        if (!mesh || list.length === 0) {
            return false;
        }

        let updated = false;
        for (const pellet of list) {
            if (!pellet.active) {
                continue;
            }

            const bob = Math.sin(this.time * bobSpeed + pellet.phase) * 0.05;
            TEMP_POSITION.copy(pellet.position);
            TEMP_POSITION.y += bob;

            let scale = UNIT_SCALE;
            if (scalePulse !== 1) {
                const pulse = 1 + Math.sin(this.time * bobSpeed * 0.5 + pellet.phase) * 0.2;
                TEMP_SCALE.setScalar(pulse * scalePulse);
                scale = TEMP_SCALE;
            }

            TEMP_MATRIX.compose(TEMP_POSITION, IDENTITY_QUATERNION, scale);
            mesh.setMatrixAt(pellet.index, TEMP_MATRIX);
            updated = true;
        }

        return updated;
    }

    #collectFromList(list, mesh, position, threshold, type) {
        if (!mesh || list.length === 0) {
            return null;
        }

        const thresholdSq = threshold * threshold;
        for (const pellet of list) {
            if (!pellet.active) {
                continue;
            }

            if (position.distanceToSquared(pellet.position) <= thresholdSq) {
                pellet.active = false;
                if (type === 'pellet') {
                    this.remainingPelletCount = Math.max(0, this.remainingPelletCount - 1);
                } else if (type === 'power') {
                    this.remainingPowerCount = Math.max(0, this.remainingPowerCount - 1);
                }
                TEMP_MATRIX.compose(pellet.position, IDENTITY_QUATERNION, HIDDEN_SCALE);
                mesh.setMatrixAt(pellet.index, TEMP_MATRIX);
                mesh.instanceMatrix.needsUpdate = true;
                return pellet;
            }
        }

        return null;
    }
}
