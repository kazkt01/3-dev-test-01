import * as THREE from "three";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// シーンの作成
const scene = new THREE.Scene();

// カメラの設定
const camera = new THREE.PerspectiveCamera(
  15,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, 0);

// レンダラーの設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hdrUrl = "public/rosendal_park_sunset_puresky_2k.hdr";
new RGBELoader().load(hdrUrl, (texture) => {
  const gen = new THREE.PMREMGenerator(renderer);
  const envMap = gen.fromEquirectangular(texture).texture;
  scene.environment = envMap;
  scene.background = envMap;

  texture.dispose();
  gen.dispose();
});

// OrbitControlsの設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = true;
controls.autoRotateSpeed = -0.3;
controls.update();

// 地面の作成
// const groundGeometry = new THREE.PlaneGeometry(200, 200, 320, 320);
// groundGeometry.rotateX(-Math.PI / 2);
// const groundMaterial = new THREE.MeshStandardMaterial({
//   color: new THREE.Color("white"),
//   side: THREE.DoubleSide,
//   metalness: 0.8,
//   roughness: 0.8,
// });
// const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
// groundMesh.castShadow = false;
// groundMesh.receiveShadow = true;
// scene.add(groundMesh);

// 照明の設定;
// const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
// spotLight.position.set(0, 50, 0);
// spotLight.castShadow = true;
// spotLight.shadow.bias = -0.0001;
// scene.add(spotLight);

// GLTFモデルの読み込み;
let mesh;
const gltfLoader = new GLTFLoader();
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://pf-three-01-ws68-bofhvt3xy-kazkt01s-projects.vercel.app"
    : "";
const modelPath = `${baseUrl}/tatung_einstein_tc-01/scene.gltf`;
console.log("Attempting to load:", modelPath);

gltfLoader.load(
  modelPath,
  (gltf) => {
    console.log("Model loaded successfully");
    mesh = gltf.scene;

    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mesh.position.set(-44, -44, -44);
    scene.add(mesh);

    controls.target.copy(mesh.position);
    controls.update();

    document.getElementById("progress-container").style.display = "none";
  },
  (xhr) => {
    console.log(`Loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error("An error happened while loading the model:", error);
  }
);

// ウィンドウリサイズ時の処理
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// タッチデバイスのイベント処理
document.addEventListener("DOMContentLoaded", (event) => {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.addEventListener("touchstart", (e) => e.preventDefault(), {
      passive: false,
    });
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
  }
});
