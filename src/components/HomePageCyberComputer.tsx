import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const HomePageCyberComputer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>();
  const [webglStatus, setWebglStatus] = useState('LOADING');

  useEffect(() => {
    if (!mountRef.current) return;

    if (!window.WebGLRenderingContext) {
      console.error('WebGL not supported');
      setWebglStatus('ERROR');
      return;
    }
    setWebglStatus('ACTIVE');

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.z = 10;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Computer group
    const computerGroup = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 100 });
    const computerBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    computerBody.castShadow = true;
    computerGroup.add(computerBody);
    scene.add(computerGroup);

    // Floating cyan cubes
    const cubes: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      scene.add(cube);
      cubes.push(cube);
    }

    // Black cube orbiting with pivot
    const pivot = new THREE.Object3D();
    scene.add(pivot);

    const orbitCubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const orbitCubeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const orbitCube = new THREE.Mesh(orbitCubeGeometry, orbitCubeMaterial);
    orbitCube.castShadow = true;
    pivot.add(orbitCube);

    const ORBIT_RADIUS = 4;
    orbitCube.position.set(ORBIT_RADIUS, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ff88, 1.2, 100);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Spin computer
      computerGroup.rotation.y += 0.005;

      // Animate cyan cubes
      cubes.forEach((cube, index) => {
        const time = performance.now() * 0.001;
        const angle = (index / 5) * Math.PI * 2 + time * 0.5;
        cube.position.set(
          Math.cos(angle) * 8,
          Math.sin(angle * 0.5 + time) * 3,
          Math.sin(angle) * 8
        );
        cube.rotation.x += 0.02;
        cube.rotation.y += 0.02;
      });

      // Orbit the black cube (pivot)
      pivot.rotation.y += 0.02;
      pivot.rotation.x = Math.sin(performance.now() * 0.001) * 0.15;
      orbitCube.rotation.x += 0.03;
      orbitCube.rotation.y += 0.03;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      cubes.forEach((cube) => {
        cube.geometry.dispose();
        (cube.material as THREE.Material).dispose();
      });
      orbitCubeGeometry.dispose();
      orbitCubeMaterial.dispose();
      scene.remove(pivot);
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-white overflow-visible">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">
        WebGL_STATUS: {webglStatus}
      </div>
    </div>
  );
};

export default HomePageCyberComputer;
