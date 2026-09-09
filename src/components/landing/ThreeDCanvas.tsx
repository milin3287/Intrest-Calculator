import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeDCanvasProps {
  growthFactor?: number;
  interactive?: boolean;
}

export const ThreeDCanvas: React.FC<ThreeDCanvasProps> = ({
  growthFactor = 1.5,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean>(true);
  const torusMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const [activeTheme, setActiveTheme] = useState<'cyan' | 'emerald' | 'violet'>('cyan');
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    let torusGeometry: THREE.BufferGeometry | null = null;
    let torusMaterial: THREE.MeshPhysicalMaterial | null = null;
    let ring1Geo: THREE.BufferGeometry | null = null;
    let ring2Geo: THREE.BufferGeometry | null = null;
    let ringMat: THREE.Material | null = null;
    let ring2Mat: THREE.Material | null = null;
    let particleGeo: THREE.BufferGeometry | null = null;
    let particleMat: THREE.Material | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 1.4;
      targetRotationX = y * 1.4;
    };

    let targetRotationX = 0;
    let targetRotationY = 0;

    try {
      // Check if WebGL context is actually available in the browser
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
        return;
      }

      renderer = new THREE.WebGLRenderer({
        canvas: testCanvas,
        antialias: true,
        alpha: true,
        powerPreference: 'default',
      });

      const width = Math.max(container.clientWidth || 400, 200);
      const height = Math.max(container.clientHeight || 400, 200);

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 8);

      // --- Lighting ---
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
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

      // 1. Central Metallic Torus Knot (Symbol of compounding cycles)
      torusGeometry = new THREE.TorusKnotGeometry(1.4, 0.42, 120, 24, 2, 3);
      torusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2563eb,
        metalness: 0.85,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9,
        transmission: 0.1,
        wireframe: false,
      });
      torusMaterialRef.current = torusMaterial;
      const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
      mainGroup.add(torusMesh);

      // 2. Outer Gyroscope Rings
      ring1Geo = new THREE.TorusGeometry(2.6, 0.04, 16, 80);
      ringMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6,
      });
      const ring1 = new THREE.Mesh(ring1Geo, ringMat);
      ring1.rotation.x = Math.PI / 3;
      mainGroup.add(ring1);

      ring2Geo = new THREE.TorusGeometry(2.9, 0.03, 16, 80);
      ring2Mat = new THREE.MeshStandardMaterial({
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
      const particleCount = 60;
      particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const radius = 2.8 + Math.random() * 2.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleMat = new THREE.PointsMaterial({
        color: 0x60a5fa,
        size: 0.09,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const particleSystem = new THREE.Points(particleGeo, particleMat);
      mainGroup.add(particleSystem);

      window.addEventListener('mousemove', handleMouseMove);

      // Resize Handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      };

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
      }

      // Animation Loop
      const clock = new THREE.Clock();

      const animate = () => {
        try {
          animationFrameId = requestAnimationFrame(animate);
          const elapsedTime = clock.getElapsedTime();

          // Constant gentle rotation
          torusMesh.rotation.x = elapsedTime * 0.35;
          torusMesh.rotation.y = elapsedTime * 0.45;

          ring1.rotation.z = elapsedTime * 0.2;
          ring1.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.5) * 0.15;

          ring2.rotation.z = -elapsedTime * 0.15;
          ring2.rotation.y = Math.PI / 4 + Math.cos(elapsedTime * 0.4) * 0.2;

          particleSystem.rotation.y = elapsedTime * 0.08;

          // Mouse Parallax with Damping
          mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y * 0.1) * 0.05;
          mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x * 0.1) * 0.05;

          // Subtle pulse
          const pulse = 1 + Math.sin(elapsedTime * 2) * 0.03 * Math.min(growthFactor, 2);
          torusMesh.scale.set(pulse, pulse, pulse);

          // Float gentle movement
          mainGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.15;

          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        } catch (renderError) {
          console.warn('WebGL render error, falling back to 2D vector display:', renderError);
          setIsWebGLSupported(false);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        }
      };

      animate();
    } catch (err) {
      console.warn('WebGL initialization failed, switching to vector math engine:', err);
      setIsWebGLSupported(false);
    }

    // Safe cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      try {
        if (renderer?.domElement && container?.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer?.dispose();
        torusGeometry?.dispose();
        torusMaterial?.dispose();
        ring1Geo?.dispose();
        ring2Geo?.dispose();
        ringMat?.dispose();
        ring2Mat?.dispose();
        particleGeo?.dispose();
        particleMat?.dispose();
      } catch {
        // ignore cleanup errors
      }
    };
  }, [growthFactor, interactive]);

  const updateTheme = (theme: 'cyan' | 'emerald' | 'violet') => {
    setActiveTheme(theme);
    if (!torusMaterialRef.current) return;
    if (theme === 'cyan') torusMaterialRef.current.color.setHex(0x2563eb);
    if (theme === 'emerald') torusMaterialRef.current.color.setHex(0x059669);
    if (theme === 'violet') torusMaterialRef.current.color.setHex(0x7c3aed);
  };

  const toggleWireframe = () => {
    if (!torusMaterialRef.current) return;
    const next = !wireframeMode;
    setWireframeMode(next);
    torusMaterialRef.current.wireframe = next;
  };

  // Graceful 2D High-Resolution Vector Mathematical Engine (When WebGL is unavailable or fails)
  if (!isWebGLSupported) {
    return (
      <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] flex flex-col items-center justify-center p-6 select-none overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-radial from-primary/15 via-transparent to-transparent pointer-events-none" />

        {/* Dynamic Mathematical Orbital Rings */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_30s_linear_infinite]" />
          
          {/* Middle Ring */}
          <div className="absolute inset-4 rounded-full border border-secondary/30 animate-[spin_20s_linear_infinite_reverse]" />

          {/* Central Math Core */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-primary/20 via-primary/10 to-surface-container-high border border-primary/40 shadow-2xl flex flex-col items-center justify-center p-4 backdrop-blur-md">
            <span className="material-symbols-outlined text-[36px] sm:text-[44px] text-primary animate-pulse">
              all_inclusive
            </span>
            <span className="text-xs font-mono font-bold text-on-surface mt-1">
              A = P·(1 + r/n)ⁿᵗ
            </span>
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest mt-0.5">
              Continuous Yield
            </span>
          </div>

          {/* Orbiting Satellite 1 */}
          <div className="absolute top-2 left-6 px-3 py-1 rounded-full bg-surface-container-lowest/90 border border-outline-variant/30 text-[11px] font-mono shadow-md text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>ACT/365 Exact</span>
          </div>

          {/* Orbiting Satellite 2 */}
          <div className="absolute bottom-4 right-6 px-3 py-1 rounded-full bg-surface-container-lowest/90 border border-outline-variant/30 text-[11px] font-mono shadow-md text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>Exponential</span>
          </div>
        </div>

        {/* Accrual Badge */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-surface-container-high/60 border border-outline-variant/30 text-xs font-mono text-on-surface-variant flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Precision Financial Math Engine Active</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] relative cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
      />

      {/* Floating 3D Micro-Chips (Overlaid for financial visual depth) */}
      <div className="absolute top-6 -left-2 sm:left-4 z-10 px-3 py-1.5 rounded-xl bg-surface-container-lowest/85 backdrop-blur-xl border border-outline-variant/30 shadow-lg text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-secondary font-medium">Daily Accrual:</span>
          <span className="font-bold text-on-surface">+₹32.88/day</span>
        </div>
      </div>

      <div className="absolute bottom-14 -right-2 sm:right-4 z-10 px-3 py-1.5 rounded-xl bg-surface-container-lowest/85 backdrop-blur-xl border border-outline-variant/30 shadow-lg text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-xs text-primary">calendar_month</span>
          <span className="text-secondary font-medium">Interval:</span>
          <span className="font-bold text-primary">194 Days</span>
        </div>
      </div>

      {/* Interactive 3D Shader Controls Pill */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/30 shadow-xl text-xs">
        <span className="text-[11px] font-mono text-secondary font-semibold hidden sm:inline">Shader:</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateTheme('cyan')}
            className={`w-3.5 h-3.5 rounded-full bg-blue-600 transition-all ${
              activeTheme === 'cyan' ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-surface scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            title="Cobalt Blue"
          />
          <button
            type="button"
            onClick={() => updateTheme('emerald')}
            className={`w-3.5 h-3.5 rounded-full bg-emerald-500 transition-all ${
              activeTheme === 'emerald' ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-surface scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            title="Emerald Yield"
          />
          <button
            type="button"
            onClick={() => updateTheme('violet')}
            className={`w-3.5 h-3.5 rounded-full bg-purple-600 transition-all ${
              activeTheme === 'violet' ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-surface scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            title="Amethyst Multiplier"
          />
        </div>
        <div className="w-px h-3 bg-outline-variant/40 mx-0.5" />
        <button
          type="button"
          onClick={toggleWireframe}
          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold transition-all ${
            wireframeMode ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          {wireframeMode ? 'SOLID' : 'WIRE'}
        </button>
      </div>
    </div>
  );
};
