import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gamepad2, Loader2 } from 'lucide-react';

interface GameLoadingProps {
  message?: string;
  progress?: number;
  subMessage?: string;
}

export default function GameLoading({ 
  message = "Loading Virtual Dash...", 
  progress = 0,
  subMessage 
}: GameLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="bg-black/20 border-gray-700 backdrop-blur-sm w-full max-w-md relative z-10">
        <CardContent className="p-8 text-center">
          {/* Logo Animation */}
          <div className="mb-8">
            <div className="relative">
              <Gamepad2 className="w-16 h-16 mx-auto text-blue-400 animate-bounce" />
              <div className="absolute inset-0 w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-purple-400 animate-spin opacity-50" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
          
          {progress > 0 && (
            <div className="mb-4">
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-sm text-gray-300">{progress}% Complete</p>
            </div>
          )}

          {subMessage && (
            <p className="text-gray-400 text-sm">{subMessage}</p>
          )}

          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-400"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
