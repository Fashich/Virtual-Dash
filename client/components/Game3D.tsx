import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '@/contexts/GameContext';

interface GameObject {
  id: string;
  position: [number, number, number];
  type: 'obstacle' | 'coin' | 'diamond' | 'powerup';
  collected?: boolean;
  value?: number;
}

interface PlayerCharacterProps {
  position: [number, number, number];
  isJumping: boolean;
  onCollision: (object: GameObject) => void;
}

function PlayerCharacter({ position, isJumping, onCollision }: PlayerCharacterProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { state } = useGame();
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Smooth movement animation
    meshRef.current.position.lerp(new THREE.Vector3(position[0], position[1], position[2]), 0.1);
    
    // Running animation - bobbing motion
    if (!isJumping && !state.ui.isPaused) {
      meshRef.current.position.y = position[1] + Math.sin(time * 8) * 0.05;
      
      // Character rotation for movement feel
      if (position[0] !== 0) {
        meshRef.current.rotation.z = THREE.MathUtils.lerp(
          meshRef.current.rotation.z, 
          position[0] * -0.1, 
          0.1
        );
      }
    }
    
    // Jumping animation
    if (isJumping) {
      const jumpProgress = Math.sin((time * 4) % Math.PI);
      meshRef.current.position.y = position[1] + jumpProgress * 1.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main body */}
      <Box args={[0.8, 1.2, 0.8]} castShadow>
        <meshStandardMaterial 
          color="#4f46e5" 
          roughness={0.7}
          metalness={0.3}
        />
      </Box>
      
      {/* Head */}
      <Sphere position={[0, 0.8, 0]} args={[0.3]} castShadow>
        <meshStandardMaterial 
          color="#fbbf24" 
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>
      
      {/* Arms */}
      <Box position={[-0.5, 0.2, 0]} args={[0.2, 0.8, 0.2]} castShadow>
        <meshStandardMaterial color="#4f46e5" />
      </Box>
      <Box position={[0.5, 0.2, 0]} args={[0.2, 0.8, 0.2]} castShadow>
        <meshStandardMaterial color="#4f46e5" />
      </Box>
      
      {/* Legs */}
      <Box position={[-0.2, -0.8, 0]} args={[0.3, 0.8, 0.3]} castShadow>
        <meshStandardMaterial color="#2563eb" />
      </Box>
      <Box position={[0.2, -0.8, 0]} args={[0.3, 0.8, 0.3]} castShadow>
        <meshStandardMaterial color="#2563eb" />
      </Box>
    </group>
  );
}

function GameEnvironment({ onObjectCollision }: { onObjectCollision: (object: GameObject) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { state } = useGame();
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [environmentOffset, setEnvironmentOffset] = useState(0);

  // Generate procedural environment
  const generateObjects = (startZ: number, count: number = 30): GameObject[] => {
    const objects: GameObject[] = [];
    
    for (let i = 0; i < count; i++) {
      const z = startZ - (i * 8);
      const laneIndex = Math.floor(Math.random() * 3); // 3 lanes
      const x = (laneIndex - 1) * 2; // -2, 0, 2
      const y = 0.5;
      
      // Determine object type with weighted probability
      const rand = Math.random();
      let type: GameObject['type'];
      let value = 0;
      
      if (rand < 0.5) {
        type = 'coin';
        value = 10;
      } else if (rand < 0.75) {
        type = 'obstacle';
        value = 0;
      } else if (rand < 0.95) {
        type = 'diamond';
        value = 100;
      } else {
        type = 'powerup';
        value = 50;
      }
      
      objects.push({
        id: `${type}-${startZ}-${i}`,
        position: [x, y, z],
        type,
        value,
        collected: false,
      });
    }
    
    return objects;
  };

  // Initialize objects
  useEffect(() => {
    setGameObjects(generateObjects(0));
  }, []);

  useFrame((frameState, delta) => {
    if (!state.currentGame.isPlaying || state.ui.isPaused || !groupRef.current) return;

    const speed = state.currentGame.speed * delta;
    setEnvironmentOffset(prev => prev + speed);
    
    // Move environment forward (player moves backward relative to environment)
    groupRef.current.position.z += speed;
    
    // Generate new objects when needed
    if (environmentOffset > 50) {
      setGameObjects(prev => [
        ...prev.filter(obj => obj.position[2] > -100), // Keep objects in range
        ...generateObjects(environmentOffset - 50)
      ]);
      setEnvironmentOffset(0);
    }

    // Check collisions with player (assuming player is at [0, 1, 0])
    gameObjects.forEach(obj => {
      if (!obj.collected && 
          Math.abs(obj.position[0]) < 1.2 && 
          Math.abs(obj.position[1] - 1) < 1.2 && 
          Math.abs(obj.position[2] + environmentOffset) < 2) {
        onObjectCollision(obj);
        obj.collected = true;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Track surface */}
      <Box position={[0, -1, 0]} args={[8, 0.2, 200]} receiveShadow>
        <meshStandardMaterial 
          color="#059669" 
          roughness={0.8}
          metalness={0.1}
        />
      </Box>
      
      {/* Lane dividers */}
      {[-1, 1].map((x, i) => (
        <Box key={i} position={[x, -0.9, 0]} args={[0.1, 0.05, 200]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
      ))}
      
      {/* Game objects */}
      {gameObjects.map(obj => {
        if (obj.collected) return null;
        
        const colors = {
          coin: '#fcd34d',
          diamond: '#06b6d4',
          obstacle: '#dc2626',
          powerup: '#8b5cf6'
        };
        
        return (
          <group key={obj.id} position={obj.position}>
            {obj.type === 'obstacle' ? (
              <Box args={[1.5, 2, 0.8]} castShadow>
                <meshStandardMaterial 
                  color={colors[obj.type]} 
                  roughness={0.7}
                  metalness={0.3}
                />
              </Box>
            ) : (
              <Sphere args={[0.3]} castShadow>
                <meshStandardMaterial 
                  color={colors[obj.type]} 
                  roughness={0.3}
                  metalness={0.7}
                  emissive={colors[obj.type]}
                  emissiveIntensity={0.2}
                />
              </Sphere>
            )}
            
            {/* Floating animation for collectibles */}
            {obj.type !== 'obstacle' && (
              <group>
                <Sphere args={[0.35]} position={[0, Math.sin(Date.now() * 0.005) * 0.1, 0]}>
                  <meshBasicMaterial 
                    color={colors[obj.type]} 
                    transparent 
                    opacity={0.3}
                  />
                </Sphere>
              </group>
            )}
          </group>
        );
      })}
      
      {/* Buildings and environment */}
      {Array.from({ length: 40 }, (_, i) => (
        <group key={`building-${i}`}>
          {/* Left buildings */}
          <Box 
            position={[-8, 2, -i * 15]} 
            args={[3, 4 + Math.random() * 4, 3]}
            castShadow
          >
            <meshStandardMaterial 
              color={`hsl(${220 + Math.random() * 40}, 30%, ${30 + Math.random() * 20}%)`}
              roughness={0.8}
              metalness={0.2}
            />
          </Box>
          
          {/* Right buildings */}
          <Box 
            position={[8, 2, -i * 15]} 
            args={[3, 4 + Math.random() * 4, 3]}
            castShadow
          >
            <meshStandardMaterial 
              color={`hsl(${220 + Math.random() * 40}, 30%, ${30 + Math.random() * 20}%)`}
              roughness={0.8}
              metalness={0.2}
            />
          </Box>
        </group>
      ))}
    </group>
  );
}

function GameLighting() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame(() => {
    if (lightRef.current) {
      // Dynamic lighting that follows the action
      lightRef.current.position.z = Math.sin(Date.now() * 0.001) * 5;
    }
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} color="#4ade80" />
      
      {/* Main directional light */}
      <directionalLight 
        ref={lightRef}
        position={[10, 15, 5]} 
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light */}
      <pointLight 
        position={[-10, 10, 0]} 
        intensity={0.5}
        color="#3b82f6"
      />
      
      {/* Accent light */}
      <pointLight 
        position={[10, 5, -10]} 
        intensity={0.3}
        color="#8b5cf6"
      />
    </>
  );
}

function GameHUD() {
  const { state } = useGame();
  
  return (
    <>
      {/* Score display in 3D space */}
      <Text
        position={[0, 8, -5]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff" // You'd need to add this font
      >
        Score: {state.currentGame.score.toLocaleString()}
      </Text>
      
      {/* Distance indicator */}
      <Text
        position={[-3, 7, -5]}
        fontSize={0.8}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        {state.currentGame.distance}m
      </Text>
      
      {/* Coin counter */}
      <Text
        position={[3, 7, -5]}
        fontSize={0.8}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        ⭐ {state.currentGame.coins}
      </Text>
    </>
  );
}

interface Game3DProps {
  playerPosition: [number, number, number];
  isJumping: boolean;
  onObjectCollision: (object: GameObject) => void;
}

export default function Game3D({ playerPosition, isJumping, onObjectCollision }: Game3DProps) {
  return (
    <>
      <GameLighting />
      <PlayerCharacter 
        position={playerPosition} 
        isJumping={isJumping}
        onCollision={onObjectCollision} 
      />
      <GameEnvironment onObjectCollision={onObjectCollision} />
      <GameHUD />
      
      {/* Fog for depth perception */}
      <fog attach="fog" args={['#1e1b4b', 20, 100]} />
    </>
  );
}
