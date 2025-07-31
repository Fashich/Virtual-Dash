import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Box, Torus, Text3D, Stars, OrbitControls } from '@react-three/drei';
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

// Mouse Following Light Component
function MouseFollowLight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div
        className={`fixed pointer-events-none z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, 
            rgba(59, 130, 246, 0.4) 0%, 
            rgba(147, 51, 234, 0.3) 25%, 
            rgba(236, 72, 153, 0.2) 50%, 
            transparent 70%
          )`,
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      <div
        className={`fixed pointer-events-none z-40 transition-all duration-700 ${
          isVisible ? 'opacity-60' : 'opacity-0'
        }`}
        style={{
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
          width: '200px',
          height: '200px',
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(34, 197, 94, 0.3) 90deg,
            rgba(59, 130, 246, 0.3) 180deg,
            rgba(168, 85, 247, 0.3) 270deg,
            transparent 360deg
          )`,
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'spin 4s linear infinite',
        }}
      />
    </>
  );
}

// 3D Space Objects
function SpaceObjects() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating Planet */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere position={[-15, 8, -20]} args={[3, 64, 64]}>
          <meshStandardMaterial
            color="#4338ca"
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.8}
          />
        </Sphere>
      </Float>

      {/* Rotating Ring */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={0.5}>
        <Torus position={[15, -5, -15]} args={[4, 0.8, 16, 100]}>
          <meshStandardMaterial
            color="#06b6d4"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.7}
          />
        </Torus>
      </Float>

      {/* Crystal Structure */}
      <Float speed={1} rotationIntensity={1} floatIntensity={2}>
        <Box position={[0, 12, -25]} args={[2, 6, 2]}>
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={1}
            roughness={0}
            transparent
            opacity={0.8}
          />
        </Box>
      </Float>

      {/* Asteroid Field */}
      {Array.from({ length: 15 }, (_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={Math.random() * 2}>
          <Sphere
            position={[
              (Math.random() - 0.5) * 80,
              (Math.random() - 0.5) * 40,
              -30 - Math.random() * 50
            ]}
            args={[0.5 + Math.random() * 1.5, 16, 16]}
          >
            <meshStandardMaterial
              color={['#f59e0b', '#ef4444', '#10b981', '#06b6d4'][Math.floor(Math.random() * 4)]}
              roughness={0.8}
              metalness={0.2}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

// Space Background Canvas
function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <spotLight
          position={[20, 20, 20]}
          angle={0.3}
          penumbra={1}
          intensity={0.7}
          color="#06b6d4"
        />
        
        <Stars radius={200} depth={50} count={8000} factor={4} saturation={0} fade speed={1} />
        <SpaceObjects />
      </Canvas>
    </div>
  );
}

// Dynamic Gradient Background
function DynamicGradientBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    const timer = setInterval(() => setTime(prev => prev + 1), 100);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timer);
    };
  }, []);

  const { x, y } = mousePosition;
  const wave1 = Math.sin(time * 0.01) * 20;
  const wave2 = Math.cos(time * 0.015) * 30;
  const wave3 = Math.sin(time * 0.008) * 25;

  return (
    <div
      className="fixed inset-0 z-10"
      style={{
        background: `
          radial-gradient(circle at ${x + wave1}% ${y + wave2}%, 
            rgba(6, 182, 212, 0.3) 0%, 
            transparent 60%),
          radial-gradient(circle at ${x - wave2}% ${y - wave1}%, 
            rgba(139, 92, 246, 0.25) 0%, 
            transparent 50%),
          radial-gradient(circle at ${x + wave3}% ${y + wave3}%, 
            rgba(236, 72, 153, 0.2) 0%, 
            transparent 50%),
          linear-gradient(135deg, 
            #000510 0%, 
            #0f0728 25%, 
            #1a0b3d 50%, 
            #0d1421 75%, 
            #000000 100%)
        `,
        transition: 'background 0.3s ease-out',
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
    // Set guest mode in game state
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
      {/* Space Background */}
      <SpaceBackground />
      
      {/* Dynamic Gradient Overlay */}
      <DynamicGradientBackground />
      
      {/* Mouse Following Light */}
      <MouseFollowLight />

      {/* Content */}
      <div className="relative z-20">
        {/* Professional Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
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
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
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
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-2xl mx-auto mb-12">
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
