// IMPORTS

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Perlin } from 'three-noise';
import OrbitControls from 'threejs-orbit-controls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

import sprite from './sprite-animation'

// HELPERS

const loader = new GLTFLoader();
const modelLoader = (url) => {
  return new Promise((resolve, reject) => {
    loader.load(url, data=> resolve(data), null, reject);
  });
}

// VARIABLES


let mixer, clock
clock = new THREE.Clock();

const perlin = new Perlin(Math.random())
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 8
//camera.position.y = 3
//camera.position.x = 3

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enabled = true;
controls.enableZoom = true;
controls.enablePan = false;
controls.rotateSpeed = 0.5;
controls.maxDistance = 1500;
controls.minDistance = 0;

// MODELS

const testMat = new THREE.MeshBasicMaterial({
  transparent: true,
  color: new THREE.Color('white'),
})

const textureLoader = new THREE.TextureLoader()
const spriteTexture = textureLoader.loadAsync('assets/man.png')
spriteTexture.then(el => {
  const spriteAnim = sprite(el, 8, 8, 64, 10)
  spriteAnim.start(-1)
  testMat.map = spriteAnim.texture
  testMat.needsUpdate = true
})


const loaderCube = new THREE.CubeTextureLoader();
loaderCube.setPath( 'assets/textures/cube/' );
const textureCube = loaderCube.load( [
	'px.png', 'nx.png',
	'py.png', 'ny.png',
	'pz.png', 'nz.png'
] );

async function loadModels() {
  const ipod = await modelLoader('/assets/models/ipod/iPod.gltf')
  ipod.scene.scale.set(0.015, 0.015, 0.015)
  ipod.scene.position.set(-2, 1.1, 1)
  ipod.scene.rotation.y = Math.PI

  ipod.scene.traverse(function(el) {
    if (el.type == 'Mesh') {
      el.material.envMap = textureCube
      el.material.envMapIntensity = 1
    }
  })

  //////////////////

  const platform = await modelLoader('/assets/models/platform/scene.gltf')
  platform.scene.scale.set(0.2, 0.2, 0.2)
  mixer = new THREE.AnimationMixer(platform.scene);
  platform.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
  });                

  platform.scene.traverse(function(el) {
    if (el.type == 'Mesh') {
      el.material.envMap = textureCube
      el.material.envMapIntensity = 2
    }
  })

  const robot = await modelLoader('/assets/models/robot/Robot_Renaud.glb')
  robot.scene.scale.set(5,5,5)
  robot.scene.position.y = 2
  robot.scene.traverse(function(el) {
    if (el.type == 'Mesh') {
      el.material.envMap = textureCube
      el.material.envMapIntensity = 1
    }
  })

  const geometry = new THREE.BoxGeometry(2, 2, 2)
  const cube = new THREE.Mesh(geometry, testMat)

  //////////////////
  
  scene.add(robot.scene)
  //scene.add(cube)
  //platform.scene.add(ipod.scene)
  //scene.add(platform.scene)
}

// LIGHTS

const light = new THREE.DirectionalLight( 0xFFFFFF );
const ambientLight = new THREE.AmbientLight( 0x404040 );

scene.add( light );
scene.add( ambientLight );

// POST EFFECTS IF NEEDED

const composer = new EffectComposer( renderer );
composer.addPass(new RenderPass(scene, camera));

const bloomEffect = new UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.1, 0, 0.8 )
const ssaoPass = new SSAOPass( scene, camera, window.innerWidth, window.innerHeight );
const filmEffect = new FilmPass(.5, .5, 1, 0)

/* 
ssaoPass.kernelRadius = 51;
ssaoPass.minDistance = 0.012
ssaoPass.maxDistance = 1

composer.addPass(bloomEffect)
composer.addPass(ssaoPass)
composer.addPass(filmEffect)
*/

function animate(dt) {
  composer.render();

  controls.update();

  renderer.antialias = true;
  renderer.setClearColor( 0xffffff, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const delta = clock.getDelta();
  if ( mixer ) mixer.update( delta );

	requestAnimationFrame( animate );
}
animate();

const init = () => {
    loadModels().catch(error => {
      console.log(error)
    })
}
init()