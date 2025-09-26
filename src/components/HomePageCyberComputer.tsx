import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const SpinningCube: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>();
  const [webglStatus, setWebglStatus] = useState('LOADING');

  useEffect(() => {
    if (!mountRef.current) return;

    if (!window.WebGLRenderingContext) {
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
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // === Emerald wireframe cube (outer edges only, thick lines) ===
    const boxGeom = new THREE.BoxGeometry(5, 5, 5);
    const edges = new THREE.EdgesGeometry(boxGeom);
    const lineGeom = new LineSegmentsGeometry().fromEdgesGeometry(edges);

    const lineMat = new LineMaterial({
      color: 0x1B998B, // brand emerald
      linewidth: 5,    // thickness in screen pixels
    });
    // must match the canvas size (not window)
    lineMat.resolution.set(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );

    const wireCube = new LineSegments2(lineGeom, lineMat);
    scene.add(wireCube);

    // === Orbiting black cube (solid) ===
    const pivot = new THREE.Object3D();
    scene.add(pivot);

    const orbitSize = 1.1;       // size of the black cube
    const orbitRadius = 3.0;     // distance from center
    const orbitGeom = new THREE.BoxGeometry(orbitSize, orbitSize, orbitSize);
    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x111111,        // self-lit so it pops on white
      emissiveIntensity: 0.9,
      metalness: 0,
      roughness: 1,
    });
    const orbitCube = new THREE.Mesh(orbitGeom, orbitMat);
    orbitCube.renderOrder = 1;   // draw over lines if needed
    pivot.add(orbitCube);
    orbitCube.position.set(orbitRadius, 0, 0);

    // Subtle lights (help on some GPUs)
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(5, 7, 9);
    scene.add(key);

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      wireCube.rotation.x += 0.01;
      wireCube.rotation.y += 0.01;

      const t = performance.now() * 0.001;
      pivot.rotation.y += 0.02;                 // horizontal orbit
      pivot.rotation.x = Math.sin(t * 0.8) * 0.15; // gentle vertical wobble
      orbitCube.rotation.x += 0.03;
      orbitCube.rotation.y += 0.03;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      lineMat.resolution.set(w, h); // keep line thickness consistent
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
      boxGeom.dispose();
      edges.dispose();
      lineGeom.dispose();
      lineMat.dispose();
      orbitGeom.dispose();
      orbitMat.dispose();
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

export default SpinningCube;
