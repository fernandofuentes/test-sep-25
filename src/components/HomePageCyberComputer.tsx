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

    console.log('Mount dimensions:', mountRef.current.clientWidth, mountRef.current.clientHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 15); // Moved back slightly for testing
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Wireframe cube
    const boxGeom = new THREE.BoxGeometry(5, 5, 5);
    const edges = new THREE.EdgesGeometry(boxGeom);
    const lineGeom = new LineSegmentsGeometry().fromEdgesGeometry(edges);

    const lineMat = new LineMaterial({
      color: 0x1B998B,
      linewidth: 8,
    });
    lineMat.resolution.set(mountRef.current.clientWidth, mountRef.current.clientHeight);
    lineMat.depthWrite = false;

    const wireCube = new LineSegments2(lineGeom, lineMat);
    wireCube.renderOrder = 0;
    // scene.add(wireCube); // Comment out to test black cube alone

    // Black cube
    const pivot = new THREE.Object3D();
    scene.add(pivot);

    const orbitSize = 2.0;
    const orbitRadius = 2.2;
    const orbitGeom = new THREE.BoxGeometry(orbitSize, orbitSize, orbitSize);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0xff0000, // Changed to red for visibility
    });
    orbitMat.depthTest = false;

    const orbitCube = new THREE.Mesh(orbitGeom, orbitMat);
    orbitCube.renderOrder = 2;
    orbitCube.frustumCulled = false;
    pivot.add(orbitCube);

    const DEBUG_CENTER_BLACK = true; // Center the cube for testing
    if (DEBUG_CENTER_BLACK) {
      orbitCube.position.set(0, 0, 0);
    } else {
      orbitCube.position.set(orbitRadius, 0, 0);
    }

    console.log('Orbit cube:', orbitCube.geometry, orbitCube.material);

    const animate = () => {
      console.log('Animation frame');
      frameRef.current = requestAnimationFrame(animate);

      wireCube.rotation.x += 0.01;
      wireCube.rotation.y += 0.01;

      if (!DEBUG_CENTER_BLACK) {
        const t = performance.now() * 0.001;
        pivot.rotation.y += 0.02;
        pivot.rotation.x = Math.sin(t * 0.8) * 0.15;
        orbitCube.rotation.x += 0.03;
        orbitCube.rotation.y += 0.03;
      }

      // Log cube position
      const worldPos = new THREE.Vector3();
      orbitCube.getWorldPosition(worldPos);
      console.log('Black cube position:', worldPos);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      lineMat.resolution.set(w, h);
    };
    window.addEventListener('resize', handleResize);

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