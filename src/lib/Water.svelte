<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from '$app/environment';
  import * as THREE from "three";
  import { Water } from "three/examples/jsm/objects/Water.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

  let container: HTMLDivElement;

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let water: Water;
  let animationFrameId: number;

  const WATER_NORMALS_URL = "/images/waternormals.jpg";

  function init() {
    if (!browser || !container) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Enable transparency
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Handle old vs new Three color API
    if ("outputColorSpace" in renderer) {
      // @ts-ignore
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      // @ts-ignore
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    container.appendChild(renderer.domElement);

    // Scene & Camera
    scene = new THREE.Scene();
    // Make background transparent or white
    scene.background = null; // or new THREE.Color(0xffffff) for white

    camera = new THREE.PerspectiveCamera(55, width / height, 1, 20000);
    camera.position.set(0, 15, 10);

    // Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-1, 8, -4);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Water normals
    const waterNormals = new THREE.TextureLoader().load(
      WATER_NORMALS_URL,
      (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    );

    // Water plane
    const waterGeometry = new THREE.PlaneGeometry(2000, 2000);

    water = new Water(waterGeometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals,
      sunDirection: directionalLight.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0xcccccc, // Light gray
      distortionScale: 2.5,
      fog: false,
      alpha: 0.9
    }) as Water;

    // Make it a horizontal surface
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disable zoom for background
    controls.enablePan = false;  // Disable pan for background
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 0, 0);
    controls.update();

    if (typeof window !== 'undefined') {
      window.addEventListener("resize", onWindowResize);
    }
  }

  function onWindowResize() {
    if (!browser || !renderer || !camera || !container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    if (!browser) return;
    
    animationFrameId = requestAnimationFrame(animate);

    const time = performance.now() * 0.001;
    const mat = water.material as THREE.ShaderMaterial;
    if (mat.uniforms && mat.uniforms["time"]) {
      mat.uniforms["time"].value = time * 0.5; //speed
    }

    controls.update();
    renderer.render(scene, camera);
  }

  onMount(() => {
    if (browser) {
      init();
      animate();
    }
  });

  onDestroy(() => {
    if (browser && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    if (browser && typeof window !== 'undefined') {
      window.removeEventListener("resize", onWindowResize);
    }

    if (renderer) {
      renderer.dispose();
      const canvas = renderer.domElement;
      if (canvas && canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    }

    if (water) {
      water.geometry.dispose();
      (water.material as THREE.Material).dispose();
    }
  });
</script>

<style lang="scss">
  .water-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
  }

  :global(.water-root canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
    filter: contrast(1.2) brightness(1); 

  }
</style>

<div class="water-root" bind:this={container}></div>