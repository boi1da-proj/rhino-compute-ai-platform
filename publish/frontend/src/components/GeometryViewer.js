import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GeometryViewer = ({ geometry, options = {} }) => {
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [controls, setControls] = useState(null);

  useEffect(() => {
    if (!geometry || !mountRef.current) return;

    // Initialize Three.js scene
    const initScene = () => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(options.backgroundColor || '#000000');

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        45,
        (options.width || 800) / (options.height || 600),
        0.1,
        1000
      );

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(options.width || 800, options.height || 600);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      mountRef.current.appendChild(renderer.domElement);
      
      setScene(scene);
      setCamera(camera);
      setRenderer(renderer);
      setControls(controls);

      return { scene, camera, renderer, controls };
    };

    // Load geometry
    const loadGeometry = async () => {
      const { scene, camera, renderer, controls } = initScene();

      try {
        // Create geometry from data
        const geometryData = geometry;
        
        if (geometryData.type === 'mesh') {
          const meshGeometry = new THREE.BufferGeometry();
          
          // Set vertices
          const vertices = new Float32Array(geometryData.vertices);
          meshGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          
          // Set faces
          const indices = new Uint32Array(geometryData.faces);
          meshGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
          
          // Set normals
          if (geometryData.normals) {
            const normals = new Float32Array(geometryData.normals);
            meshGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
          }

          // Create material
          const material = new THREE.MeshPhongMaterial({
            color: options.meshColor || '#888888',
            transparent: options.meshTransparent || false,
            opacity: options.meshOpacity || 1.0,
            wireframe: options.meshWireframe || false
          });

          // Create mesh
          const mesh = new THREE.Mesh(meshGeometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);

          // Add edges
          if (options.showEdges) {
            const edges = new THREE.EdgesGeometry(meshGeometry);
            const edgeMaterial = new THREE.LineBasicMaterial({
              color: options.edgeColor || '#000000',
              linewidth: options.edgeLinewidth || 1
            });
            const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
            scene.add(edgeLines);
          }

          // Add vertices
          if (options.showVertices) {
            const pointsGeometry = new THREE.BufferGeometry();
            pointsGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            const pointsMaterial = new THREE.PointsMaterial({
              color: options.vertexColor || '#ff0000',
              size: options.vertexSize || 2
            });
            const points = new THREE.Points(pointsGeometry, pointsMaterial);
            scene.add(points);
          }

          // Position camera based on bounding box
          const box = new THREE.Box3().setFromObject(mesh);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const distance = maxDim * 2;

          camera.position.set(center.x + distance, center.y + distance, center.z + distance);
          camera.lookAt(center);
          controls.target.copy(center);
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(
          options.ambientColor || '#404040',
          options.ambientIntensity || 0.4
        );
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
          options.directionalColor || '#ffffff',
          options.directionalIntensity || 0.8
        );
        directionalLight.position.set(
          options.lightPosition?.[0] || 10,
          options.lightPosition?.[1] || 10,
          options.lightPosition?.[2] || 10
        );
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

      } catch (error) {
        console.error('Error loading geometry:', error);
      }
    };

    loadGeometry();

    // Cleanup
    return () => {
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [geometry, options]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: options.width || 800, 
        height: options.height || 600,
        border: options.border || '1px solid #ccc'
      }} 
    />
  );
};

export default GeometryViewer;
