import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, Stars, OrbitControls, Points, PointMaterial, Trail, Sparkles as DreiSparkles } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
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
  Sparkles
} from 'lucide-react';

// Realistic Earth Component
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const nightLightsRef = useRef<THREE.Mesh>(null);

  // Create highly realistic Earth materials
  const earthMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
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
      `)),
      normalMap: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
        <svg width="1024" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="1024" height="512" fill="#8080FF"/>
          <circle cx="200" cy="150" r="40" fill="#9090FF"/>
          <circle cx="450" cy="200" r="60" fill="#9090FF"/>
          <circle cx="650" cy="180" r="50" fill="#9090FF"/>
          <circle cx="750" cy="380" r="35" fill="#9090FF"/>
        </svg>
      `)),
      shininess: 30,
      specular: new THREE.Color(0.2, 0.4, 0.8),
      transparent: false
    });
    material.map!.wrapS = THREE.RepeatWrapping;
    material.map!.wrapT = THREE.RepeatWrapping;
    material.normalMap!.wrapS = THREE.RepeatWrapping;
    material.normalMap!.wrapT = THREE.RepeatWrapping;
    return material;
  }, []);

  const cloudMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
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
      `)),
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });
  }, []);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.4, 0.7, 1.0),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
  }, []);

  const nightLightsMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
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
      `)),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.elapsedTime * 0.02; // Earth's rotation - 24 hours
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.025; // Clouds move slightly faster
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = state.clock.elapsedTime * 0.01; // Atmosphere subtle rotation
    }
    if (nightLightsRef.current) {
      nightLightsRef.current.rotation.y = state.clock.elapsedTime * 0.02; // Same as Earth
    }
  });

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
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
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
      `)),
      shininess: 30,
      transparent: true
    });
  }, []);

  useFrame((state) => {
    if (moonRef.current) {
      // Moon orbits around Earth
      const earthPosition = [20, 5, -30];
      const orbitRadius = 15;
      const orbitSpeed = 0.02;
      
      moonRef.current.position.x = earthPosition[0] + Math.cos(state.clock.elapsedTime * orbitSpeed) * orbitRadius;
      moonRef.current.position.y = earthPosition[1] + Math.sin(state.clock.elapsedTime * orbitSpeed * 0.5) * 3;
      moonRef.current.position.z = earthPosition[2] + Math.sin(state.clock.elapsedTime * orbitSpeed) * orbitRadius;
      
      // Moon rotation
      moonRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

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
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
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
      `)),
      color: new THREE.Color(1.0, 0.9, 0.8),
      emissive: new THREE.Color(1.0, 0.6, 0.2),
      emissiveIntensity: 1.5
    });
  }, []);

  // Chromosphere layer
  const chromosphereMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.3, 0.1),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
  }, []);

  // Corona material with realistic solar wind effect
  const coronaMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
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
      `)),
      transparent: true,
      opacity: 0.6,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
  }, []);

  // Solar flare materials
  const flareMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.4, 0.6),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (sunRef.current) {
      // Solar rotation (about 25 days)
      sunRef.current.rotation.y = time * 0.003;

      // Subtle pulsing for solar activity
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

      // Corona expansion/contraction
      const coronaPulse = 1 + Math.sin(time * 0.3) * 0.05;
      coronaRef.current.scale.setScalar(coronaPulse);
    }

    // Solar flare animations
    if (flareRef1.current) {
      flareRef1.current.rotation.z = time * 2;
      flareRef1.current.scale.setScalar(1 + Math.sin(time * 3) * 0.3);
    }

    if (flareRef2.current) {
      flareRef2.current.rotation.z = -time * 1.5;
      flareRef2.current.scale.setScalar(1 + Math.cos(time * 2.5) * 0.2);
    }
  });

  return (
    <group position={[-70, 25, -90]}>
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
      <mesh ref={flareRef2} material={flareMaterial} position={[0, -8, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.5, 4, 8]} />
      </mesh>

      {/* Realistic Sun Light */}
      <pointLight
        intensity={3.5}
        color={new THREE.Color(1.0, 0.95, 0.8)}
        distance={200}
        decay={1.5}
      />

      {/* Secondary warm light */}
      <pointLight
        position={[5, 0, 0]}
        intensity={1.2}
        color={new THREE.Color(1.0, 0.7, 0.4)}
        distance={100}
        decay={2}
      />
    </group>
  );
}

// Meteor Shower Component (keeping spheres only)
function MeteorShower() {
  const meteors = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      startPosition: [
        (Math.random() - 0.5) * 100,
        Math.random() * 50 + 20,
        -50 - Math.random() * 50
      ] as [number, number, number],
      speed: 0.5 + Math.random() * 1.5,
      size: 0.2 + Math.random() * 0.6,
      delay: Math.random() * 10
    }));
  }, []);

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

function Meteor({ startPosition, speed, size, delay }: {
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
        
        // Reset position when meteor goes off screen
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
  const asteroids = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40,
        -20 - Math.random() * 40
      ] as [number, number, number],
      size: 0.8 + Math.random() * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      orbitRadius: 2 + Math.random() * 4,
      orbitSpeed: 0.001 + Math.random() * 0.005
    }));
  }, []);

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
  orbitSpeed
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
    config: { tension: 300, friction: 10 }
  });

  useFrame((state) => {
    if (asteroidRef.current) {
      const time = state.clock.elapsedTime;
      
      // Orbital motion
      asteroidRef.current.position.x = position[0] + Math.cos(time * orbitSpeed) * orbitRadius;
      asteroidRef.current.position.z = position[2] + Math.sin(time * orbitSpeed) * orbitRadius;
      
      // Rotation
      asteroidRef.current.rotation.x += rotationSpeed;
      asteroidRef.current.rotation.y += rotationSpeed * 0.7;
      
      // Mouse interaction
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
        color={hovered ? new THREE.Color(0.8, 0.6, 0.3) : new THREE.Color(0.4, 0.4, 0.4)}
        roughness={0.9}
        metalness={0.1}
        emissive={hovered ? new THREE.Color(0.2, 0.1, 0) : new THREE.Color(0, 0, 0)}
      />
    </animated.mesh>
  );
}

// Particle Dust System
function SpaceDust() {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.0001;
      points.current.rotation.y = state.clock.elapsedTime * 0.0002;
    }
  });

  return (
    <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
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
      lightRef.current.intensity = theme === 'light' ? 0.8 : 1.2;
    }
  });

  return (
    <>
      <ambientLight intensity={theme === 'light' ? 0.4 : 0.1} />
      <pointLight
        ref={lightRef}
        position={[10, 10, 10]}
        intensity={theme === 'light' ? 0.8 : 1.2}
        color={new THREE.Color(theme === 'light' ? 0.9 : 0.3, theme === 'light' ? 0.9 : 0.6, 1.0)}
        distance={100}
      />
      <directionalLight
        position={[-20, 10, 5]}
        intensity={theme === 'light' ? 0.8 : 0.5}
        color={new THREE.Color(1.0, 0.8, 0.6)}
      />
    </>
  );
}

// Main 3D Space Scene
function SpaceScene() {
  const { theme } = useTheme();
  
  const backgroundGradient = theme === 'light' 
    ? 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #F0F8FF 100%)'
    : 'linear-gradient(180deg, #000011 0%, #000033 50%, #000055 100%)';

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ background: backgroundGradient }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <DynamicLighting />
        
        {/* Enhanced Stars */}
        <Stars
          radius={300}
          depth={60}
          count={theme === 'light' ? 4000 : 12000}
          factor={theme === 'light' ? 3 : 6}
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
        
        {/* Additional Effects */}
        <DreiSparkles 
          count={60} 
          scale={[30, 30, 30]} 
          size={1} 
          speed={0.3} 
          opacity={theme === 'light' ? 0.3 : 0.5}
          color={theme === 'light' ? "#FFD700" : "#4fc3f7"}
        />
        
        {/* Orbital Controls for subtle camera movement */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.1}
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

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const gradientColors = theme === 'light'
    ? 'rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 30%, rgba(135, 206, 235, 0.05) 60%, transparent 80%'
    : 'rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 30%, rgba(236, 72, 153, 0.1) 60%, transparent 80%';

  return (
    <div
      className={`fixed pointer-events-none z-30 transition-all duration-300 ${
        isMoving ? 'opacity-80' : 'opacity-40'
      }`}
      style={{
        left: mousePosition.x - 200,
        top: mousePosition.y - 200,
        width: '400px',
        height: '400px',
        background: `radial-gradient(circle, ${gradientColors})`,
        borderRadius: '50%',
        filter: 'blur(60px)',
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
      type: 'UPDATE_PLAYER',
      payload: { 
        id: 'guest_' + Date.now(),
        name: 'Guest Player',
        coins: 0,
        diamonds: 0
      }
    });
    navigate('/game');
  };

  const features = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "3D Space Runner",
      description: "Navigate through stunning 3D space environments with realistic physics and gravity"
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Blockchain Rewards",
      description: "Earn real cryptocurrency rewards and NFTs through gameplay achievements"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Cosmic Leaderboards",
      description: "Compete with space explorers worldwide and climb the galactic rankings"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Power-ups & Tech",
      description: "Unlock advanced space technology and energy boosters for your ship"
    },
    {
      icon: <Diamond className="w-8 h-8" />,
      title: "Stellar Collectibles",
      description: "Discover rare cosmic gems and materials scattered across the universe"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Space Community",
      description: "Join a vibrant community of space explorers and cosmic adventurers"
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
      {/* Enhanced 3D Space Background */}
      <SpaceScene />
      
      {/* Enhanced Mouse Effect */}
      <EnhancedMouseEffect />

      {/* Content */}
      <div className="relative z-20">
        {/* Professional Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${
          theme === 'light' 
            ? 'bg-white/30 border-gray-200/30' 
            : 'bg-black/30 border-white/10'
        } border-b`}>
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
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${
                  theme === 'light' 
                    ? 'from-gray-800 to-blue-600' 
                    : 'from-white to-blue-200'
                } bg-clip-text text-transparent`}>
                  Virtual Dash
                </h1>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                
                {state.wallet.isConnected ? (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
                    <Wallet className="w-4 h-4 mr-2" />
                    {state.wallet.address?.slice(0, 6)}...{state.wallet.address?.slice(-4)}
                  </Badge>
                ) : (
                  <Button 
                    onClick={connectWallet} 
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate('/signup')}
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
              <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Embark on an epic journey through the cosmos in this revolutionary 3D endless runner. 
                <span className="text-cyan-400"> Collect cosmic rewards</span>, 
                <span className="text-purple-400"> upgrade your ship</span>, and 
                <span className="text-pink-400"> compete across the galaxy!</span>
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
                  onClick={() => navigate('/guide')} 
                  size="lg"
                  className={`${
                    theme === 'light'
                      ? 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-800 border-2 border-gray-300/50 hover:border-gray-400/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/30'
                  } backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105`}
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  Learn How to Play
                </Button>
              </div>

              {/* Guest Mode Notice */}
              <div className={`${
                theme === 'light'
                  ? 'bg-amber-200/20 border-amber-400/30 text-amber-800'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
              } border rounded-lg p-4 max-w-2xl mx-auto mb-12 backdrop-blur-sm`}>
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Playing as guest? Your progress won't be saved. 
                    <Button 
                      onClick={() => navigate('/signup')}
                      variant="link" 
                      className={`${
                        theme === 'light' ? 'text-amber-700 hover:text-amber-600' : 'text-yellow-400 hover:text-yellow-300'
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
                    { icon: Trophy, value: state.player.highScore, label: 'High Score', color: 'text-yellow-400' },
                    { icon: Coins, value: state.player.coins, label: 'Coins', color: 'text-yellow-400' },
                    { icon: Diamond, value: state.player.diamonds, label: 'Diamonds', color: 'text-blue-400' },
                    { icon: Zap, value: state.player.level, label: 'Level', color: 'text-purple-400' }
                  ].map((stat, index) => (
                    <Card key={index} className={`${
                      theme === 'light'
                        ? 'bg-white/20 border-gray-200/30 hover:bg-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } backdrop-blur-sm transition-colors`}>
                      <CardContent className="p-4 text-center">
                        <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                        <div className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                          {stat.value.toLocaleString()}
                        </div>
                        <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
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
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>
                Cosmic Game Features
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Experience the next generation of space gaming with cutting-edge technology and immersive gameplay
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className={`${
                    theme === 'light'
                      ? 'bg-white/20 border-gray-200/30 hover:bg-white/30 hover:border-gray-300/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } backdrop-blur-sm transition-all duration-300 hover:scale-105 group`}
                >
                  <CardHeader>
                    <div className="text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className={`text-xl ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className={`leading-relaxed ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
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
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>
                Mission Control
              </h2>
              <p className={`text-xl ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Choose your path through the cosmos
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: Play, 
                  title: 'Launch Game', 
                  desc: 'Begin your space adventure',
                  gradient: 'from-green-600 to-emerald-700',
                  shadow: 'shadow-green-500/25',
                  onClick: handlePlayAsGuest
                },
                { 
                  icon: Zap, 
                  title: 'Ship Upgrades', 
                  desc: 'Enhance your spacecraft',
                  gradient: 'from-purple-600 to-violet-700',
                  shadow: 'shadow-purple-500/25',
                  onClick: () => navigate('/upgrade')
                },
                { 
                  icon: Coins, 
                  title: 'Space Market', 
                  desc: 'Trade cosmic resources',
                  gradient: 'from-blue-600 to-cyan-700',
                  shadow: 'shadow-blue-500/25',
                  onClick: () => navigate('/shop')
                },
                { 
                  icon: Trophy, 
                  title: 'Hall of Fame', 
                  desc: 'Galactic leaderboards',
                  gradient: 'from-amber-600 to-orange-700',
                  shadow: 'shadow-amber-500/25',
                  onClick: () => navigate('/leaderboard')
                }
              ].map((action, index) => (
                <Card
                  key={index}
                  className={`bg-gradient-to-br ${action.gradient} ${
                    theme === 'light' ? 'border-gray-200/40' : 'border-white/20'
                  } cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl ${action.shadow} backdrop-blur-sm group`}
                  onClick={action.onClick}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{action.title}</h3>
                    <p className="text-sm text-white/90">{action.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`border-t backdrop-blur-sm py-8 ${
          theme === 'light'
            ? 'border-gray-200/30 bg-white/20'
            : 'border-white/10 bg-black/20'
        }`}>
          <div className="container mx-auto px-6 text-center">
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
              &copy; 2025 Virtual Dash. Explore the cosmos with Three.js and Web3 technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
