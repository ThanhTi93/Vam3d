"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// 3D Floating Mesh with mouse interaction
function FloatingCinemaRing({ hoverColor = "#f97316", defaultColor = "#3b82f6" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smoothly rotate the shape
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.01;

    // Follow mouse position slightly for parallax effect
    const targetX = mouse.x * 1.5;
    const targetY = mouse.y * 1.5;
    
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.4 : 1.2}
        castShadow
      >
        {/* Torus Knot representing an abstract 3D film reel / loop */}
        <torusKnotGeometry args={[1, 0.35, 120, 16]} />
        <MeshDistortMaterial
          color={hovered ? hoverColor : defaultColor}
          roughness={0.1}
          metalness={0.9}
          distort={0.4}
          speed={3}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
}

// Additional decorative floating items in the background
function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y -= 0.002;
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 15 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 15;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10 - 2;
        const size = Math.random() * 0.2 + 0.05;

        return (
          <Float key={i} speed={1 + Math.random()} floatIntensity={1}>
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#f97316" : "#f59e0b"}
                emissive={i % 2 === 0 ? "#f97316" : "#f59e0b"}
                emissiveIntensity={0.5}
                roughness={0.2}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  override state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.error("ThreeJS Canvas Error caught by boundary:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function ThreeCanvas() {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL Context Lost detected. Falling back to CSS glow placeholder.");
      setHasError(true);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [mounted]);

  const fallbackUI = (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {/* Placeholder glow matching the theme during loading / context loss */}
      <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 opacity-20 blur-3xl animate-pulse" />
    </div>
  );

  if (!mounted || hasError) {
    return fallbackUI;
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      {/* Background radial gradient to blend 3D canvas smoothly */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-10" />

      <CanvasErrorBoundary fallback={fallbackUI}>
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-10, 10, -5]} intensity={1} color="#f97316" />
          <directionalLight position={[5, -5, 5]} intensity={0.8} color="#3b82f6" />

          {/* Dynamic 3D Stars background */}
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={1.5} />

          {/* Interactive 3D film reel / torus knot */}
          <FloatingCinemaRing hoverColor="#f97316" defaultColor="#ea580c" />

          {/* Small floating points / orbs */}
          <FloatingOrbs />

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
