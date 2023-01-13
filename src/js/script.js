import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import emptyImg from '../img/empty.png';

const monkeyUrl = new URL('../img/monkey.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 场景
const scene = new THREE.Scene();
// 相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 10;
camera.position.y = 15;

// 三维辅助工具
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

/**
 * OrbitControls 属于鼠标左键拖动视角插件
 */
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

/**
 * 正方形
 * 1.绘制结构
 * 2.贴图
 * 3.融合
 * MeshBasicMaterial 属于不受光源影响的贴图
 */
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(1, 2, 3);
box.receiveShadow = true;
scene.add(box);

/**
 * PlaneGeometry 平面
 * side 渲染那一面，正面/背面/双面 DoubleSide = 双面
 */
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = Math.PI * -0.5;
plane.receiveShadow = true;

/**
 * GridHelper（大小，数量） 网格
 */
const gridHelper = new THREE.GridHelper(30, 50);
scene.add(gridHelper);

/**
 * SphereGeometry(半径，x分段，y分段，...) 球类几何图形
 * 素材的 wireframe 为 渲染为线框 默认false
 */
const sphereGeometry = new THREE.SphereGeometry(3, 32, 60);
const sphereColor = 0xff00cc;
const sphereWireframe = false;
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0xff00cc,
  wireframe: sphereWireframe,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = -5;
sphere.castShadow = true;
scene.add(sphere);

/**
 * 环境光 没有阴影
 */
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);


/**
 * DirectionalLight 平行灯光，模拟太阳等
 */
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -7;
// scene.add(directionalLight);

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(dLightHelper);
// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

/**
 * SpotLight 聚光灯 一个点到一个方向发射
 */
const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

/**
 * 拉远 雾
 */
scene.fog = new THREE.FogExp2(0xffffff, 0.01);

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(emptyImg);
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  emptyImg,
  emptyImg,
  emptyImg,
  emptyImg,
  emptyImg,
  emptyImg,
]);

/**
 * 图片贴图到几何图形上
 */
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2Material = new THREE.MeshBasicMaterial({
  map: textureLoader.load(emptyImg),
});
const box2 = new THREE.Mesh(box2Geometry, box2Material);
box2.position.set(10, 10, 3);
box2.name = 'thBox';
scene.add(box2);

let mixer;
const assetsLoader = new GLTFLoader();
assetsLoader.load(
  monkeyUrl.href,
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-12, 4, 6);

    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    const clip = THREE.AnimationClip.findByName(clips, 'myAnimation');
    const action = mixer.clipAction(clip);
    // action.play();
  },
  undefined,
  function (err) {
    console.log('assetsLoader monkey', err);
  }
);

/**
 * dat.gui 配置用户界面插件
 */
const gui = new dat.GUI();

const options = {
  sphereColor,
  sphereWireframe,
  sphereSpeed: 0.01,
  angle: 0.2,
  penumbra: 0,
  intensity: 1,
};

gui.addColor(options, 'sphereColor').onChange((e) => {
  sphere.material.color.set(e);
});

gui.add(options, 'sphereWireframe').onChange((e) => {
  sphere.material.wireframe = e;
});

gui.add(options, 'sphereSpeed', 0.001, 10, 0.001);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 1);

let step = 0;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();
const sphereId = sphere.id;
const clock = new THREE.Clock();
/**
 * 动画循环执行
 */
function animate(time) {
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;

  if (mixer) {
    mixer.update(clock.getDelta());
  }
  step += options.sphereSpeed;
  sphere.position.y = 10 * Math.abs(Math.cos(step));

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  sLightHelper.update();

  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);

  intersects.forEach((item) => {
    if (item.object.id === sphereId) {
      item.object.material.color.set(0xff0000);
    }
    if (item.object.name === 'thBox') {
      item.object.rotation.x = time / 100;
      item.object.rotation.y = time / 100;
    }
  });

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
