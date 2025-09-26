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

    // Scene & camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

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

    // === Emerald wireframe cube (thick edges) ===
    const boxGeom = new THREE.BoxGeometry(5, 5, 5);
    const edges = new THREE.EdgesGeometry(boxGeom);
    const lineGeom = new LineSegmentsGeometry().fromEdgesGeometry(edges);

    const lineMat = new LineMaterial({
      color: 0x1B998B,   // Unwritten emerald
      linewidth: 7,      // thickness in screen pixels
    });
    // Important: resolution must match canvas size
    lineMat.resolution.set(mountRef.current.clientWidth, mountRef.current.clientHeight);
    // Prevent wireframe from occluding shaded cube
    lineMat.depthWrite = false;

    const wireCube = new LineSegments2(lineGeom, lineMat);
    wireCube.renderOrder = 0;
    scene.add(wireCube);

    // === Lighting for shaded cube ===
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(6, 8, 10);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(-6, -4, -8);
    scene.add(rim);

    // === Orbiting black cube (shaded so faces read) ===
    const pivot = new THREE.Object3D();
    scene.add(pivot);

    const orbitSize = 1.4;
    const orbitRadius = 2.6;
    const orbitGeom = new THREE.BoxGeometry(orbitSize, orbitSize, orbitSize);
    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0x000000,      // black
      roughness: 0.35,      // a touch of sheen
      metalness: 0.0,       // non-metal look; raise to ~0.3 for glossier
      // optional: subtle emissive to avoid total black crush
      emissive: 0x0a0a0a,
      emissiveIntensity: 0.3,
    });
    const orbitCube = new THREE.Mesh(orbitGeom, orbitMat);
    orbitCube.renderOrder = 2;       // draw after wireframe
    orbitCube.castShadow = false;
    orbitCube.receiveShadow = false;
    pivot.add(orbitCube);
    orbitCube.position.set(orbitRadius, 0, 0);

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
