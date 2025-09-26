import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

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

    console.log('Mount:', mountRef.current.clientWidth, mountRef.current.clientHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 15); // Moved back
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Black cube (red for debugging)
    const orbitSize = 2.0;
    const orbitGeom = new THREE.BoxGeometry(orbitSize, orbitSize, orbitSize);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
    const orbitCube = new THREE.Mesh(orbitGeom, orbitMat);
    orbitCube.position.set(0, 0, 0); // Center for testing
    scene.add(orbitCube);

    console.log('Cube:', orbitCube.geometry, orbitCube.material);

    const animate = () => {
      console.log('Frame');
      frameRef.current = requestAnimationFrame(animate);
      orbitCube.rotation.x += 0.01;
      orbitCube.rotation.y += 0.01;
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
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      orbitGeom.dispose();
      orbitMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-white overflow-visible">
      <div ref={mountRef} className="w-full h-full" style={{ border: '1px solid red' }} />
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">
        WebGL_STATUS: {webglStatus}
      </div>
    </div>
  );
};

export default SpinningCube;