import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, Box, Torus, Stars, OrbitControls, Points, PointMaterial, Trail, Sparkles as DreiSparkles } from '@react-three/drei';
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

  // Create Earth materials
  const earthMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
        <svg width="512" height="256" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="earth" cx="50%" cy="50%">
              <stop offset="0%" style="stop-color:#4a90e2"/>
              <stop offset="60%" style="stop-color:#2e5d9a"/>
              <stop offset="100%" style="stop-color:#1a3d6b"/>
            </radialGradient>
            <radialGradient id="continent" cx="30%" cy="40%">
              <stop offset="0%" style="stop-color:#6b8e23"/>
              <stop offset="50%" style="stop-color:#556b2f"/>
              <stop offset="100%" style="stop-color:#3d4f1f"/>
            </radialGradient>
          </defs>
          <rect width="512" height="256" fill="url(#earth)"/>
          <ellipse cx="120" cy="80" rx="50" ry="30" fill="url(#continent)"/>
          <ellipse cx="300" cy="120" rx="70" ry="40" fill="url(#continent)"/>
          <ellipse cx="450" cy="60" rx="40" ry="25" fill="url(#continent)"/>
          <ellipse cx="80" cy="180" rx="35" ry="20" fill="url(#continent)"/>
          <ellipse cx="380" cy="200" rx="60" ry="35" fill="url(#continent)"/>
        </svg>
      `)),
      shininess: 100,
      transparent: true
    });
    material.map!.wrapS = THREE.RepeatWrapping;
    material.map!.wrapT = THREE.RepeatWrapping;
    return material;
  }, []);

  const cloudMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
        <svg width="512" height="256" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur">
              <feGaussianBlur stdDeviation="2"/>
            </filter>
          </defs>
          <rect width="512" height="256" fill="transparent"/>
          <ellipse cx="100" cy="50" rx="80" ry="20" fill="rgba(255,255,255,0.3)" filter="url(#blur)"/>
          <ellipse cx="300" cy="100" rx="100" ry="25" fill="rgba(255,255,255,0.2)" filter="url(#blur)"/>
          <ellipse cx="450" cy="180" rx="60" ry="15" fill="rgba(255,255,255,0.4)" filter="url(#blur)"/>
          <ellipse cx="150" cy="200" rx="70" ry="18" fill="rgba(255,255,255,0.25)" filter="url(#blur)"/>
        </svg>
      `)),
      transparent: true,
      opacity: 0.6
    });
  }, []);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.3, 0.6, 1.0),
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
  }, []);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.07;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group position={[20, 5, -30]}>
      {/* Earth */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[6, 64, 64]} />
      </mesh>
      
      {/* Clouds */}
      <mesh ref={cloudsRef} material={cloudMaterial}>
        <sphereGeometry args={[6.1, 64, 64]} />
      </mesh>
      
      {/* Atmosphere */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[6.5, 32, 32]} />
      </mesh>
    </group>
  );
}

// Meteor Shower Component
function MeteorShower() {
  const meteors = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      startPosition: [
        (Math.random() - 0.5) * 100,
        Math.random() * 50 + 20,
        -50 - Math.random() * 50
      ] as [number, number, number],
      speed: 0.5 + Math.random() * 1.5,
      size: 0.2 + Math.random() * 0.8,
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

// Interactive Asteroids
function InteractiveAsteroids() {
  const asteroids = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40,
        -20 - Math.random() * 40
      ] as [number, number, number],
      size: 1 + Math.random() * 3,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      orbitRadius: 2 + Math.random() * 5,
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
    scale: hovered ? 1.5 : 1,
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
      const direction = mouseVector.sub(camera.position).normalize();
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
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={hovered ? new THREE.Color(0.8, 0.6, 0.3) : new THREE.Color(0.4, 0.4, 0.4)}
        roughness={0.8}
        metalness={0.2}
        emissive={hovered ? new THREE.Color(0.2, 0.1, 0) : new THREE.Color(0, 0, 0)}
      />
    </animated.mesh>
  );
}

// Particle Dust System
function SpaceDust() {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
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
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// Nebula Effect
function NebulaEffect() {
  const nebulaRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.z = state.clock.elapsedTime * 0.001;
      nebulaRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={nebulaRef} position={[-40, 0, -60]}>
      <planeGeometry args={[80, 80]} />
      <meshBasicMaterial
        color={new THREE.Color(0.5, 0.2, 0.8)}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Dynamic Lighting System
function DynamicLighting() {
  const { mouse } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.x = mouse.x * 20;
      lightRef.current.position.y = mouse.y * 20;
      lightRef.current.intensity = 1 + mouse.x * 0.5;
    }
    if (spotLightRef.current) {
      spotLightRef.current.target.position.x = mouse.x * 10;
      spotLightRef.current.target.position.y = mouse.y * 10;
    }
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight
        ref={lightRef}
        position={[10, 10, 10]}
        intensity={1.2}
        color={new THREE.Color(0.3, 0.6, 1.0)}
        distance={100}
      />
      <spotLight
        ref={spotLightRef}
        position={[20, 20, 20]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color={new THREE.Color(0.8, 0.4, 1.0)}
        distance={80}
      />
      <directionalLight
        position={[-20, 10, 5]}
        intensity={0.5}
        color={new THREE.Color(1.0, 0.8, 0.6)}
      />
    </>
  );
}

// Main 3D Space Scene
function SpaceScene() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ background: 'linear-gradient(180deg, #000011 0%, #000033 50%, #000055 100%)' }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <DynamicLighting />
        
        {/* Enhanced Stars */}
        <Stars 
          radius={200} 
          depth={50} 
          count={12000} 
          factor={6} 
          saturation={0.5} 
          fade 
          speed={2} 
        />
        
        {/* 3D Objects */}
        <Earth />
        <MeteorShower />
        <InteractiveAsteroids />
        <SpaceDust />
        <NebulaEffect />
        
        {/* Additional Effects */}
        <DreiSparkles 
          count={100} 
          scale={[40, 40, 40]} 
          size={2} 
          speed={0.4} 
          opacity={0.6}
          color="#4fc3f7"
        />
        
        {/* Orbital Controls for subtle camera movement */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.2}
        />
      </Canvas>
    </div>
  );
}

// Enhanced Mouse Following Effect
function EnhancedMouseEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

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
        background: `radial-gradient(circle, 
          rgba(59, 130, 246, 0.3) 0%, 
          rgba(147, 51, 234, 0.2) 30%, 
          rgba(236, 72, 153, 0.1) 60%, 
          transparent 80%
        )`,
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced 3D Space Background */}
      <SpaceScene />
      
      {/* Enhanced Mouse Effect */}
      <EnhancedMouseEffect />

      {/* Content */}
      <div className="relative z-20">
        {/* Professional Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Virtual Dash
                </h1>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
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
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
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
                  className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/30 backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  Learn How to Play
                </Button>
              </div>

              {/* Guest Mode Notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-2xl mx-auto mb-12 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-2 text-yellow-300">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Playing as guest? Your progress won't be saved. 
                    <Button 
                      onClick={() => navigate('/signup')}
                      variant="link" 
                      className="text-yellow-400 hover:text-yellow-300 p-0 h-auto ml-1"
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
                    <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <CardContent className="p-4 text-center">
                        <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
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
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Cosmic Game Features
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience the next generation of space gaming with cutting-edge technology and immersive gameplay
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group"
                >
                  <CardHeader>
                    <div className="text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 leading-relaxed">
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
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Mission Control
              </h2>
              <p className="text-xl text-gray-300">
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
                  className={`bg-gradient-to-br ${action.gradient} border-white/20 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl ${action.shadow} backdrop-blur-sm group`}
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
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-400">
              &copy; 2025 Virtual Dash. Explore the cosmos with Three.js and Web3 technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
