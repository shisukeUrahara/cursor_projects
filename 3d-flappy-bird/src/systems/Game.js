import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { Bird } from "../entities/Bird.js";
import { PipeSpawner } from "./PipeSpawner.js";
import { ScoreManager } from "./ScoreManager.js";
import { SoundManager } from "./SoundManager.js";
import { intersectsAny } from "../utils/collisions.js";
import { GAME_MODES, GAME_STATES, WORLD_CONFIG } from "../constants.js";

export class Game {
  constructor({ canvasContainer, overlayController, soundToggle }) {
    this.canvasContainer = canvasContainer;
    this.overlayController = overlayController;
    this.soundToggle = soundToggle;
    this.state = GAME_STATES.IDLE;
    this.mode = GAME_MODES.CLASSIC;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    this.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    this.renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(
      WORLD_CONFIG.FOV,
      canvasContainer.clientWidth / canvasContainer.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(-WORLD_CONFIG.CAMERA_DISTANCE, 5, 18);
    this.camera.lookAt(new THREE.Vector3(4, 0, 0));

    canvasContainer.appendChild(this.renderer.domElement);

    this.bird = new Bird();
    this.scene.add(this.bird.mesh);

    this.pipeSpawner = new PipeSpawner(this.scene);
    this.scoreManager = new ScoreManager({
      onScoreChange: (score) => overlayController.updateScore(score),
      onBestScoreChange: (best) => overlayController.updateBestScore(best),
      onCombo: (combo, multiplier) => overlayController.showCombo(combo, multiplier),
    });
    this.soundManager = new SoundManager();

    this.#buildEnvironment();
    this.#bindEvents();

    this.loop = this.loop.bind(this);
    this.renderer.setAnimationLoop(this.loop);

    this.soundToggle.textContent = this.soundManager.enabled ? "🔊" : "🔇";
  }

  #bindEvents() {
    window.addEventListener("resize", () => this.#handleResize());
    this.soundToggle.addEventListener("click", () => {
      const enabled = this.soundManager.toggle();
      this.soundToggle.textContent = enabled ? "🔊" : "🔇";
    });
  }

  #handleResize() {
    const { clientWidth, clientHeight } = this.canvasContainer;
    this.renderer.setSize(clientWidth, clientHeight);
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
  }

  #buildEnvironment() {
    const hemisphere = new THREE.HemisphereLight(0x70e0ff, 0x0b1029, 0.7);
    this.scene.add(hemisphere);

    const spotlight = new THREE.SpotLight(0xffd166, 1.4, 120, Math.PI / 5, 0.4, 1.2);
    spotlight.position.set(-18, 22, 24);
    spotlight.castShadow = true;
    this.scene.add(spotlight);

    const ambientParticles = this.#createParticleField();
    this.scene.add(ambientParticles);

    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x18214f,
      emissive: 0x0b1029,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = WORLD_CONFIG.FLOOR_LEVEL - 0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const skyline = this.#createSkyline();
    this.scene.add(skyline);
  }

  #createSkyline() {
    const group = new THREE.Group();
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a274a,
      emissive: 0x122042,
      emissiveIntensity: 0.6,
      roughness: 0.7,
    });

    for (let i = 0; i < 24; i += 1) {
      const height = THREE.MathUtils.randFloat(6, 16);
      const geometry = new THREE.BoxGeometry(THREE.MathUtils.randFloat(2, 4), height, THREE.MathUtils.randFloat(2, 5));
      const mesh = new THREE.Mesh(geometry, buildingMaterial.clone());
      mesh.position.set(THREE.MathUtils.randFloatSpread(80), height / 2 - 6, -THREE.MathUtils.randFloat(24, 48));
      mesh.material.emissive = new THREE.Color(
        0.4 + Math.random() * 0.2,
        0.4 + Math.random() * 0.25,
        0.7 + Math.random() * 0.25
      );
      mesh.material.color = mesh.material.emissive.clone().multiplyScalar(0.3);
      group.add(mesh);
    }
    return group;
  }

  #createParticleField() {
    const particleCount = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(80);
      positions[i * 3 + 1] = THREE.MathUtils.randFloat(-2, 18);
      positions[i * 3 + 2] = THREE.MathUtils.randFloat(-32, 12);
      sizes[i] = Math.random() * 0.6 + 0.3;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0x9be7ff,
      size: 0.32,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.position.z = -10;
    this.particleField = points;
    return points;
  }

  start(mode = GAME_MODES.CLASSIC) {
    if (this.state === GAME_STATES.RUNNING) {
      return;
    }

    this.mode = mode;
    this.state = GAME_STATES.RUNNING;
    this.overlayController.hideOverlay();
    this.scoreManager.reset();
    this.bird.reset();
    this.pipeSpawner.reset();
    this.clock.start();
  }

  togglePause() {
    if (this.state === GAME_STATES.RUNNING) {
      this.state = GAME_STATES.PAUSED;
      this.overlayController.handleStateChange(this.state);
      this.clock.stop();
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.RUNNING;
      this.overlayController.handleStateChange(this.state);
      this.clock.start();
    }
  }

  flap() {
    if (this.state !== GAME_STATES.RUNNING) {
      return;
    }
    this.bird.flap();
    this.soundManager.play("flap");
  }

  #handleGameOver() {
    this.state = GAME_STATES.GAME_OVER;
    this.overlayController.handleStateChange(this.state);
    this.soundManager.play("hit");
  }

  loop() {
    const delta = this.clock.getDelta();
    if (this.state === GAME_STATES.RUNNING) {
      this.#updateGame(delta);
    }
    this.#updateSky(delta);
    this.renderer.render(this.scene, this.camera);
  }

  #updateSky(delta) {
    if (this.particleField) {
      this.particleField.rotation.y += delta * 0.08;
    }
  }

  #updateGame(delta) {
    this.bird.update(delta);
    const isPractice = this.mode === GAME_MODES.PRACTICE;
    const difficultyOffset = isPractice
      ? 0
      : THREE.MathUtils.clamp(this.scoreManager.score / 12, 0, 3.2);
    const pipes = this.pipeSpawner.update(delta, this.clock.elapsedTime, difficultyOffset);

    pipes.forEach((pipe) => {
      if (!pipe.scored && pipe.group.position.x < this.bird.mesh.position.x) {
        const cleanPass = Math.abs(pipe.offset - this.bird.mesh.position.y) < pipe.gapSize * 0.3;
        this.scoreManager.addPoint({ cleanPass, trackHighScore: !isPractice });
        pipe.scored = true;
        this.soundManager.play("score");
      }
    });

    if (!isPractice) {
      const collisions = pipes.flatMap((pipe) => pipe.getBoundingBoxes());
      if (intersectsAny(this.bird.mesh, collisions)) {
        this.#handleGameOver();
      }
    }
  }
}
