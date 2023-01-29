import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
camera.position.set(0, 6, 6);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionalLight);
directionalLight.position.set(0, 50, 0);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const mouse = new THREE.Vector2();
const intersectionPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();

window.addEventListener('click', (e) => {
  //   1.鼠标位置归一为设备坐标，x y 为-1 ～ 1之间的值
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  //   2.向量转单位向量
  //   向量表示：长度与方向
  //   单位向量表示：方向
  planeNormal.copy(camera.position).normalize();
  //   3.设置平面
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
  //   4.通过摄像机/鼠标位置更新射线
  raycaster.setFromCamera(mouse, camera);
  //   5. 同步射线与平面相交的点给2参数
  raycaster.ray.intersectPlane(plane, intersectionPoint);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.125, 30, 30),
    new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      metalness: 0,
      roughness: 0,
    })
  );
  scene.add(mesh);
  mesh.position.copy(intersectionPoint);
});

function animate() {
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
