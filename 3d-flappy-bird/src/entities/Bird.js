import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { BIRD_CONFIG, WORLD_CONFIG } from "../constants.js";

export class Bird {
  constructor() {
    this.velocity = 0;
    this.combo = 0;
    this.mesh = this.#createBirdMesh();
    this.reset();
  }

  #createBirdMesh() {
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xff8c42,
      roughness: 0.3,
      metalness: 0.4,
    });

    const wingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x70e0ff,
      roughness: 0.2,
      metalness: 0.2,
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 24), bodyMaterial);
    body.castShadow = true;

    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 1.4, 18),
      new THREE.MeshStandardMaterial({
        color: 0xff4d6d,
        emissive: 0xff4d6d,
        roughness: 0.4,
      })
    );
    beak.rotation.z = Math.PI / 2;
    beak.position.set(1.4, 0, 0.2);

    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x0b1029, emissive: 0x111111 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), eyeMaterial);
    leftEye.position.set(0.65, 0.35, 0.85);

    const rightEye = leftEye.clone();
    rightEye.position.y = -leftEye.position.y;

    const wingGeometry = new THREE.BoxGeometry(0.3, 1.6, 2.6);
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.1, 0.9, 0);
    leftWing.rotation.z = Math.PI / 6;

    const rightWing = leftWing.clone();
    rightWing.rotation.y = Math.PI;
    rightWing.position.y = -leftWing.position.y;

    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x9be7ff, emissive: 0x2b95ff })
    );
    tail.rotation.z = -Math.PI / 2.6;
    tail.position.set(-1.3, 0, -0.4);

    const group = new THREE.Group();
    group.add(body, beak, leftEye, rightEye, leftWing, rightWing, tail);

    this.wings = { leftWing, rightWing };
    return group;
  }

  reset() {
    this.velocity = 0;
    this.combo = 0;
    this.mesh.position.set(-6, 0, 0);
    this.mesh.rotation.set(0, 0, 0);
  }

  flap() {
    this.velocity = Math.min(this.velocity + BIRD_CONFIG.FLAP_STRENGTH, BIRD_CONFIG.MAX_ASCENT);
    this.#animateWings(0.6, -0.4);
  }

  #animateWings(upAngle, downAngle) {
    this.wings.leftWing.rotation.z = THREE.MathUtils.lerp(
      this.wings.leftWing.rotation.z,
      upAngle,
      0.45
    );
    this.wings.rightWing.rotation.z = -this.wings.leftWing.rotation.z;

    setTimeout(() => {
      this.wings.leftWing.rotation.z = THREE.MathUtils.lerp(
        this.wings.leftWing.rotation.z,
        downAngle,
        0.8
      );
      this.wings.rightWing.rotation.z = -this.wings.leftWing.rotation.z;
    }, 120);
  }

  update(delta) {
    this.velocity += BIRD_CONFIG.GRAVITY * delta;
    this.velocity = THREE.MathUtils.clamp(
      this.velocity,
      BIRD_CONFIG.MAX_DESCENT,
      BIRD_CONFIG.MAX_ASCENT
    );

    const nextY = this.mesh.position.y + this.velocity * delta;
    this.mesh.position.y = THREE.MathUtils.clamp(nextY, WORLD_CONFIG.FLOOR_LEVEL + 1.5, WORLD_CONFIG.SKY_LEVEL);

    const tilt = THREE.MathUtils.clamp(this.velocity / 12, -0.7, 0.5);
    this.mesh.rotation.z = THREE.MathUtils.damp(this.mesh.rotation.z, tilt - BIRD_CONFIG.BASE_TILT, 4, delta);
    this.mesh.rotation.x = THREE.MathUtils.damp(this.mesh.rotation.x, tilt * 0.2, 4, delta);
  }
}
