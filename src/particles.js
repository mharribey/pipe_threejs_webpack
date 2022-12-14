import * as THREE from "three";
import { AdditiveBlending } from "three";

const CreateParticles = (number, maxRange, minHeight) => {
  let particles;
  let positions = [];
  let velocities = [];
  const numParticles = number;
  const minRange = maxRange / 2; // x & z avis

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    size: 0.05,
    blending: AdditiveBlending,
    map: new THREE.TextureLoader().load("assets/textures/particle.png"),
    depthTest: false,
    depthWrite: true,
    transparent: true,
    opacity: 0,
  });

  for (var i = 0; i < numParticles; i++) {
    positions.push(
      Math.random() * maxRange - minRange,
      Math.random() * minHeight - 2,
      Math.random() * maxRange - minRange
    );

    velocities.push(0, Math.random() * 0.005, 0);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(velocities, 3)
  );

  particles = new THREE.Points(geometry, material);
  particles.renderOrder = 2;
  return particles;
};

export default CreateParticles;
