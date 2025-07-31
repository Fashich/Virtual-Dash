import React, { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Sphere,
  Stars,
  OrbitControls,
  Points,
  PointMaterial,
  Trail,
  Sparkles as DreiSparkles,
} from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import {
  Play,
  Trophy,
  Coins,
  Diamond,
  Zap,
  Users,
  Gamepad2,
  Wallet,
  BookOpen,
  UserPlus,
  Rocket,
  Sparkles,
} from "lucide-react";

// Professional Multi-Stage Camera Controller
function CameraController() {
  const { camera } = useThree();
  const { theme, pendingTheme, cameraReachedGround } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [hasReachedGround, setHasReachedGround] = useState(false);
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  // Use pendingTheme for animation direction, actual theme for final state
  const animationTarget = pendingTheme || theme;

  // Multi-stage spring animation with precise timing
  const { progress } = useSpring({
    progress: animationTarget === "light" ? 1 : 0,
    config: {
      tension: 20,
      friction: 50,
      mass: 3,
      duration: 8000, // 8 second cinematic sequence for more realistic landing
    },
    onStart: () => {
      setIsTransitioning(true);
      setAnimationStage(0);
      setHasReachedGround(false);
    },
    onRest: () => {
      setIsTransitioning(false);
      setAnimationStage(animationTarget === "light" ? 3 : 0);
    },
  });

  useFrame(() => {
    const t = progress.get();

    // Define animation stages with more precise timing
    let stage1T = 0; // Space view (0-0.25)
    let stage2T = 0; // Zoom to Earth (0.25-0.65)
    let stage3T = 0; // Land and settle (0.65-0.9)
    let stage4T = 0; // Look up at sky (0.9-1.0)

    if (t <= 0.25) {
      stage1T = t / 0.25;
      setAnimationStage(1);
    } else if (t <= 0.65) {
      stage1T = 1;
      stage2T = (t - 0.25) / 0.4;
      setAnimationStage(2);
    } else if (t <= 0.9) {
      stage1T = 1;
      stage2T = 1;
      stage3T = (t - 0.65) / 0.25;
      setAnimationStage(3);
    } else {
      stage1T = 1;
      stage2T = 1;
      stage3T = 1;
      stage4T = (t - 0.9) / 0.1;
      setAnimationStage(4);
    }

    // Check if camera has reached ground for light theme transition
    if (animationTarget === "light" && stage3T >= 0.8 && !hasReachedGround) {
      setHasReachedGround(true);
      cameraReachedGround();
    }

    // Smooth easing functions
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeIn = (t: number) => t * t * t;

    if (animationTarget === "light") {
      // Going to light theme - precise 4-stage animation
      if (stage1T < 1) {
        // Stage 1: Begin approach from space
        const easedT1 = easeInOut(stage1T);
        const spacePos = new THREE.Vector3(0, 0, 25);
        const approachPos = new THREE.Vector3(0, 8, 18);
        targetPosition.current.lerpVectors(spacePos, approachPos, easedT1);

        const earthCenter = new THREE.Vector3(20, 5, -30);
        currentLookAt.current.lerp(earthCenter, 0.02);
        camera.fov = THREE.MathUtils.lerp(75, 85, easedT1);
      } else if (stage2T < 1) {
        // Stage 2: Dramatic zoom toward Earth surface
        const easedT2 = easeIn(stage2T);
        const approachPos = new THREE.Vector3(0, 8, 18);
        const closePos = new THREE.Vector3(12, 10, -8);
        targetPosition.current.lerpVectors(approachPos, closePos, easedT2);

        const earthCenter = new THREE.Vector3(20, 5, -30);
        const surfaceView = new THREE.Vector3(18, 8, -20);
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(earthCenter, surfaceView, easedT2);
        currentLookAt.current.lerp(lookTarget, 0.03);
        camera.fov = THREE.MathUtils.lerp(85, 105, easedT2);
      } else if (stage3T < 1) {
        // Stage 3: Final landing and settle on ground
        const easedT3 = easeOut(stage3T);
        const closePos = new THREE.Vector3(12, 10, -8);
        const groundPos = new THREE.Vector3(0, 1.5, 10); // Lower to ground level
        targetPosition.current.lerpVectors(closePos, groundPos, easedT3);

        const surfaceView = new THREE.Vector3(18, 8, -20);
        const groundView = new THREE.Vector3(0, 1.5, 5); // Look slightly ahead on ground
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(surfaceView, groundView, easedT3);
        currentLookAt.current.lerp(lookTarget, 0.04);
        camera.fov = THREE.MathUtils.lerp(105, 95, easedT3);
      } else {
        // Stage 4: Look up at sky (only after theme has changed)
        const easedT4 = easeOut(stage4T);
        const groundPos = new THREE.Vector3(0, 1.5, 10);
        targetPosition.current.copy(groundPos);

        const groundView = new THREE.Vector3(0, 1.5, 5);
        const skyView = new THREE.Vector3(0, 50, 0);
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(groundView, skyView, easedT4);
        currentLookAt.current.lerp(lookTarget, 0.05);
        camera.fov = THREE.MathUtils.lerp(95, 90, easedT4);
      }
    } else {
      // Going to dark theme - smooth reverse with gradient effects
      const reverseT = 1 - t;

      if (reverseT > 0.75) {
        // Reverse stage 4: Look down from sky to ground
        const stageT = (reverseT - 0.75) / 0.25;
        const easedT = easeOut(stageT);
        const groundPos = new THREE.Vector3(0, 1.5, 10);
        targetPosition.current.copy(groundPos);

        const skyView = new THREE.Vector3(0, 50, 0);
        const groundView = new THREE.Vector3(0, 1.5, 5);
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(skyView, groundView, easedT);
        currentLookAt.current.lerp(lookTarget, 0.05);
        camera.fov = THREE.MathUtils.lerp(90, 95, easedT);
      } else if (reverseT > 0.35) {
        // Reverse stage 3: Lift off from ground
        const stageT = (reverseT - 0.35) / 0.4;
        const easedT = easeInOut(stageT);
        const groundPos = new THREE.Vector3(0, 1.5, 10);
        const closePos = new THREE.Vector3(12, 10, -8);
        targetPosition.current.lerpVectors(groundPos, closePos, easedT);

        const groundView = new THREE.Vector3(0, 1.5, 5);
        const surfaceView = new THREE.Vector3(18, 8, -20);
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(groundView, surfaceView, easedT);
        currentLookAt.current.lerp(lookTarget, 0.04);
        camera.fov = THREE.MathUtils.lerp(95, 105, easedT);
      } else if (reverseT > 0.15) {
        // Reverse stage 2: Zoom out from Earth with gradient
        const stageT = (reverseT - 0.15) / 0.2;
        const easedT = easeInOut(stageT);
        const closePos = new THREE.Vector3(12, 10, -8);
        const approachPos = new THREE.Vector3(0, 8, 18);
        targetPosition.current.lerpVectors(closePos, approachPos, easedT);

        const surfaceView = new THREE.Vector3(18, 8, -20);
        const earthCenter = new THREE.Vector3(20, 5, -30);
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(surfaceView, earthCenter, easedT);
        currentLookAt.current.lerp(lookTarget, 0.03);
        camera.fov = THREE.MathUtils.lerp(105, 85, easedT);
      } else {
        // Reverse stage 1: Return to original space position
        const stageT = reverseT / 0.15;
        const easedT = easeIn(stageT);
        const approachPos = new THREE.Vector3(0, 8, 18);
        const spacePos = new THREE.Vector3(0, 0, 25);
        targetPosition.current.lerpVectors(approachPos, spacePos, easedT);

        const earthCenter = new THREE.Vector3(20, 5, -30);
        const spaceCenter = new THREE.Vector3(0, 0, 0);
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(earthCenter, spaceCenter, easedT);
        currentLookAt.current.lerp(lookTarget, 0.02);
        camera.fov = THREE.MathUtils.lerp(85, 75, easedT);
      }
    }

    // Apply camera transformations
    camera.position.copy(targetPosition.current);
    camera.lookAt(currentLookAt.current);
    camera.updateProjectionMatrix();
  });

  return null;
}

// Realistic 3D Clouds positioned for ground-up view
function RealisticClouds() {
  const { theme } = useTheme();
  const cloudsGroupRef = useRef<THREE.Group>(null);

  // Position clouds above for sky view
  const cloudLayers = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 120, // Wider spread
        25 + Math.random() * 40, // Much higher up in the sky
        (Math.random() - 0.5) * 120, // Wider depth
      ] as [number, number, number],
      scale: 1.2 + Math.random() * 3.5,
      speed: 0.001 + Math.random() * 0.005,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, []);

  useFrame((state) => {
    if (cloudsGroupRef.current && theme === "light") {
      cloudsGroupRef.current.children.forEach((cloud, index) => {
        const layer = cloudLayers[index];
        if (cloud && layer) {
          cloud.position.x += layer.speed;
          if (cloud.position.x > 60) {
            cloud.position.x = -60;
          }
          cloud.rotation.y = state.clock.elapsedTime * 0.0005;
        }
      });
    }
  });

  if (theme !== "light") return null;

  return (
    <group ref={cloudsGroupRef}>
      {cloudLayers.map((layer) => (
        <RealisticCloud
          key={layer.id}
          position={layer.position}
          scale={layer.scale}
          opacity={layer.opacity}
        />
      ))}
    </group>
  );
}

// Individual Realistic Cloud Component
function RealisticCloud({
  position,
  scale,
  opacity,
}: {
  position: [number, number, number];
  scale: number;
  opacity: number;
}) {
  const cloudRef = useRef<THREE.Group>(null);

  const cloudMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(1.0, 1.0, 1.0),
      transparent: true,
      opacity: opacity,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
  }, [opacity]);

  useFrame((state) => {
    if (cloudRef.current) {
      // Gentle floating animation
      cloudRef.current.position.y =
        position[1] +
        Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.8;
      cloudRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {/* Main cloud body - irregular cluster of spheres */}
      <mesh material={cloudMaterial} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 12, 8]} />
      </mesh>
      <mesh material={cloudMaterial} position={[1.2, 0.3, 0.2]}>
        <sphereGeometry args={[1.2, 12, 8]} />
      </mesh>
      <mesh material={cloudMaterial} position={[-0.8, 0.1, -0.3]}>
        <sphereGeometry args={[1.0, 12, 8]} />
      </mesh>
      <mesh material={cloudMaterial} position={[0.5, -0.2, 0.8]}>
        <sphereGeometry args={[0.8, 12, 8]} />
      </mesh>
      <mesh material={cloudMaterial} position={[-1.1, -0.1, 0.5]}>
        <sphereGeometry args={[0.9, 12, 8]} />
      </mesh>
      <mesh material={cloudMaterial} position={[2.0, -0.2, -0.1]}>
        <sphereGeometry args={[0.7, 12, 8]} />
      </mesh>

      {/* Wispy edges */}
      <mesh material={cloudMaterial} position={[2.5, 0.1, 0.3]}>
        <sphereGeometry args={[0.4, 8, 6]} />
      </mesh>
      <mesh material={cloudMaterial} position={[-1.8, 0.2, -0.2]}>
        <sphereGeometry args={[0.5, 8, 6]} />
      </mesh>
    </group>
  );
}

// Enhanced Atmospheric Sky for Ground View
function AtmosphericSky() {
  const { theme } = useTheme();
  const skyRef = useRef<THREE.Mesh>(null);
  const sunGlowRef = useRef<THREE.Mesh>(null);

  const skyMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="1024" height="512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style="stop-color:#87CEEB"/>
              <stop offset="20%" style="stop-color:#87CEFA"/>
              <stop offset="50%" style="stop-color:#B0E0E6"/>
              <stop offset="80%" style="stop-color:#E6F3FF"/>
              <stop offset="100%" style="stop-color:#F0F8FF"/>
            </linearGradient>
            <radialGradient id="sunGlow" cx="20%" cy="20%">
              <stop offset="0%" style="stop-color:rgba(255,255,224,0.8)"/>
              <stop offset="30%" style="stop-color:rgba(255,255,224,0.4)"/>
              <stop offset="70%" style="stop-color:rgba(255,255,224,0.1)"/>
              <stop offset="100%" style="stop-color:rgba(255,255,224,0)"/>
            </radialGradient>
          </defs>
          <rect width="1024" height="512" fill="url(#skyGradient)"/>
          <ellipse cx="200" cy="100" rx="150" ry="80" fill="url(#sunGlow)"/>
        </svg>
      `),
      ),
      side: THREE.BackSide,
      transparent: true,
      opacity: theme === "light" ? 1.0 : 0.0,
    });
  }, [theme]);

  useFrame((state) => {
    if (skyRef.current) {
      skyRef.current.material.opacity = theme === "light" ? 1.0 : 0.0;
    }
    if (sunGlowRef.current && theme === "light") {
      sunGlowRef.current.material.opacity =
        0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <>
      {/* Sky Dome */}
      <mesh ref={skyRef} material={skyMaterial}>
        <sphereGeometry args={[150, 32, 16]} />
      </mesh>

      {/* Sun Atmospheric Glow */}
      {theme === "light" && (
        <mesh ref={sunGlowRef} position={[-40, 60, -20]}>
          <sphereGeometry args={[15, 16, 16]} />
          <meshBasicMaterial
            color={new THREE.Color(1.0, 1.0, 0.8)}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </>
  );
}

// Professional Realistic Earth Surface
function EarthSurface() {
  const { theme } = useTheme();
  const groundRef = useRef<THREE.Mesh>(null);
  const horizonRef = useRef<THREE.Mesh>(null);
  const detailGroundRef = useRef<THREE.Mesh>(null);

  // Enhanced realistic ground material with detailed textures
  const groundMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64=" +
          btoa(`
        <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="richEarth" cx="50%" cy="50%">
              <stop offset="0%" style="stop-color:#3a5f3a"/>
              <stop offset="30%" style="stop-color:#2d4f2d"/>
              <stop offset="60%" style="stop-color:#1e3a1e"/>
              <stop offset="100%" style="stop-color:#0f240f"/>
            </radialGradient>
            <linearGradient id="grassPatch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4a7c4a"/>
              <stop offset="50%" style="stop-color:#5d8a5d"/>
              <stop offset="100%" style="stop-color:#70a070"/>
            </linearGradient>
            <radialGradient id="dirtPatch" cx="60%" cy="40%">
              <stop offset="0%" style="stop-color:#8b6f47"/>
              <stop offset="50%" style="stop-color:#705440"/>
              <stop offset="100%" style="stop-color:#523d2a"/>
            </radialGradient>
          </defs>

          <!-- Rich earth base -->
          <rect width="1024" height="1024" fill="url(#richEarth)"/>

          <!-- Grass patches -->
          <ellipse cx="200" cy="300" rx="120" ry="80" fill="url(#grassPatch)" opacity="0.8"/>
          <ellipse cx="600" cy="200" rx="100" ry="90" fill="url(#grassPatch)" opacity="0.7"/>
          <ellipse cx="800" cy="500" rx="90" ry="70" fill="url(#grassPatch)" opacity="0.8"/>
          <ellipse cx="300" cy="700" rx="110" ry="85" fill="url(#grassPatch)" opacity="0.75"/>

          <!-- Dirt and rock patches -->
          <ellipse cx="400" cy="150" rx="60" ry="40" fill="url(#dirtPatch)" opacity="0.6"/>
          <ellipse cx="150" cy="600" rx="50" ry="35" fill="url(#dirtPatch)" opacity="0.7"/>
          <ellipse cx="700" cy="350" rx="45" ry="30" fill="url(#dirtPatch)" opacity="0.5"/>

          <!-- Small grass tufts -->
          <circle cx="180" cy="250" r="8" fill="#6bb26b" opacity="0.9"/>
          <circle cx="350" cy="320" r="6" fill="#6bb26b" opacity="0.8"/>
          <circle cx="650" cy="180" r="7" fill="#6bb26b" opacity="0.85"/>
          <circle cx="750" cy="450" r="9" fill="#6bb26b" opacity="0.9"/>
          <circle cx="280" cy="650" r="5" fill="#6bb26b" opacity="0.8"/>
          <circle cx="850" cy="600" r="6" fill="#6bb26b" opacity="0.85"/>

          <!-- Small rocks and pebbles -->
          <circle cx="120" cy="400" r="4" fill="#606060" opacity="0.7"/>
          <circle cx="480" cy="280" r="3" fill="#707070" opacity="0.6"/>
          <circle cx="720" cy="720" r="5" fill="#656565" opacity="0.8"/>
          <circle cx="350" cy="500" r="3" fill="#606060" opacity="0.7"/>

          <!-- Natural wear patterns -->
          <path d="M100 200 Q300 180 500 200 Q700 220 900 200" stroke="#4a5f4a" stroke-width="3" fill="none" opacity="0.3"/>
          <path d="M150 600 Q400 580 650 600 Q800 620 950 600" stroke="#4a5f4a" stroke-width="2" fill="none" opacity="0.4"/>
        </svg>
      `),
      ),
      color: new THREE.Color(0.4, 0.7, 0.4),
      transparent: true,
      opacity: theme === "light" ? 1.0 : 0.0,
      roughness: 0.8,
    });
  }, [theme]);

  const horizonMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="1024" height="128" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="horizon" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#87CEEB"/>
              <stop offset="50%" style="stop-color:#B0E0E6"/>
              <stop offset="100%" style="stop-color:#228B22"/>
            </linearGradient>
          </defs>
          <rect width="1024" height="128" fill="url(#horizon)"/>

          <!-- Distant hills silhouette -->
          <path d="M0 100 Q200 80 400 90 Q600 85 800 95 Q900 90 1024 100 L1024 128 L0 128 Z" fill="#2F4F4F" opacity="0.6"/>
          <path d="M0 110 Q150 95 300 105 Q500 100 700 108 Q850 105 1024 110 L1024 128 L0 128 Z" fill="#2F4F4F" opacity="0.4"/>
        </svg>
      `),
      ),
      transparent: true,
      opacity: theme === "light" ? 0.8 : 0.0,
      side: THREE.DoubleSide,
    });
  }, [theme]);

  useFrame(() => {
    if (groundRef.current) {
      groundRef.current.material.opacity = theme === "light" ? 1.0 : 0.0;
    }
    if (horizonRef.current) {
      horizonRef.current.material.opacity = theme === "light" ? 0.8 : 0.0;
    }
  });

  if (theme !== "light") return null;

  return (
    <>
      {/* Main Ground Plane - More realistic positioning */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={groundMaterial}
      >
        <planeGeometry args={[300, 300, 32, 32]} />
      </mesh>

      {/* Detailed Ground Area around camera */}
      <mesh
        ref={detailGroundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.1, 0]}
        material={groundMaterial}
      >
        <planeGeometry args={[50, 50, 16, 16]} />
      </mesh>

      {/* Enhanced Horizon Ring */}
      <mesh ref={horizonRef} position={[0, 25, 0]} material={horizonMaterial}>
        <cylinderGeometry args={[120, 120, 30, 64, 1, true]} />
      </mesh>
    </>
  );
}

// Realistic Earth Component
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const nightLightsRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  // Create highly realistic Earth materials
  const earthMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="1024" height="512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ocean" cx="50%" cy="50%">
              <stop offset="0%" style="stop-color:#0077be"/>
              <stop offset="40%" style="stop-color:#005fa3"/>
              <stop offset="80%" style="stop-color:#003d6b"/>
              <stop offset="100%" style="stop-color:#002347"/>
            </radialGradient>
            <linearGradient id="landmass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#228B22"/>
              <stop offset="30%" style="stop-color:#32CD32"/>
              <stop offset="60%" style="stop-color:#9ACD32"/>
              <stop offset="80%" style="stop-color:#8B4513"/>
              <stop offset="100%" style="stop-color:#654321"/>
            </linearGradient>
            <radialGradient id="forest" cx="40%" cy="30%">
              <stop offset="0%" style="stop-color:#006400"/>
              <stop offset="50%" style="stop-color:#228B22"/>
              <stop offset="100%" style="stop-color:#2F4F2F"/>
            </radialGradient>
            <radialGradient id="desert" cx="60%" cy="70%">
              <stop offset="0%" style="stop-color:#F4A460"/>
              <stop offset="50%" style="stop-color:#D2691E"/>
              <stop offset="100%" style="stop-color:#A0522D"/>
            </radialGradient>
          </defs>
          
          <!-- Ocean base -->
          <rect width="1024" height="512" fill="url(#ocean)"/>
          
          <!-- Africa & Europe -->
          <path d="M400 120 Q420 100 450 110 Q480 120 500 140 Q520 160 530 200 Q540 250 520 300 Q500 350 480 380 Q460 400 440 390 Q420 380 400 360 Q380 340 370 300 Q360 250 370 200 Q380 160 400 120 Z" fill="url(#landmass)"/>
          
          <!-- North America -->
          <path d="M100 80 Q150 60 200 70 Q250 80 280 120 Q300 160 290 200 Q280 240 250 260 Q220 280 180 270 Q140 260 110 220 Q80 180 90 140 Q100 100 100 80 Z" fill="url(#forest)"/>
          
          <!-- South America -->
          <path d="M180 280 Q200 270 220 280 Q240 300 250 340 Q260 380 250 420 Q240 460 220 480 Q200 490 180 480 Q160 470 150 440 Q140 400 150 360 Q160 320 180 280 Z" fill="url(#forest)"/>
          
          <!-- Asia -->
          <path d="M550 90 Q600 70 650 80 Q700 90 750 120 Q800 150 820 190 Q840 230 830 270 Q820 310 800 340 Q780 360 750 350 Q720 340 690 320 Q660 300 630 270 Q600 240 580 200 Q560 160 550 120 Q540 100 550 90 Z" fill="url(#landmass)"/>
          
          <!-- Australia -->
          <path d="M700 360 Q730 350 760 360 Q790 370 800 390 Q810 410 800 430 Q790 450 760 460 Q730 470 700 460 Q670 450 660 430 Q650 410 660 390 Q670 370 700 360 Z" fill="url(#desert)"/>
          
          <!-- Greenland -->
          <ellipse cx="150" cy="40" rx="30" ry="20" fill="#F0F8FF"/>
          
          <!-- Antarctic -->
          <rect x="0" y="480" width="1024" height="32" fill="#F0F8FF"/>
          
          <!-- Additional forest areas -->
          <ellipse cx="650" cy="180" rx="40" ry="25" fill="url(#forest)"/>
          <ellipse cx="200" cy="400" rx="35" ry="60" fill="url(#forest)"/>
          
          <!-- Desert areas -->
          <ellipse cx="480" cy="200" rx="30" ry="20" fill="url(#desert)"/>
          <ellipse cx="580" cy="160" rx="25" ry="15" fill="url(#desert)"/>
        </svg>
      `),
      ),
      normalMap: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="1024" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="1024" height="512" fill="#8080FF"/>
          <circle cx="200" cy="150" r="40" fill="#9090FF"/>
          <circle cx="450" cy="200" r="60" fill="#9090FF"/>
          <circle cx="650" cy="180" r="50" fill="#9090FF"/>
          <circle cx="750" cy="380" r="35" fill="#9090FF"/>
        </svg>
      `),
      ),
      shininess: 30,
      specular: new THREE.Color(0.2, 0.4, 0.8),
      transparent: false,
    });
    material.map!.wrapS = THREE.RepeatWrapping;
    material.map!.wrapT = THREE.RepeatWrapping;
    material.normalMap!.wrapS = THREE.RepeatWrapping;
    material.normalMap!.wrapT = THREE.RepeatWrapping;
    return material;
  }, []);

  const cloudMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="1024" height="512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur">
              <feGaussianBlur stdDeviation="3"/>
            </filter>
            <radialGradient id="cloud1" cx="50%" cy="50%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.8)"/>
              <stop offset="60%" style="stop-color:rgba(255,255,255,0.4)"/>
              <stop offset="100%" style="stop-color:rgba(255,255,255,0.1)"/>
            </radialGradient>
            <radialGradient id="cloud2" cx="40%" cy="60%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.7)"/>
              <stop offset="50%" style="stop-color:rgba(255,255,255,0.3)"/>
              <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)"/>
            </radialGradient>
          </defs>
          <rect width="1024" height="512" fill="transparent"/>
          
          <!-- Storm systems -->
          <ellipse cx="150" cy="80" rx="120" ry="40" fill="url(#cloud1)" filter="url(#blur)"/>
          <ellipse cx="350" cy="140" rx="100" ry="35" fill="url(#cloud2)" filter="url(#blur)"/>
          <ellipse cx="600" cy="90" rx="90" ry="30" fill="url(#cloud1)" filter="url(#blur)"/>
          <ellipse cx="800" cy="160" rx="110" ry="45" fill="url(#cloud2)" filter="url(#blur)"/>
          
          <!-- Tropical clouds -->
          <ellipse cx="200" cy="250" rx="80" ry="25" fill="url(#cloud1)" filter="url(#blur)"/>
          <ellipse cx="450" cy="280" rx="95" ry="30" fill="url(#cloud2)" filter="url(#blur)"/>
          <ellipse cx="700" cy="320" rx="85" ry="28" fill="url(#cloud1)" filter="url(#blur)"/>
          
          <!-- Polar clouds -->
          <ellipse cx="100" cy="40" rx="60" ry="20" fill="rgba(255,255,255,0.9)" filter="url(#blur)"/>
          <ellipse cx="900" cy="50" rx="70" ry="25" fill="rgba(255,255,255,0.8)" filter="url(#blur)"/>
          
          <!-- Scattered clouds -->
          <circle cx="300" cy="200" r="30" fill="rgba(255,255,255,0.4)" filter="url(#blur)"/>
          <circle cx="550" cy="240" r="25" fill="rgba(255,255,255,0.5)" filter="url(#blur)"/>
          <circle cx="750" cy="200" r="35" fill="rgba(255,255,255,0.3)" filter="url(#blur)"/>
          <circle cx="120" cy="300" r="40" fill="rgba(255,255,255,0.6)" filter="url(#blur)"/>
        </svg>
      `),
      ),
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
  }, []);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.4, 0.7, 1.0),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const nightLightsMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="1024" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="1024" height="512" fill="#000000"/>
          
          <!-- City lights - North America -->
          <circle cx="150" cy="120" r="2" fill="#FFD700"/>
          <circle cx="180" cy="140" r="1.5" fill="#FFD700"/>
          <circle cx="200" cy="130" r="1" fill="#FFA500"/>
          <circle cx="220" cy="150" r="2" fill="#FFD700"/>
          
          <!-- City lights - Europe -->
          <circle cx="420" cy="100" r="1.5" fill="#FFD700"/>
          <circle cx="440" cy="110" r="1" fill="#FFA500"/>
          <circle cx="460" cy="105" r="1.5" fill="#FFD700"/>
          
          <!-- City lights - Asia -->
          <circle cx="620" cy="120" r="2" fill="#FFD700"/>
          <circle cx="650" cy="140" r="1.5" fill="#FFD700"/>
          <circle cx="680" cy="130" r="1" fill="#FFA500"/>
          <circle cx="720" cy="150" r="2" fill="#FFD700"/>
          
          <!-- Smaller settlements -->
          <circle cx="250" cy="300" r="1" fill="#FFA500"/>
          <circle cx="500" cy="250" r="1" fill="#FFA500"/>
          <circle cx="750" cy="350" r="1" fill="#FFA500"/>
        </svg>
      `),
      ),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
    if (nightLightsRef.current) {
      nightLightsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  // Hide Earth when in light theme (we're on Earth, not viewing it)
  if (theme === "light") return null;

  return (
    <group position={[20, 5, -30]}>
      {/* Earth Core */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[6, 128, 64]} />
      </mesh>

      {/* Night Lights */}
      <mesh ref={nightLightsRef} material={nightLightsMaterial}>
        <sphereGeometry args={[6.02, 64, 32]} />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudsRef} material={cloudMaterial}>
        <sphereGeometry args={[6.15, 64, 32]} />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[6.8, 32, 16]} />
      </mesh>
    </group>
  );
}

// Realistic Moon Component
function Moon() {
  const moonRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  const moonMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="256" height="128" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="moon" cx="40%" cy="40%">
              <stop offset="0%" style="stop-color:#e6e6e6"/>
              <stop offset="70%" style="stop-color:#cccccc"/>
              <stop offset="100%" style="stop-color:#999999"/>
            </radialGradient>
          </defs>
          <rect width="256" height="128" fill="url(#moon)"/>
          <circle cx="60" cy="40" r="8" fill="#aaaaaa"/>
          <circle cx="120" cy="70" r="12" fill="#aaaaaa"/>
          <circle cx="180" cy="35" r="6" fill="#aaaaaa"/>
          <circle cx="200" cy="80" r="10" fill="#aaaaaa"/>
          <circle cx="40" cy="90" r="5" fill="#aaaaaa"/>
        </svg>
      `),
      ),
      shininess: 30,
      transparent: true,
    });
  }, []);

  useFrame((state) => {
    if (moonRef.current) {
      const earthPosition = [20, 5, -30];
      const orbitRadius = 15;
      const orbitSpeed = 0.02;

      moonRef.current.position.x =
        earthPosition[0] +
        Math.cos(state.clock.elapsedTime * orbitSpeed) * orbitRadius;
      moonRef.current.position.y =
        earthPosition[1] +
        Math.sin(state.clock.elapsedTime * orbitSpeed * 0.5) * 3;
      moonRef.current.position.z =
        earthPosition[2] +
        Math.sin(state.clock.elapsedTime * orbitSpeed) * orbitRadius;

      moonRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  // Hide Moon when in light theme (we're on Earth, not viewing it from space)
  if (theme === "light") return null;

  return (
    <mesh ref={moonRef} material={moonMaterial}>
      <sphereGeometry args={[1.8, 32, 32]} />
    </mesh>
  );
}

// Highly Realistic Sun Component
function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const flareRef1 = useRef<THREE.Mesh>(null);
  const flareRef2 = useRef<THREE.Mesh>(null);
  const chromosphereRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  // Realistic Sun surface material
  const sunMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="512" height="256" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sunCore" cx="50%" cy="50%">
              <stop offset="0%" style="stop-color:#FFF8DC"/>
              <stop offset="20%" style="stop-color:#FFD700"/>
              <stop offset="40%" style="stop-color:#FFA500"/>
              <stop offset="60%" style="stop-color:#FF8C00"/>
              <stop offset="80%" style="stop-color:#FF6347"/>
              <stop offset="100%" style="stop-color:#FF4500"/>
            </radialGradient>
            <radialGradient id="sunspot1" cx="30%" cy="40%">
              <stop offset="0%" style="stop-color:#8B0000"/>
              <stop offset="50%" style="stop-color:#B22222"/>
              <stop offset="100%" style="stop-color:#FF4500"/>
            </radialGradient>
            <radialGradient id="sunspot2" cx="70%" cy="60%">
              <stop offset="0%" style="stop-color:#8B0000"/>
              <stop offset="40%" style="stop-color:#B22222"/>
              <stop offset="100%" style="stop-color:#FF6347"/>
            </radialGradient>
          </defs>
          
          <!-- Solar surface -->
          <rect width="512" height="256" fill="url(#sunCore)"/>
          
          <!-- Solar granulation pattern -->
          <circle cx="100" cy="80" r="15" fill="#FFB347" opacity="0.6"/>
          <circle cx="200" cy="120" r="20" fill="#FFCCCB" opacity="0.5"/>
          <circle cx="350" cy="90" r="18" fill="#FFB347" opacity="0.7"/>
          <circle cx="450" cy="140" r="12" fill="#FFCCCB" opacity="0.6"/>
          <circle cx="80" cy="180" r="16" fill="#FFB347" opacity="0.5"/>
          <circle cx="280" cy="200" r="22" fill="#FFCCCB" opacity="0.6"/>
          
          <!-- Sunspots -->
          <ellipse cx="150" cy="100" rx="8" ry="12" fill="url(#sunspot1)"/>
          <ellipse cx="380" cy="160" rx="6" ry="9" fill="url(#sunspot2)"/>
          
          <!-- Solar flares/prominences -->
          <path d="M480 100 Q490 80 500 90 Q510 100 500 110 Q490 120 480 100" fill="#FF69B4" opacity="0.8"/>
          <path d="M50 150 Q40 130 30 140 Q20 150 30 160 Q40 170 50 150" fill="#FF1493" opacity="0.7"/>
        </svg>
      `),
      ),
      color: new THREE.Color(1.0, 0.9, 0.8),
      emissive: new THREE.Color(1.0, 0.6, 0.2),
      emissiveIntensity: theme === "light" ? 0.8 : 1.5,
    });
  }, [theme]);

  // Chromosphere layer
  const chromosphereMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.3, 0.1),
      transparent: true,
      opacity: theme === "light" ? 0.2 : 0.4,
      blending: THREE.AdditiveBlending,
    });
  }, [theme]);

  // Corona material with realistic solar wind effect
  const coronaMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(
        "data:image/svg+xml;base64," +
          btoa(`
        <svg width="256" height="128" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="corona" cx="50%" cy="50%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)"/>
              <stop offset="30%" style="stop-color:rgba(255,215,0,0.3)"/>
              <stop offset="60%" style="stop-color:rgba(255,165,0,0.2)"/>
              <stop offset="100%" style="stop-color:rgba(255,69,0,0.05)"/>
            </radialGradient>
          </defs>
          <rect width="256" height="128" fill="url(#corona)"/>
          
          <!-- Solar wind streams -->
          <path d="M20 64 Q50 50 80 64 Q110 78 140 64 Q170 50 200 64 Q230 78 256 64" 
                stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
          <path d="M0 40 Q30 30 60 40 Q90 50 120 40 Q150 30 180 40 Q210 50 240 40" 
                stroke="rgba(255,215,0,0.15)" stroke-width="1.5" fill="none"/>
          <path d="M0 88 Q30 98 60 88 Q90 78 120 88 Q150 98 180 88 Q210 78 240 88" 
                stroke="rgba(255,165,0,0.1)" stroke-width="1" fill="none"/>
        </svg>
      `),
      ),
      transparent: true,
      opacity: theme === "light" ? 0.3 : 0.6,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }, [theme]);

  // Solar flare materials
  const flareMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.4, 0.6),
      transparent: true,
      opacity: theme === "light" ? 0.4 : 0.8,
      blending: THREE.AdditiveBlending,
    });
  }, [theme]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.003;
      const solarPulse = 1 + Math.sin(time * 0.5) * 0.02;
      sunRef.current.scale.setScalar(solarPulse);
    }

    if (chromosphereRef.current) {
      chromosphereRef.current.rotation.y = time * 0.005;
      const chromoPulse = 1 + Math.sin(time * 0.8) * 0.03;
      chromosphereRef.current.scale.setScalar(chromoPulse);
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.y = -time * 0.001;
      coronaRef.current.rotation.z = time * 0.002;
      const coronaPulse = 1 + Math.sin(time * 0.3) * 0.05;
      coronaRef.current.scale.setScalar(coronaPulse);
    }

    if (flareRef1.current) {
      flareRef1.current.rotation.z = time * 2;
      flareRef1.current.scale.setScalar(1 + Math.sin(time * 3) * 0.3);
    }

    if (flareRef2.current) {
      flareRef2.current.rotation.z = -time * 1.5;
      flareRef2.current.scale.setScalar(1 + Math.cos(time * 2.5) * 0.2);
    }
  });

  // Position sun in the sky for ground view
  const sunPosition = theme === "light" ? [-40, 60, -20] : [-70, 25, -90];

  return (
    <group position={sunPosition}>
      {/* Sun Core */}
      <mesh ref={sunRef} material={sunMaterial}>
        <sphereGeometry args={[12, 64, 32]} />
      </mesh>

      {/* Chromosphere */}
      <mesh ref={chromosphereRef} material={chromosphereMaterial}>
        <sphereGeometry args={[12.5, 32, 16]} />
      </mesh>

      {/* Corona */}
      <mesh ref={coronaRef} material={coronaMaterial}>
        <sphereGeometry args={[18, 32, 16]} />
      </mesh>

      {/* Solar Flares */}
      <mesh ref={flareRef1} material={flareMaterial} position={[0, 8, 0]}>
        <coneGeometry args={[2, 6, 8]} />
      </mesh>
      <mesh
        ref={flareRef2}
        material={flareMaterial}
        position={[0, -8, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[1.5, 4, 8]} />
      </mesh>

      {/* Dynamic Sun Light */}
      <pointLight
        intensity={theme === "light" ? 4.0 : 3.5}
        color={new THREE.Color(1.0, 0.95, 0.8)}
        distance={300}
        decay={1.2}
      />

      {/* Secondary warm light */}
      <pointLight
        position={[5, 0, 0]}
        intensity={theme === "light" ? 1.5 : 1.2}
        color={new THREE.Color(1.0, 0.7, 0.4)}
        distance={150}
        decay={1.8}
      />

      {/* Directional sunlight for ground view */}
      {theme === "light" && (
        <directionalLight
          position={[-40, 60, -20]}
          intensity={2.0}
          color={new THREE.Color(1.0, 0.98, 0.9)}
          castShadow
        />
      )}
    </group>
  );
}

// Meteor Shower Component (only in dark theme)
function MeteorShower() {
  const { theme } = useTheme();

  // No meteors in light theme at all
  if (theme === "light") return null;

  const meteors = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      startPosition: [
        (Math.random() - 0.5) * 100,
        Math.random() * 50 + 20,
        -50 - Math.random() * 50,
      ] as [number, number, number],
      speed: 0.5 + Math.random() * 1.5,
      size: 0.2 + Math.random() * 0.6,
      delay: Math.random() * 10,
    }));
  }, [theme]);

  return (
    <>
      {meteors.map((meteor) => (
        <Meteor
          key={meteor.id}
          startPosition={meteor.startPosition}
          speed={meteor.speed}
          size={meteor.size}
          delay={meteor.delay}
        />
      ))}
    </>
  );
}

function Meteor({
  startPosition,
  speed,
  size,
  delay,
}: {
  startPosition: [number, number, number];
  speed: number;
  size: number;
  delay: number;
}) {
  const meteorRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state) => {
    if (meteorRef.current && active) {
      const time = state.clock.elapsedTime - delay;
      if (time > 0) {
        meteorRef.current.position.x = startPosition[0] + time * speed * -2;
        meteorRef.current.position.y = startPosition[1] + time * speed * -1;
        meteorRef.current.position.z = startPosition[2] + time * speed * 3;

        if (meteorRef.current.position.y < -30) {
          meteorRef.current.position.set(...startPosition);
        }
      }
    }
  });

  return (
    <Trail
      width={size * 2}
      length={8}
      color={new THREE.Color(1, 0.6, 0.2)}
      attenuation={(t) => t * t}
    >
      <mesh ref={meteorRef} position={startPosition}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial
          color={new THREE.Color(1, 0.4, 0.1)}
          emissive={new THREE.Color(0.8, 0.3, 0)}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Trail>
  );
}

// Interactive Asteroids (keeping only spherical shapes)
function InteractiveAsteroids() {
  const { theme } = useTheme();
  const asteroids = useMemo(() => {
    return Array.from({ length: theme === "light" ? 4 : 12 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40,
        -20 - Math.random() * 40,
      ] as [number, number, number],
      size: 0.8 + Math.random() * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      orbitRadius: 2 + Math.random() * 4,
      orbitSpeed: 0.001 + Math.random() * 0.005,
    }));
  }, [theme]);

  return (
    <>
      {asteroids.map((asteroid) => (
        <InteractiveAsteroid
          key={asteroid.id}
          position={asteroid.position}
          size={asteroid.size}
          rotationSpeed={asteroid.rotationSpeed}
          orbitRadius={asteroid.orbitRadius}
          orbitSpeed={asteroid.orbitSpeed}
        />
      ))}
    </>
  );
}

function InteractiveAsteroid({
  position,
  size,
  rotationSpeed,
  orbitRadius,
  orbitSpeed,
}: {
  position: [number, number, number];
  size: number;
  rotationSpeed: number;
  orbitRadius: number;
  orbitSpeed: number;
}) {
  const asteroidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera, mouse } = useThree();

  const { scale } = useSpring({
    scale: hovered ? 1.3 : 1,
    config: { tension: 300, friction: 10 },
  });

  useFrame((state) => {
    if (asteroidRef.current) {
      const time = state.clock.elapsedTime;

      asteroidRef.current.position.x =
        position[0] + Math.cos(time * orbitSpeed) * orbitRadius;
      asteroidRef.current.position.z =
        position[2] + Math.sin(time * orbitSpeed) * orbitRadius;

      asteroidRef.current.rotation.x += rotationSpeed;
      asteroidRef.current.rotation.y += rotationSpeed * 0.7;

      const mouseVector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      mouseVector.unproject(camera);
      const distance = camera.position.distanceTo(asteroidRef.current.position);

      if (distance < 15) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    }
  });

  return (
    <animated.mesh
      ref={asteroidRef}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color={
          hovered
            ? new THREE.Color(0.8, 0.6, 0.3)
            : new THREE.Color(0.4, 0.4, 0.4)
        }
        roughness={0.9}
        metalness={0.1}
        emissive={
          hovered ? new THREE.Color(0.2, 0.1, 0) : new THREE.Color(0, 0, 0)
        }
      />
    </animated.mesh>
  );
}

// Particle Dust System
function SpaceDust() {
  const { theme } = useTheme();
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const count = theme === "light" ? 1000 : 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, [theme]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.0001;
      points.current.rotation.y = state.clock.elapsedTime * 0.0002;
    }
  });

  return (
    <Points
      ref={points}
      positions={particlesPosition}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color={theme === "light" ? "#FFDDAA" : "#ffffff"}
        size={theme === "light" ? 0.02 : 0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={theme === "light" ? 0.2 : 0.4}
      />
    </Points>
  );
}

// Transition Gradient Effect for Earth to Space
function TransitionGradient() {
  const { theme, pendingTheme, isTransitioning } = useTheme();
  const [gradientOpacity, setGradientOpacity] = useState(0);

  useEffect(() => {
    if (isTransitioning && pendingTheme === "dark") {
      // Show gradient during transition from Earth to space
      setGradientOpacity(0.8);
      const timeout = setTimeout(() => setGradientOpacity(0), 3000);
      return () => clearTimeout(timeout);
    } else {
      setGradientOpacity(0);
    }
  }, [isTransitioning, pendingTheme]);

  if (!isTransitioning || pendingTheme !== "dark") return null;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-3000"
      style={{
        opacity: gradientOpacity,
        background: `radial-gradient(circle at center,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 20, 40, 0.3) 20%,
          rgba(0, 10, 30, 0.6) 40%,
          rgba(0, 5, 20, 0.8) 60%,
          rgba(0, 0, 10, 0.9) 80%,
          rgba(0, 0, 0, 1) 100%)`
      }}
    />
  );
}

// Dynamic Lighting System
function DynamicLighting() {
  const { mouse } = useThree();
  const { theme } = useTheme();
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.x = mouse.x * 15;
      lightRef.current.position.y = mouse.y * 15;
      lightRef.current.intensity = theme === "light" ? 1.5 : 1.2;
    }
  });

  return (
    <>
      <ambientLight intensity={theme === "light" ? 0.8 : 0.1} />
      <pointLight
        ref={lightRef}
        position={[10, 10, 10]}
        intensity={theme === "light" ? 1.5 : 1.2}
        color={
          new THREE.Color(
            theme === "light" ? 0.9 : 0.3,
            theme === "light" ? 0.9 : 0.6,
            1.0,
          )
        }
        distance={100}
      />
      <directionalLight
        position={theme === "light" ? [-30, 15, -40] : [-20, 10, 5]}
        intensity={theme === "light" ? 1.2 : 0.5}
        color={new THREE.Color(1.0, 0.8, 0.6)}
      />
    </>
  );
}

// Main 3D Space Scene
function SpaceScene() {
  const { theme } = useTheme();

  const backgroundGradient =
    theme === "light"
      ? "linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #F0F8FF 100%)"
      : "linear-gradient(180deg, #000011 0%, #000033 50%, #000055 100%)";

  return (
    <div className="fixed inset-0 z-0">
      <TransitionGradient />
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ background: backgroundGradient }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraController />
        <DynamicLighting />

        {/* Atmospheric Sky for Light Theme */}
        <AtmosphericSky />

        {/* Enhanced Stars */}
        <Stars
          radius={300}
          depth={60}
          count={theme === "light" ? 2000 : 12000}
          factor={theme === "light" ? 2 : 6}
          saturation={0.4}
          fade
          speed={0.5}
        />

        {/* 3D Objects */}
        <Earth />
        <Moon />
        <Sun />
        <MeteorShower />
        <InteractiveAsteroids />
        <SpaceDust />

        {/* Realistic 3D Clouds for Light Theme */}
        <RealisticClouds />

        {/* Earth Surface Elements */}
        <EarthSurface />

        {/* Additional Effects */}
        <DreiSparkles
          count={theme === "light" ? 30 : 60}
          scale={[30, 30, 30]}
          size={1}
          speed={0.3}
          opacity={theme === "light" ? 0.2 : 0.5}
          color={theme === "light" ? "#FFD700" : "#4fc3f7"}
        />

        {/* Orbital Controls for subtle camera movement */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={theme === "light" ? 0.05 : 0.1}
        />
      </Canvas>
    </div>
  );
}

// Enhanced Mouse Following Effect
function EnhancedMouseEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMoving(false), 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const gradientColors =
    theme === "light"
      ? "rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.08) 30%, rgba(135, 206, 235, 0.05) 60%, transparent 80%"
      : "rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 30%, rgba(236, 72, 153, 0.1) 60%, transparent 80%";

  return (
    <div
      className={`fixed pointer-events-none z-30 transition-all duration-300 ${
        isMoving ? "opacity-80" : "opacity-40"
      }`}
      style={{
        left: mousePosition.x - 200,
        top: mousePosition.y - 200,
        width: "400px",
        height: "400px",
        background: `radial-gradient(circle, ${gradientColors})`,
        borderRadius: "50%",
        filter: "blur(60px)",
        transform: `scale(${isMoving ? 1.2 : 1})`,
      }}
    />
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { connectWallet, isConnecting, error } = useWeb3();
  const { theme } = useTheme();

  // Guest mode handler
  const handlePlayAsGuest = () => {
    dispatch({
      type: "UPDATE_PLAYER",
      payload: {
        id: "guest_" + Date.now(),
        name: "Guest Player",
        coins: 0,
        diamonds: 0,
      },
    });
    navigate("/game");
  };

  const features = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "3D Space Runner",
      description:
        "Navigate through stunning 3D space environments with realistic physics and gravity",
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Blockchain Rewards",
      description:
        "Earn real cryptocurrency rewards and NFTs through gameplay achievements",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Cosmic Leaderboards",
      description:
        "Compete with space explorers worldwide and climb the galactic rankings",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Power-ups & Tech",
      description:
        "Unlock advanced space technology and energy boosters for your ship",
    },
    {
      icon: <Diamond className="w-8 h-8" />,
      title: "Stellar Collectibles",
      description:
        "Discover rare cosmic gems and materials scattered across the universe",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Space Community",
      description:
        "Join a vibrant community of space explorers and cosmic adventurers",
    },
  ];

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-1000 ${theme === "light" ? "text-gray-900" : "text-white"}`}
    >
      {/* Enhanced 3D Space Background */}
      <SpaceScene />

      {/* Enhanced Mouse Effect */}
      <EnhancedMouseEffect />

      {/* Content */}
      <div className="relative z-20">
        {/* Professional Navbar */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-500 ${
            theme === "light"
              ? "bg-white/40 border-gray-200/40"
              : "bg-black/30 border-white/10"
          } border-b`}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo Section */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F61bb2c2b59304a3e8ff6f05c93913451%2Fb4dbc5f8d01c47418626106a29f0d54b?format=webp&width=800"
                    alt="Virtual Dash Logo"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30"></div>
                </div>
                <h1
                  className={`text-2xl font-bold bg-gradient-to-r ${
                    theme === "light"
                      ? "from-gray-800 to-blue-600"
                      : "from-white to-blue-200"
                  } bg-clip-text text-transparent`}
                >
                  Virtual Dash
                </h1>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <ThemeToggle />

                {state.wallet.isConnected ? (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
                    <Wallet className="w-4 h-4 mr-2" />
                    {state.wallet.address?.slice(0, 6)}...
                    {state.wallet.address?.slice(-4)}
                  </Badge>
                ) : (
                  <Button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                )}

                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-5xl mx-auto">
              {/* Main Title */}
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Virtual Dash
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Embark on an epic journey through the cosmos in this
                revolutionary 3D endless runner.
                <span className="text-cyan-400"> Collect cosmic rewards</span>,
                <span className="text-purple-400"> upgrade your ship</span>, and
                <span className="text-pink-400">
                  {" "}
                  compete across the galaxy!
                </span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                <Button
                  onClick={handlePlayAsGuest}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Play Now (Guest)
                </Button>

                <Button
                  onClick={() => navigate("/guide")}
                  size="lg"
                  className={`${
                    theme === "light"
                      ? "bg-gray-100/50 hover:bg-gray-200/50 text-gray-800 border-2 border-gray-300/50 hover:border-gray-400/50"
                      : "bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/30"
                  } backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105`}
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  Learn How to Play
                </Button>
              </div>

              {/* Guest Mode Notice */}
              <div
                className={`${
                  theme === "light"
                    ? "bg-amber-200/20 border-amber-400/30 text-amber-800"
                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                } border rounded-lg p-4 max-w-2xl mx-auto mb-12 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Playing as guest? Your progress won't be saved.
                    <Button
                      onClick={() => navigate("/signup")}
                      variant="link"
                      className={`${
                        theme === "light"
                          ? "text-amber-700 hover:text-amber-600"
                          : "text-yellow-400 hover:text-yellow-300"
                      } p-0 h-auto ml-1`}
                    >
                      Sign up to save progress!
                    </Button>
                  </span>
                </div>
              </div>

              {/* Player Stats (if available) */}
              {state.player.highScore > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {[
                    {
                      icon: Trophy,
                      value: state.player.highScore,
                      label: "High Score",
                      color: "text-yellow-400",
                    },
                    {
                      icon: Coins,
                      value: state.player.coins,
                      label: "Coins",
                      color: "text-yellow-400",
                    },
                    {
                      icon: Diamond,
                      value: state.player.diamonds,
                      label: "Diamonds",
                      color: "text-blue-400",
                    },
                    {
                      icon: Zap,
                      value: state.player.level,
                      label: "Level",
                      color: "text-purple-400",
                    },
                  ].map((stat, index) => (
                    <Card
                      key={index}
                      className={`${
                        theme === "light"
                          ? "bg-white/30 border-gray-200/40 hover:bg-white/40"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      } backdrop-blur-sm transition-colors`}
                    >
                      <CardContent className="p-4 text-center">
                        <stat.icon
                          className={`w-8 h-8 mx-auto mb-2 ${stat.color}`}
                        />
                        <div
                          className={`text-2xl font-bold ${theme === "light" ? "text-gray-800" : "text-white"}`}
                        >
                          {stat.value.toLocaleString()}
                        </div>
                        <div
                          className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                        >
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}
              >
                Cosmic Game Features
              </h2>
              <p
                className={`text-xl max-w-3xl mx-auto ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Experience the next generation of space gaming with cutting-edge
                technology and immersive gameplay
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`${
                    theme === "light"
                      ? "bg-white/30 border-gray-200/40 hover:bg-white/40 hover:border-gray-300/60"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  } backdrop-blur-sm transition-all duration-300 hover:scale-105 group`}
                >
                  <CardHeader>
                    <div className="text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle
                      className={`text-xl ${theme === "light" ? "text-gray-800" : "text-white"}`}
                    >
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription
                      className={`leading-relaxed ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}
              >
                Mission Control
              </h2>
              <p
                className={`text-xl ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
              >
                Choose your path through the cosmos
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Play,
                  title: "Launch Game",
                  desc: "Begin your space adventure",
                  gradient: "from-green-600 to-emerald-700",
                  shadow: "shadow-green-500/25",
                  onClick: handlePlayAsGuest,
                },
                {
                  icon: Zap,
                  title: "Ship Upgrades",
                  desc: "Enhance your spacecraft",
                  gradient: "from-purple-600 to-violet-700",
                  shadow: "shadow-purple-500/25",
                  onClick: () => navigate("/upgrade"),
                },
                {
                  icon: Coins,
                  title: "Space Market",
                  desc: "Trade cosmic resources",
                  gradient: "from-blue-600 to-cyan-700",
                  shadow: "shadow-blue-500/25",
                  onClick: () => navigate("/shop"),
                },
                {
                  icon: Trophy,
                  title: "Hall of Fame",
                  desc: "Galactic leaderboards",
                  gradient: "from-amber-600 to-orange-700",
                  shadow: "shadow-amber-500/25",
                  onClick: () => navigate("/leaderboard"),
                },
              ].map((action, index) => (
                <Card
                  key={index}
                  className={`bg-gradient-to-br ${action.gradient} ${
                    theme === "light" ? "border-gray-200/40" : "border-white/20"
                  } cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl ${action.shadow} backdrop-blur-sm group`}
                  onClick={action.onClick}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-white/90">{action.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`border-t backdrop-blur-sm py-8 ${
            theme === "light"
              ? "border-gray-200/40 bg-white/30"
              : "border-white/10 bg-black/20"
          }`}
        >
          <div className="container mx-auto px-6 text-center">
            <p
              className={theme === "light" ? "text-gray-600" : "text-gray-400"}
            >
              &copy; 2025 Virtual Dash. Explore the cosmos with Three.js and
              Web3 technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
