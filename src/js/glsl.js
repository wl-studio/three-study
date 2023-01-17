import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import earth from '../img/earth.jpeg';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x000000);

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
camera.position.set(0, 8, 14);
orbit.update();

// Sets a 12 by 12 gird helper
// const gridHelper = new THREE.GridHelper(12, 12);
// scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

const uniforms = {
  u_time: { value: 0.0, type: 'f' },
  u_resolution: {
    type: 'v2',
    value: new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    ).multiplyScalar(window.devicePixelRatio),
  },
  u_mouse: { type: 'v2', value: new THREE.Vector2(0.0, 0.0) },
  image: {
    type: 't',
    value: new THREE.TextureLoader().load(earth),
  },
};

window.addEventListener('mousemove', (e) => {
  uniforms.u_mouse.value.set(
    e.screenX / window.innerWidth,
    1 - e.screenY / Window.innerHeight
  );
});

const geo = new THREE.PlaneGeometry(10, 10, 30, 30);
const mat = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    uniform float u_time;
    varying vec2 vUx;
    void main() {
        vUx = uv;
        float newX = sin(position.x * u_time) * sin(position.y * u_time);
        vec3 newPosition = vec3(newX, position.y, position.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform sampler2D image;
    varying vec2 vUx;
    void main() {
        vec2 st = gl_FragCoord.xy / u_resolution;
        vec4 texture = texture2D(image, vUx);
        float effect = abs(sin(texture.x + u_time));
        gl_FragColor = vec4(vec3(effect), 1.0);
    }
  `,
  wireframe: false,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const clock = new THREE.Clock();
function animate() {
  uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
