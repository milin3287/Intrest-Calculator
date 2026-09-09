import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeDCanvasProps {
  growthFactor?: number;
  interactive?: boolean;
}

export const ThreeDCanvas: React.FC<ThreeDCanvasProps> = ({ growthFactor = 1.5, interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setIsWebGLSupported(false);
      return;
    }

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const primaryLight = new THREE.DirectionalLight(0x3b82f6, 3.5);
    primaryLight.position.set(5, 5, 4);
    scene.add(primaryLight);

    const accentLight = new THREE.PointLight(0x8b5cf6, 4, 15);
    accentLight.position.set(-4, -2, 3);
    scene.add(accentLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.5, 12);
    goldLight.position.set(0, 4, 2);
    scene.add(goldLight);

    // --- 3D Geometric Group ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Metallic Torus Knot (Symbol of compounding loop)
    const torusGeometry = new THREE.TorusKnotGeometry(1.4, 0.42, 140, 24, 2, 3);
    const torusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.1,
      wireframe: false,
    });
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    mainGroup.add(torusMesh);

    // 2. Outer Gyroscope Rings
    const ring1Geo = new THREE.TorusGeometry(2.6, 0.04, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.9, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      metalness: 0.9,
      roughness: 0.3,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    mainGroup.add(ring2);

    // 3. Floating Sparkle Particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.8 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      scales[i] = Math.random() * 0.08 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.09,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // Mouse Tracking for Interactive Parallax
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
      targetRotationY = x * 1.4;
      targetRotationX = y * 1.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle Rotation + Interactive Interpolation
      mainGroup.rotation.y += 0.008;
      mainGroup.rotation.x += 0.004;

      ring1.rotation.z += 0.006;
      ring2.rotation.x += 0.005;

      // Smooth damp towards cursor target
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y * 0.1) * 0.05;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x * 0.1) * 0.05;

      // Pulse based on growthFactor
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.03 * Math.min(growthFactor, 2);
      torusMesh.scale.set(pulse, pulse, pulse);

      // Float gentle movement
      mainGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ringMat.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [growthFactor, interactive]);

  if (!isWebGLSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-tertiary/10 to-transparent rounded-3xl p-8 border border-primary/20">
        <div className="w-48 h-48 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] relative cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
    />
  );
};
