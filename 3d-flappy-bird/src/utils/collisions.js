import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export const intersectsAny = (object, boxes) => {
  const birdBox = new THREE.Box3().setFromObject(object);
  return boxes.some((box) => birdBox.intersectsBox(box));
};
