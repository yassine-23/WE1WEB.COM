import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Node {
  lat: number;
  lng: number;
  intensity: number;
  type: 'provider' | 'consumer';
}

interface EarthGlobeProps {
  nodes?: Node[];
  className?: string;
}

export default function EarthGlobe({ nodes = [], className = "" }: EarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const globeRef = useRef<THREE.Mesh>();
  const nodeGroupRef = useRef<THREE.Group>();
  const frameRef = useRef<number>();

  // Generate realistic mock nodes for demonstration
  const generateMockNodes = (): Node[] => {
    const mockNodes: Node[] = [];
    const hotspots = [
      { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
      { lat: 40.7128, lng: -74.0060, name: 'New York' },
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
      { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
      { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
      { lat: 55.7558, lng: 37.6176, name: 'Moscow' },
      { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
      { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
      { lat: -23.5505, lng: -46.6333, name: 'São Paulo' },
    ];

    hotspots.forEach(hotspot => {
      // Add main node
      mockNodes.push({
        lat: hotspot.lat,
        lng: hotspot.lng,
        intensity: Math.random() * 0.8 + 0.5,
        type: Math.random() > 0.3 ? 'provider' : 'consumer'
      });

      // Add surrounding nodes
      for (let i = 0; i < 8 + Math.random() * 12; i++) {
        mockNodes.push({
          lat: hotspot.lat + (Math.random() - 0.5) * 10,
          lng: hotspot.lng + (Math.random() - 0.5) * 10,
          intensity: Math.random() * 0.7 + 0.3,
          type: Math.random() > 0.4 ? 'provider' : 'consumer'
        });
      }
    });

    return mockNodes;
  };

  const activeNodes = nodes.length > 0 ? nodes : generateMockNodes();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with transparent background
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Renderer setup with transparent background
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false 
    });
    renderer.setClearColor(0x000000, 0); // Fully transparent
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Earth geometry and materials
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Realistic digital earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a2332, // Dark blue-gray base for realistic earth
      emissive: 0x0a1520, // Subtle glow
      shininess: 15,
      transparent: true,
      opacity: 0.88
    });

    const globe = new THREE.Mesh(geometry, earthMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Add digital grid overlay for tech appearance
    const gridGeometry = new THREE.SphereGeometry(1.005, 32, 16);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x4ECDC4, // Primary cyan color
      transparent: true,
      opacity: 0.25,
      wireframe: true
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(gridMesh);

    // Enhanced atmosphere glow - more realistic
    const atmosphereGeometry = new THREE.SphereGeometry(1.08, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x4ECDC4, // Match primary color
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Enhanced lighting for realistic appearance
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4ECDC4, 0.6);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add secondary light for better depth
    const secondaryLight = new THREE.DirectionalLight(0x8B5CF6, 0.3);
    secondaryLight.position.set(-3, -2, 4);
    scene.add(secondaryLight);

    // Node group
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);
    nodeGroupRef.current = nodeGroup;

    // Convert lat/lng to 3D coordinates
    const latLngToVector3 = (lat: number, lng: number, radius: number = 1.01) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Create nodes with enhanced appearance
    const connectionLines: THREE.Line[] = [];
    
    activeNodes.forEach((node, index) => {
      const nodeGeometry = new THREE.SphereGeometry(0.018, 12, 12);
      const nodeColor = node.type === 'provider' ? 0x4ECDC4 : 0x8B5CF6; // Cyan for providers, purple for consumers
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: node.intensity * 0.9
      });

      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      const position = latLngToVector3(node.lat, node.lng);
      nodeMesh.position.copy(position);
      
      // Add pulsing animation
      const pulseSpeed = 0.02 + Math.random() * 0.01;
      nodeMesh.userData = { 
        originalScale: nodeMesh.scale.clone(),
        pulseSpeed,
        phase: Math.random() * Math.PI * 2
      };

      nodeGroup.add(nodeMesh);

      // Add connection lines for high-intensity nodes
      if (node.intensity > 0.7 && Math.random() > 0.6) {
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [
          position.x, position.y, position.z,
          position.x * 1.2, position.y * 1.2, position.z * 1.2
        ];
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({
          color: nodeColor,
          transparent: true,
          opacity: 0.3
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        nodeGroup.add(line);
      }
    });

    // Animation loop with smooth rotation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Smooth continuous rotation
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.003; // Smooth rotation
      }

      // Rotate node group with globe for consistent movement
      if (nodeGroupRef.current) {
        nodeGroupRef.current.rotation.y += 0.003;
        
        // Subtle pulsing animation for nodes
        const time = Date.now() * 0.001;
        nodeGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.userData.pulseSpeed) {
            const { originalScale, pulseSpeed, phase } = child.userData;
            const scale = 1 + Math.sin(time * pulseSpeed + phase) * 0.1;
            child.scale.copy(originalScale).multiplyScalar(scale);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Subtle camera movement based on mouse
      camera.position.x = mouseX * 0.1;
      camera.position.y = mouseY * 0.1;
      camera.lookAt(0, 0, 0);
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', handleMouseMove);
        if (renderer.domElement.parentNode) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`relative globe-container ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '400px',
        background: 'transparent',
        overflow: 'visible'
      }}
    >
      {/* Node legend */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span>Providers ({activeNodes.filter(n => n.type === 'provider').length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>Consumers ({activeNodes.filter(n => n.type === 'consumer').length})</span>
        </div>
      </div>
    </div>
  );
}