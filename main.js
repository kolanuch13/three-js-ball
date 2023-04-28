import * as THREE from 'three';
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
import gsap from 'gsap'

// Scene
const scene = new THREE.Scene();

// Background
const hdrTextureURL = new URL('./orbit.hdr', import.meta.url);
const loader = new RGBELoader();
loader.load(hdrTextureURL, function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
})

// Sphere
const geometry = new THREE.SphereGeometry(3, 60, 60);
const material = new THREE.MeshStandardMaterial({
  roughness: 0,
  metalness: 0.5,
  color: '#00ff83',
});
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Light
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 1, 10);
light.intensity = 1.25;
scene.add(light)

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.1,
  100
);
camera.position.z = 20;

scene.add(camera);


// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGL1Renderer({canvas})
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(2)
renderer.render(scene, camera);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputEncoding = THREE.sRGBEncoding;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 5;

// Resize
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix()
  renderer.setSize(size.width, size.height);
})

const loop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop)
}
loop()

const tl = gsap.timeline({defaults: {duration: 1}})
tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 })
tl.fromTo('nav', { y: "-100%" }, { y: "0%" });
tl.fromTo('.title', { opacity: 0 }, { opacity: 1 });

// Mouse animation control
const text = document.querySelector('.title')
let mouseDown = false;
let rgb = [];
window.addEventListener("mousedown", () =>  (mouseDown = true) );
window.addEventListener("mouseup", () =>  (mouseDown = false) );

window.addEventListener('mousemove', (e) => {
  if (mouseDown) {
    rgb = [
      Math.round((e.pageX / size.width) * 255),
      Math.round((e.pageY / size.height) * 255),
      150
    ]
    let newColor = new THREE.Color(`rgb(${rgb.join(",")})`);
    text.style.background = `-webkit-linear-gradient(rgb(${rgb.join(",")}), rgb(0, 0, 0))`;
    text.style.webkitBackgroundClip = 'text';
    gsap.to(mesh.material.color, {r: newColor.r, g: newColor.g, b: newColor.b})
  }
})
