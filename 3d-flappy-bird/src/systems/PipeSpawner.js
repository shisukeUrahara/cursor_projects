import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PIPE_CONFIG } from "../constants.js";
import { PipePair } from "../entities/PipePair.js";

const PIPE_COLORS = [0x70e0ff, 0xff4d6d, 0xc77dff, 0xffd166, 0x9be7ff];

export class PipeSpawner {
  constructor(scene) {
    this.scene = scene;
    this.pipes = [];
    this.lastSpawn = 0;
  }

  reset() {
    this.pipes.forEach((pipe) => this.scene.remove(pipe.group));
    this.pipes = [];
    this.lastSpawn = 0;
  }

  update(delta, elapsed, difficultyOffset = 0) {
    this.lastSpawn += delta * 1000;

    if (this.lastSpawn >= PIPE_CONFIG.SPAWN_INTERVAL) {
      this.#spawnPipe(difficultyOffset);
      this.lastSpawn = 0;
    }

    this.pipes.forEach((pipe) => pipe.update(delta));
    this.pipes = this.pipes.filter((pipe) => {
      const offscreen = pipe.isOffscreen();
      if (offscreen) {
        this.scene.remove(pipe.group);
      }
      return !offscreen;
    });
    return this.pipes;
  }

  #spawnPipe(difficultyOffset) {
    const color = PIPE_COLORS[Math.floor(Math.random() * PIPE_COLORS.length)];
    const gapSize = THREE.MathUtils.clamp(
      PIPE_CONFIG.GAP_BASE - difficultyOffset,
      5,
      PIPE_CONFIG.GAP_BASE + PIPE_CONFIG.GAP_VARIATION
    );
    const offset = THREE.MathUtils.randFloatSpread(8);

    const pipe = new PipePair({ gapSize, offset, color });
    pipe.group.position.x = PIPE_CONFIG.SPAWN_DISTANCE;
    pipe.group.position.z = -1;

    this.scene.add(pipe.group);
    this.pipes.push(pipe);
    return pipe;
  }
}
