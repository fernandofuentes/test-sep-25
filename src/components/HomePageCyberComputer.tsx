@@ .. @@
     // Floating cubes
     const cubes: THREE.Mesh[] = [];
     for (let i = 0; i < 5; i++) {
       const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
       const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
       const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
       
       const angle = (i / 5) * Math.PI * 2;
       cube.position.set(
         Math.cos(angle) * 8,
         Math.sin(angle * 0.5) * 3,
         Math.sin(angle) * 8
       );
       
       scene.add(cube);
       cubes.push(cube);
     }

+    // Small black cube orbiting the main computer
+    const orbitCubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
+    const orbitCubeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
+    const orbitCube = new THREE.Mesh(orbitCubeGeometry, orbitCubeMaterial);
+    scene.add(orbitCube);
+
     // Animation
     let animationId: number;
     const animate = () => {
       animationId = requestAnimationFrame(animate);
       
       // Rotate computer
       computerGroup.rotation.y += 0.005;
       
       // Animate floating cubes
       cubes.forEach((cube, index) => {
         const time = Date.now() * 0.001;
         const angle = (index / 5) * Math.PI * 2 + time * 0.5;
         cube.position.set(
           Math.cos(angle) * 8,
           Math.sin(angle * 0.5 + time) * 3,
           Math.sin(angle) * 8
         );
         cube.rotation.x += 0.02;
         cube.rotation.y += 0.02;
       });

+      // Orbit the black cube around the main computer
+      const orbitTime = Date.now() * 0.002;
+      const orbitRadius = 4;
+      orbitCube.position.set(
+        Math.cos(orbitTime) * orbitRadius,
+        Math.sin(orbitTime * 2) * 1.5,
+        Math.sin(orbitTime) * orbitRadius
+      );
+      orbitCube.rotation.x += 0.03;
+      orbitCube.rotation.y += 0.03;
+
       // Pulse screen glow
       const time = Date.now() * 0.003;
       screenLight.intensity = 2 + Math.sin(time) * 0.5;
       
       renderer.render(scene, camera);
     };
@@ .. @@
       geometry.dispose();
       material.dispose();
       cubes.forEach(cube => {
         cube.geometry.dispose();
         (cube.material as THREE.Material).dispose();
       });
+      orbitCubeGeometry.dispose();
+      orbitCubeMaterial.dispose();
     };
   }, []);