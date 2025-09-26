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

    // === Emerald wireframe cube (outer edges only, thick lines) ===
    const boxGeom = new THREE.BoxGeometry(5, 5, 5);
    const edges = new THREE.EdgesGeometry(boxGeom);
    const lineGeom = new LineSegmentsGeometry().fromEdgesGeometry(edges);

    const lineMat = new LineMaterial({
      color: 0x1B998B,
      linewidth: 8, // make it chunky
    });
    // Must match CANVAS size (not window) or it won't show
    lineMat.resolution.set(mountRef.current.clientWidth, mountRef.current.clientHeight);
    // Keep lines from occluding the black cube
    lineMat.depthWrite = false;

    const wireCube = new LineSegments2(lineGeom, lineMat);
    wireCube.renderOrder = 0;
    scene.add(wireCube);

    // === Orbiting black cube ===
    // DEBUG: set to true to center the black cube (no orbit) to prove visibility
    const DEBUG_CENTER_BLACK = false;

    const pivot = new THREE.Object3D();
    scene.add(pivot);

    const orbitSize = 2.0;      // BIG so you can't miss it
    const orbitRadius = 2.2;    // close to the center
    const orbitGeom = new THREE.BoxGeometry(orbitSize, orbitSize, orbitSize);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x000000,   // pure black
    });
    // Make 100% sure it draws over the wireframe
    orbitMat.depthTest = false;

    const orbitCube = new THREE.Mesh(orbitGeom, orbitMat);
    orbitCube.renderOrder = 2; // draw after wireframe
    orbitCube.frustumCulled = false;
    pivot.add(orbitCube);

    if (DEBUG_CENTER_BLACK) {
      // Park it right in the middle to confirm you can see it
      orbitCube.position.set(0, 0, 0);
    } else {
      // Normal orbit start position
      orbitCube.position.set(orbitRadius, 0, 0);
    }

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      wireCube.rotation.x += 0.01;
      wireCube.rotation.y += 0.01;

      if (!DEBUG_CENTER_BLACK) {
        const t = performance.now() * 0.001;
        pivot.rotation.y += 0.02;                 // horizontal orbit
        pivot.rotation.x = Math.sin(t * 0.8) * 0.15;
        orbitCube.rotation.x += 0.03;
        orbitCube.rotation.y += 0.03;
      }

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
      lineMat.resolution.set(w, h); // keep line thickness correct
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
