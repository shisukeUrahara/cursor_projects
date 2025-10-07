import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PIPE_CONFIG, WORLD_CONFIG } from "../constants.js";

export class PipePair {
  constructor({ gapSize, offset, color }) {
    this.group = new THREE.Group();
    this.scored = false;
    this.gapSize = gapSize;
    this.offset = offset;
    this.color = color;
    this.#createPipes();
  }

  #createPipes() {
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.4,
      metalness: 0.2,
      roughness: 0.4,
    });

    const radius = 1.8;
    const height = WORLD_CONFIG.SKY_LEVEL * 2;

    const topGeometry = new THREE.CylinderGeometry(radius, radius, height, 16, 1, true);
    const bottomGeometry = topGeometry.clone();

    const topPipe = new THREE.Mesh(topGeometry, pipeMaterial);
    const bottomPipe = new THREE.Mesh(bottomGeometry, pipeMaterial);

    const capGeometry = new THREE.TorusGeometry(radius + 0.4, 0.35, 12, 48);
    const topCap = new THREE.Mesh(capGeometry, pipeMaterial);
    const bottomCap = new THREE.Mesh(capGeometry, pipeMaterial);
    topCap.rotation.x = Math.PI / 2;
    bottomCap.rotation.x = Math.PI / 2;

    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();

    this.topGroup.add(topPipe, topCap);
    this.bottomGroup.add(bottomPipe, bottomCap);

    this.group.add(this.topGroup, this.bottomGroup);
    this.#updatePositions();
  }

  #updatePositions() {
    const halfGap = this.gapSize / 2;
    this.topGroup.position.y = this.offset + halfGap + WORLD_CONFIG.SKY_LEVEL;
    this.bottomGroup.position.y = this.offset - halfGap - WORLD_CONFIG.SKY_LEVEL;
  }

  update(delta) {
    this.group.position.x -= PIPE_CONFIG.SPEED * delta;
  }

  isOffscreen() {
    return this.group.position.x < -PIPE_CONFIG.SPAWN_DISTANCE * 1.2;
  }

  setGapSize(gap) {
    this.gapSize = gap;
    this.#updatePositions();
  }

  setOffset(offset) {
    this.offset = offset;
    this.#updatePositions();
  }

  getBoundingBoxes() {
    const boundingBoxes = [];
    this.topGroup.children.forEach((child) => {
      child.updateMatrixWorld();
      const box = new THREE.Box3().setFromObject(child);
      boundingBoxes.push(box);
    });
    this.bottomGroup.children.forEach((child) => {
      child.updateMatrixWorld();
      const box = new THREE.Box3().setFromObject(child);
      boundingBoxes.push(box);
    });
    return boundingBoxes;
  }
}
