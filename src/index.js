// IMPORTS

import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { Perlin } from "three-noise";
import OrbitControls from "threejs-orbit-controls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";

import Delay from "./delay";


// HELPERS
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
const rgbeLoader = new RGBELoader()

rgbeLoader.load("assets/textures/envmap/ENVMAP_midday.hdr", (data) => {
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()
  scene.environment = pmrem.fromEquirectangular(data).texture
})

dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.3.6/"
);
loader.setDRACOLoader(dracoLoader);

const modelLoader = (url) => {
  return new Promise((resolve, reject) => {
    loader.load(url, (data) => resolve(data), null, reject);
  });
};

// VARIABLES

let mixer, clock;
clock = new THREE.Clock();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.z = 10; // default 10
camera.position.y = 3;

const near = 1;
const far = 50;
const color = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(color, near, far);

const renderer = new THREE.WebGLRenderer();

renderer.antialias = true;
renderer.setClearColor(0x000033, 0);
renderer.sortObjects = false;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = false; // enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optimized shadow map setting
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
controls.enableZoom = true;
controls.enablePan = false;
controls.rotateSpeed = 0.5;
controls.maxDistance = 1500;
controls.minDistance = 0;

// MODELS

async function loadModels() {
  const obj = await modelLoader(
    "assets/models/obj.gltf"
  );

  mixer = new THREE.AnimationMixer(obj.scene);
  obj.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  obj.scene.traverse(function (el) {
    if (el.type == "Mesh") {
      el.castShadow = true; //default is false
      el.material.envMapIntensity = 1;
    }
  });

  const shadowPlane = new THREE.PlaneGeometry(100, 100);
  const shadowMaterial = new THREE.ShadowMaterial();
  shadowMaterial.opacity = 0.1;

  const shadowMesh = new THREE.Mesh(shadowPlane, shadowMaterial);
  shadowMesh.name = "shadowMesh";
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -15;
  shadowMesh.receiveShadow = true;

  //////////////////

  obj.scene.add(shadowMesh);
  scene.add(obj.scene);

  await Delay(1000);
  fadeEffect(obj.scene, 2, 1);

  window.scene = scene;
}

// LIGHTS

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(2, 1, 1);
dirLight.castShadow = true;
//Set up shadow properties for the light
dirLight.shadow.mapSize.width = 1024; // default
dirLight.shadow.mapSize.height = 1024; // default
dirLight.shadow.camera.near = 0.5; // default
dirLight.shadow.camera.far = 500; // default
scene.add(dirLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// POST EFFECTS IF NEEDED

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomEffect = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.1,
  0,
  0.8
);
const ssaoPass = new SSAOPass(
  scene,
  camera,
  window.innerWidth,
  window.innerHeight
);
const filmEffect = new FilmPass(0.5, 0.5, 1, 0);

/* 
ssaoPass.kernelRadius = 51;
ssaoPass.minDistance = 0.012
ssaoPass.maxDistance = 1

composer.addPass(bloomEffect)
composer.addPass(ssaoPass)
composer.addPass(filmEffect)
*/

const animate = () => {
  composer.render();

  controls.update();

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  requestAnimationFrame(animate);
};
animate();

const lerp = (a, b, n) => {
  return (1 - n) * a + n * b;
};

const fadeEffect = (el, duration, finalOpacity) => {
  const progress = { value: 0 };

  gsap.to(progress, {
    duration: duration,
    value: 1,
    onUpdate: () => {
      el.traverse(function (node) {
        if (node.isMesh && node.name !== "shadowMesh") {
          node.material.transparent = true;
          node.material.opacity = progress.value * finalOpacity;
        }
      });
    },
  });
};

const init = () => {
  loadModels().catch((error) => {
    console.log(error);
  });
};

// THIS LAUNCH THE WHOLE APPEARANCE ANIMATION
init();
