import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import sunImg from '../img/sun.jpeg';
import earthImg from '../img/earth.jpeg';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-90, 140, 140);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

const textureLoader = new THREE.TextureLoader();

const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunImg),
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

/**
 *  点光源 
 * PointLight（颜色，强度，距离多远）
 */
const point = new THREE.PointLight(0xffffff, 3, 300);
scene.add(point);

function createSphere(position, ring) {
  const geo = new THREE.SphereGeometry(10, 30, 30);
  const mat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(earthImg),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.position.x = position;

  /**
   * 三维物体 Object3D 可添加子对象
   * Three 对象的基类
   */
  const obj = new THREE.Object3D();
  obj.add(mesh);

  if (ring) {
    /**
     * 圆环几何 RingGeometry(内半径， 外半径)
     */
    const ringGeo = new THREE.RingGeometry(ring.in, ring.out);
    const ringMat = new THREE.MeshBasicMaterial({
        map: textureLoader.load(earthImg),
        side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    obj.add(ringMesh);
    ringMesh.position.x = position;
    ringMesh.rotation.x = -0.5 * Math.PI;
  }

  scene.add(obj);
  return {
    mesh,
    obj,
  };
}

const earth = createSphere(40);
const earth2 = createSphere(80, {
    in: 12,
    out: 20
});

function animate(time) {
  earth.mesh.rotateY(0.007);
  sun.rotateY(-0.001);

  earth.obj.rotateY(0.003);
  earth2.obj.rotateY(-0.004);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
