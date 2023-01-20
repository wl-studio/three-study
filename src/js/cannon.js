import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x000000);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(0, 16, 34);
orbit.update();

const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
});
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

const grGeo = new THREE.PlaneGeometry(30, 30);
const grMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true
});
const grMesh = new THREE.Mesh(grGeo, grMat);
scene.add(grMesh);

const spGeo = new THREE.SphereGeometry(2);
const spMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});
const spMesh = new THREE.Mesh(spGeo, spMat);
scene.add(spMesh);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});

const grPhyMat = new CANNON.Material();

const grBody = new CANNON.Body({
    // shape: new CANNON.Plane(),
    // mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
    type: CANNON.Body.STATIC,
    material: grPhyMat
});
world.addBody(grBody);
grBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

const boxPhyMat = new CANNON.Material();

const boxBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    position: new CANNON.Vec3(-5, 30, 0),
    material: boxPhyMat
});
world.addBody(boxBody);
boxBody.angularVelocity.set(0, 10, 0);
boxBody.angularDamping = 0.5;

const grConMat = new CANNON.ContactMaterial(
    grPhyMat,
    boxPhyMat,
    { friction: 0 }
);
world.addContactMaterial(grConMat);

const spPhyMat = new CANNON.Material();
const spBody = new CANNON.Body({
    mass: 2,
    shape: new CANNON.Sphere(2),
    position: new CANNON.Vec3(-4, 23, 0),
    material: spPhyMat
});
world.addBody(spBody);
spBody.linearDamping = 0.31;

const spConMat = new CANNON.ContactMaterial(
    grPhyMat,
    spPhyMat,
    { friction: 0 }
);
world.addContactMaterial(spConMat);


const timeStep = 1 / 60;

function animate() {
    world.step(timeStep);
    grMesh.position.copy(grBody.position);
    grMesh.quaternion.copy(grBody.quaternion);

    boxMesh.position.copy(boxBody.position);
    boxMesh.quaternion.copy(boxBody.quaternion);

    spMesh.position.copy(spBody.position);
    spMesh.quaternion.copy(spBody.quaternion);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});