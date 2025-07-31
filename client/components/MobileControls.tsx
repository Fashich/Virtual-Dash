import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ArrowUp, Pause, Play } from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
  isPlaying: boolean;
}

export default function MobileControls({
  onMoveLeft,
  onMoveRight,
  onJump,
  onPause,
  onResume,
  isPaused,
  isPlaying
}: MobileControlsProps) {
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);
  const jumpButtonRef = useRef<HTMLButtonElement>(null);

  // Touch event handlers for better mobile responsiveness
  const handleTouchStart = (callback: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    callback();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  // Add swipe gestures
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStartGesture = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEndGesture = (e: TouchEvent) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Check if it's a significant swipe
      if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            onMoveRight();
          } else {
            onMoveLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY < 0) {
            onJump();
          }
        }
      }
      
      startX = 0;
      startY = 0;
    };
    
    if (isPlaying) {
      document.addEventListener('touchstart', handleTouchStartGesture, { passive: false });
      document.addEventListener('touchend', handleTouchEndGesture, { passive: false });
    }
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStartGesture);
      document.removeEventListener('touchend', handleTouchEndGesture);
    };
  }, [isPlaying, onMoveLeft, onMoveRight, onJump]);

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto md:hidden">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {/* Movement Controls */}
        <div className="flex space-x-4">
          <Button
            ref={leftButtonRef}
            onTouchStart={handleTouchStart(onMoveLeft)}
            onTouchEnd={handleTouchEnd}
            className="w-16 h-16 rounded-full bg-blue-500/80 hover:bg-blue-600/80 active:bg-blue-700/80 border-2 border-white/20"
            variant="ghost"
          >
            <ArrowLeft className="w-8 h-8 text-white" />
          </Button>
          
          <Button
            ref={rightButtonRef}
            onTouchStart={handleTouchStart(onMoveRight)}
            onTouchEnd={handleTouchEnd}
            className="w-16 h-16 rounded-full bg-blue-500/80 hover:bg-blue-600/80 active:bg-blue-700/80 border-2 border-white/20"
            variant="ghost"
          >
            <ArrowRight className="w-8 h-8 text-white" />
          </Button>
        </div>

        {/* Jump Control */}
        <Button
          ref={jumpButtonRef}
          onTouchStart={handleTouchStart(onJump)}
          onTouchEnd={handleTouchEnd}
          className="w-20 h-20 rounded-full bg-green-500/80 hover:bg-green-600/80 active:bg-green-700/80 border-2 border-white/20"
          variant="ghost"
        >
          <ArrowUp className="w-10 h-10 text-white" />
        </Button>

        {/* Pause Control */}
        <Button
          onTouchStart={handleTouchStart(isPaused ? onResume : onPause)}
          onTouchEnd={handleTouchEnd}
          className="w-16 h-16 rounded-full bg-purple-500/80 hover:bg-purple-600/80 active:bg-purple-700/80 border-2 border-white/20"
          variant="ghost"
        >
          {isPaused ? <Play className="w-8 h-8 text-white" /> : <Pause className="w-8 h-8 text-white" />}
        </Button>
      </div>
      
      {/* Touch hint */}
      <div className="text-center mt-4">
        <p className="text-white/70 text-sm">
          Tap buttons or swipe to control • Swipe up to jump
        </p>
      </div>
    </div>
  );
}
