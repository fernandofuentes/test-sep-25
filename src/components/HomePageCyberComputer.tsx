import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const HomePageCyberComputer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create cyber computer geometry
    const computerGroup = new THREE.Group();

    // Main computer body (cube)
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1a1a1a,
      shininess: 100 
    });
    const computerBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    computerGroup.add(computerBody);

    // Screen
    const screenGeometry = new THREE.PlaneGeometry(1.6, 1);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88,
      transparent: true,
      opacity: 0.8
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.51;
    computerGroup.add(screen);

    // Screen glow effect
    const glowGeometry = new THREE.PlaneGeometry(2, 1.4);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.2
    });
    const screenGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    screenGlow.position.z = 0.52;
    computerGroup.add(screenGlow);

    // Keyboard
    const keyboardGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.6);
    const keyboardMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.position.y = -1;
    keyboard.position.z = 1.2;
    computerGroup.add(keyboard);

    // Add some cyber elements - floating cubes
    const cubes: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const cubeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7
      });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      
      // Random positions around the computer
      cube.position.x = (Math.random() - 0.5) * 6;
      cube.position.y = (Math.random() - 0.5) * 4;
      cube.position.z = (Math.random() - 0.5) * 4;
      
      cubes.push(cube);
      scene.add(cube);
    }

    scene.add(computerGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x0088ff, 0.5, 100);
    backLight.position.set(-3, -1, -2);
    scene.add(backLight);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Rotate the computer group slowly
      computerGroup.rotation.y += 0.005;
      computerGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;

      // Animate floating cubes
      cubes.forEach((cube, index) => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.position.y += Math.sin(Date.now() * 0.002 + index) * 0.002;
      });

      // Animate screen glow
      if (screenGlow.material instanceof THREE.MeshBasicMaterial) {
        screenGlow.material.opacity = 0.1 + Math.sin(Date.now() * 0.003) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of Three.js objects
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-96 bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-brand-emerald font-mono text-sm">
          <div className="animate-pulse">SYSTEM_ONLINE</div>
          <div className="text-xs text-gray-400 mt-1">CYBER_COMPUTER_V2.1</div>
        </div>
      </div>
    </div>
  );
};

export default HomePageCyberComputer;