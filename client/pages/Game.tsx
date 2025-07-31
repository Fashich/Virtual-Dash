import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, Home, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import Game3D from '@/components/Game3D';
import GameLoading from '@/components/GameLoading';
import MobileControls from '@/components/MobileControls';
import { useResponsive, isTouchDevice } from '@/hooks/useResponsive';
import { useSoundManager } from '@/hooks/useSoundManager';

interface GameObject {
  id: string;
  position: [number, number, number];
  type: 'obstacle' | 'coin' | 'diamond' | 'powerup';
  collected?: boolean;
  value?: number;
}

export default function Game() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1, 0]);
  const [isJumping, setIsJumping] = useState(false);
  const [gameLoading, setGameLoading] = useState(true);
  const responsive = useResponsive();
  const isTouch = isTouchDevice();
  const soundManager = useSoundManager();

  // Initialize game
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleObjectCollision = (object: GameObject) => {
    switch (object.type) {
      case 'coin':
        dispatch({ type: 'COLLECT_COIN', payload: object.value || 10 });
        soundManager.play('coin');
        break;
      case 'diamond':
        dispatch({ type: 'COLLECT_DIAMOND', payload: object.value || 1 });
        soundManager.play('diamond');
        break;
      case 'obstacle':
        // Handle collision with obstacle
        dispatch({ type: 'END_GAME' });
        soundManager.play('crash');
        soundManager.stopBackgroundMusic();
        break;
      case 'powerup':
        // Handle powerup collection
        soundManager.play('powerup');
        break;
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (!state.currentGame.isPlaying || state.ui.isPaused) return;

    // Prevent default behavior for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        setPlayerPosition(prev => [Math.max(prev[0] - 2, -2), prev[1], prev[2]]);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        setPlayerPosition(prev => [Math.min(prev[0] + 2, 2), prev[1], prev[2]]);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        if (!isJumping) {
          setIsJumping(true);
          soundManager.play('jump');
          setPlayerPosition(prev => [prev[0], prev[1] + 2, prev[2]]);
          setTimeout(() => {
            setPlayerPosition(prev => [prev[0], 1, prev[2]]);
            setIsJumping(false);
          }, 600);
        }
        break;
      case 'Escape':
      case 'p':
      case 'P':
        if (state.currentGame.isPlaying) {
          state.ui.isPaused ? resumeGame() : pauseGame();
        }
        break;
    }
  };

  // Keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.currentGame.isPlaying, state.ui.isPaused, isJumping]);

  // Score update loop
  useEffect(() => {
    if (state.currentGame.isPlaying && !state.ui.isPaused) {
      const interval = setInterval(() => {
        dispatch({ type: 'UPDATE_SCORE', payload: state.currentGame.score + 10 });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state.currentGame.isPlaying, state.ui.isPaused, state.currentGame.score]);

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
    setPlayerPosition([0, 1, 0]);
    setIsJumping(false);
    soundManager.play('button');
    soundManager.playBackgroundMusic();
  };

  const pauseGame = () => {
    dispatch({ type: 'PAUSE_GAME' });
    soundManager.play('button');
  };

  const resumeGame = () => {
    dispatch({ type: 'RESUME_GAME' });
    soundManager.play('button');
  };

  const restartGame = () => {
    dispatch({ type: 'END_GAME' });
    soundManager.stopBackgroundMusic();
    setTimeout(() => {
      dispatch({ type: 'START_GAME' });
      setPlayerPosition([0, 1, 0]);
      setIsJumping(false);
      soundManager.play('button');
      soundManager.playBackgroundMusic();
    }, 100);
  };

  const goHome = () => {
    dispatch({ type: 'END_GAME' });
    soundManager.stopBackgroundMusic();
    soundManager.play('button');
    navigate('/');
  };

  const toggleSound = () => {
    soundManager.toggle();
    soundManager.play('button');
  };

  // Mobile control handlers
  const handleMobileLeft = () => {
    if (!state.currentGame.isPlaying || state.ui.isPaused) return;
    setPlayerPosition(prev => [Math.max(prev[0] - 2, -2), prev[1], prev[2]]);
  };

  const handleMobileRight = () => {
    if (!state.currentGame.isPlaying || state.ui.isPaused) return;
    setPlayerPosition(prev => [Math.min(prev[0] + 2, 2), prev[1], prev[2]]);
  };

  const handleMobileJump = () => {
    if (!state.currentGame.isPlaying || state.ui.isPaused || isJumping) return;
    setIsJumping(true);
    soundManager.play('jump');
    setPlayerPosition(prev => [prev[0], prev[1] + 2, prev[2]]);
    setTimeout(() => {
      setPlayerPosition(prev => [prev[0], 1, prev[2]]);
      setIsJumping(false);
    }, 600);
  };

  // Show loading screen
  if (gameLoading) {
    return <GameLoading message="Initializing Virtual Dash..." />;
  }

  return (
    <div className="h-screen w-screen relative bg-gradient-to-b from-blue-400 to-blue-600 overflow-hidden game-canvas">
      {/* 3D Game Canvas */}
      <Canvas
        shadows
        camera={{
          position: [0, 5, 10],
          fov: responsive.isMobile ? 85 : 75
        }}
        className="absolute inset-0"
        gl={{
          antialias: !responsive.isMobile, // Disable antialiasing on mobile for performance
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={responsive.isMobile ? [1, 1.5] : [1, 2]}
      >
        <Game3D
          playerPosition={playerPosition}
          isJumping={isJumping}
          onObjectCollision={handleObjectCollision}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start pointer-events-auto">
          <Card className="p-2 md:p-4 bg-black/80 text-white backdrop-blur-sm border-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">⭐</span>
                <span>{state.currentGame.score.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">🪙</span>
                <span>{state.currentGame.coins}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">💎</span>
                <span>{state.currentGame.diamonds}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">📏</span>
                <span>{state.currentGame.distance}m</span>
              </div>
            </div>
          </Card>

          <div className="flex gap-1 md:gap-2">
            {!responsive.isMobile && (
              <Button onClick={toggleSound} variant="outline" size="sm" title="Toggle Sound">
                {soundManager.isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            )}
            <Button onClick={goHome} variant="outline" size="sm" title="Home">
              <Home className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            {state.currentGame.isPlaying && !responsive.isMobile && (
              <Button
                onClick={state.ui.isPaused ? resumeGame : pauseGame}
                size="sm"
                title={state.ui.isPaused ? "Resume (P)" : "Pause (P)"}
              >
                {state.ui.isPaused ? <Play className="w-3 h-3 md:w-4 md:h-4" /> : <Pause className="w-3 h-3 md:w-4 md:h-4" />}
              </Button>
            )}
            <Button onClick={restartGame} variant="outline" size="sm" title="Restart">
              <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>

        {/* Speed indicator */}
        {state.currentGame.isPlaying && !responsive.isMobile && (
          <div className="absolute bottom-4 left-4 pointer-events-auto">
            <Card className="p-3 bg-black/80 text-white backdrop-blur-sm border-gray-600">
              <div className="text-sm">
                <div className="text-gray-400 mb-1">Speed</div>
                <Progress
                  value={(state.currentGame.speed - 10) * 10}
                  className="h-2 w-20"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Controls hint for desktop only */}
        {state.currentGame.isPlaying && !state.ui.isPaused && !responsive.isMobile && (
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <Card className="p-3 bg-black/80 text-white backdrop-blur-sm border-gray-600">
              <div className="text-xs text-gray-300">
                <div>← → / A D: Move</div>
                <div>↑ / W / Space: Jump</div>
                <div>P / Esc: Pause</div>
              </div>
            </Card>
          </div>
        )}

        {/* Game Start/End Screen */}
        {!state.currentGame.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
            <Card className="p-8 text-center max-w-md bg-black/80 border-gray-600">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 text-white">Virtual Dash</h2>
                <p className="text-blue-400 text-sm">Web3 Endless Runner</p>
              </div>

              {state.currentGame.score > 0 ? (
                <div className="mb-6">
                  <h3 className="text-xl mb-4 text-red-400">Game Over!</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-white">{state.currentGame.score.toLocaleString()}</div>
                      <div className="text-gray-400">Final Score</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-white">{state.currentGame.distance}m</div>
                      <div className="text-gray-400">Distance</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-400">{state.currentGame.coins}</div>
                      <div className="text-gray-400">Coins</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-400">{state.currentGame.diamonds}</div>
                      <div className="text-gray-400">Diamonds</div>
                    </div>
                  </div>

                  {/* New high score celebration */}
                  {state.currentGame.score > state.player.highScore && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded">
                      <div className="text-yellow-400 font-bold">🎉 NEW HIGH SCORE! 🎉</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-xs">
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-white font-medium">← → A D</div>
                      <div className="text-gray-400">Move</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-white font-medium">↑ W Space</div>
                      <div className="text-gray-400">Jump</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-white font-medium">P Esc</div>
                      <div className="text-gray-400">Pause</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Collect coins and diamonds while avoiding obstacles!
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startGame}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {state.currentGame.score > 0 ? 'Play Again' : 'Start Game'}
                </Button>
                <Button onClick={goHome} variant="outline" size="lg">
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Pause Screen */}
        {state.ui.isPaused && state.currentGame.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
            <Card className="p-8 text-center bg-black/80 border-gray-600">
              <h3 className="text-2xl mb-6 text-white">Game Paused</h3>

              {/* Current game stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xl font-bold text-white">{state.currentGame.score.toLocaleString()}</div>
                  <div className="text-gray-400">Current Score</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xl font-bold text-white">{state.currentGame.distance}m</div>
                  <div className="text-gray-400">Distance</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={resumeGame}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
                <Button onClick={restartGame} variant="outline" size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Restart
                </Button>
                <Button onClick={goHome} variant="outline" size="lg">
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Mobile Controls */}
        <MobileControls
          onMoveLeft={handleMobileLeft}
          onMoveRight={handleMobileRight}
          onJump={handleMobileJump}
          onPause={pauseGame}
          onResume={resumeGame}
          isPaused={state.ui.isPaused}
          isPlaying={state.currentGame.isPlaying}
        />
      </div>
    </div>
  );
}
