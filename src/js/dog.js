import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xfefefe);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(6, 8, 14);
orbit.update();

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

let mixer;
const soldierUrl = new URL('../assets/Soldier.glb', import.meta.url);
const loader = new GLTFLoader();
loader.load(
  soldierUrl.href,
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    /**
     * 特定对象动画播放器 AnimationMixer
     * 0. 创建播放器
     */
    mixer = new THREE.AnimationMixer(model);
    const animations = gltf.animations;
    /**
     * 关键帧轨道集 = 动画 AnimationClip
     * 1.找到对应动画
     */
    const clip = THREE.AnimationClip.findByName(animations, 'Run');
    /**
     * action 调度 AnimationClips 中 动画
     * 2. 让找到的动画可操作
     */
    const action = mixer.clipAction(clip);
    action.play();
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  // called when loading has errors
  function (error) {
    console.log('An error happened', error);
  }
);

const clock = new THREE.Clock();
function animate() {
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
