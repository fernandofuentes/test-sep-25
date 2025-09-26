import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

const SpinningCube: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [webglStatus, setWebglStatus] = useState('LOADING');

  useEffect(() => {
    // Check if mount exists
    if (!mountRef.current) {
      console.error('Mount ref is missing');
      setWebglStatus('ERROR');
      return;
    }

    // Check WebGL support
    if (!window.WebGLRenderingContext) {
      console.error('WebGL not supported');
      setWebglStatus('ERROR');
      return;
    }

    // Log canvas dimensions for debugging
    console.log('Canvas dimensions:', mountRef.current.clientWidth, mountRef.current.clientHeight);
    setWebglStatus('ACTIVE');

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15); // Camera at z = 15
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Wireframe cube (emerald, thick lines)
    const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    const lineGeometry = new LineSegmentsGeometry().fromEdgesGeometry(edgesGeometry);
    const lineMaterial = new LineMaterial({
      color: 0x1b998b, // Emerald
      linewidth: 0.005, // Thick lines (relative to canvas)
    });
    lineMaterial.resolution.set(mountRef.current.clientWidth, mountRef.current.clientHeight);
    lineMaterial.depthWrite = false; // Prevent occluding black cube

    const wireframeCube = new LineSegments2(lineGeometry, lineMaterial);
    wireframeCube.renderOrder = 0;
    scene.add(wireframeCube);

    // Black cube (orbiting)
    const pivot = new THREE.Object3D();
    scene.add(pivot);

    const blackCubeGeometry = new THREE.BoxGeometry(2, 2, 2); // 2x2x2 cube
    const blackCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Pure black
    blackCubeMaterial.depthTest = false; // Draw over wireframe
    const blackCube = new THREE.Mesh(blackCubeGeometry, blackCubeMaterial);
    blackCube.renderOrder = 1; // Draw after wireframe
    blackCube.position.set(2.5, 0, 0); // Orbit radius of 2.5
    pivot.add(blackCube);

    // Animation loop
    const animate = () => {
      const frameId = requestAnimationFrame(animate);

      // Rotate wireframe cube
      wireframeCube.rotation.x += 0.01;
      wireframeCube.rotation.y += 0.01;

      // Orbit black cube
      pivot.rotation.y += 0.02; // Horizontal orbit
      blackCube.rotation.x += 0.03; // Black cube self-rotation
      blackCube.rotation.y += 0.03;

      renderer.render(scene, camera);

      // Store frame ID for cleanup
      rendererRef.current!.frameId = frameId;
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      lineMaterial.resolution.set(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.frameId) {
        cancelAnimationFrame(rendererRef.current.frameId);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      boxGeometry.dispose();
      edgesGeometry.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      blackCubeGeometry.dispose();
      blackCubeMaterial.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '600px',
        background: 'white',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid red', // Debug border
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          fontSize: '12px',
          color: '#6b7280',
          fontFamily: 'monospace',
        }}
      >
        WebGL_STATUS: {webglStatus}
      </div>
    </div>
  );
};

export default SpinningCube;