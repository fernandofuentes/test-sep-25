import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const SpinningCube: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>();
  const [webglStatus, setWebglStatus] = useState('LOADING');

  useEffect(() => {
    console.log('mountRef.current:', mountRef.current);
    if (!mountRef.current) {
      console.error('Mount ref is null');
      return;
    }

    console.log('Mount dimensions:', mountRef.current.clientWidth, mountRef.current.clientHeight);

    if (!window.WebGLRenderingContext) {
      setWebglStatus('ERROR');
      return;
    }
    setWebglStatus('ACTIVE');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const orbitSize = 2.0;
    const orbitGeom = new THREE.BoxGeometry(orbitSize, orbitSize, orbitSize);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red cube
    const orbitCube = new THREE.Mesh(orbitGeom, orbitMat);
    orbitCube.position.set(0, 0, 0);
    scene.add(orbitCube);

    console.log('Cube:', orbitCube.geometry, orbitCube.material);

    const animate = () => {
      console.log('Animation frame');
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
      console.log('Resize:', w, h);
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

  if (!mountRef.current) {
    return <div>Canvas container not found</div>;
  }

  return (
    <div
      className="relative w-full h-[600px] bg-white overflow-visible"
      style={{ background: 'lightgray', border: '2px solid blue' }}
    >
      <div
        ref={mountRef}
        className="w-full h-full"
        style={{ width: '100%', height: '600px', border: '1px solid red' }}
      />
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">
        WebGL_STATUS: {webglStatus}
      </div>
    </div>
  );
};

export default SpinningCube;