import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { Wallet, User, ArrowLeft, Gamepad2, Mail, LogIn, UserCheck, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const { connectWallet, isConnecting, error } = useWeb3();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLoginError('Please fill in all fields');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any email/password combination works
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: {
          id: playerId,
          name: email.split('@')[0], // Use email prefix as display name
          email: email.trim(),
          coins: 2500, // Returning player bonus
          diamonds: 25, // Returning player bonus
        },
      });

      setIsLoggingIn(false);
      navigate('/');
    } catch (error) {
      setIsLoggingIn(false);
      setLoginError('Login failed. Please try again.');
      console.error('Error logging in:', error);
    }
  };

  const handleWalletLogin = async () => {
    try {
      await connectWallet();
      if (!error) {
        // Auto-login with wallet
        navigate('/');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Button - Better positioned */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2F61bb2c2b59304a3e8ff6f05c93913451%2Fb4dbc5f8d01c47418626106a29f0d54b?format=webp&width=800" 
              alt="Virtual Dash Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <h1 className="text-2xl font-bold text-white">Virtual Dash</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300">Sign in to continue your space adventure</p>
        </div>

        {/* Login Form */}
        <Card className="bg-black/20 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign In</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Access your player profile and continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Web3 Wallet Login */}
            <div className="space-y-4">
              <Button
                onClick={handleWalletLogin}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet & Sign In'}
              </Button>
              
              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/20 px-2 text-gray-400">or</span>
              </div>
            </div>

            {/* Traditional Login */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/20 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {loginError && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-300">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleLogin}
                disabled={!email.trim() || !password.trim() || isLoggingIn}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>

            {/* Benefits for Returning Players */}
            <div className="mt-8 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
              <h3 className="text-white font-semibold mb-2">Welcome Back Bonus</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">+2,500 Coins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">+25 Diamonds</span>
                </div>
              </div>
            </div>

            {/* Signup Alternative */}
            <div className="text-center space-y-3">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </p>
              
              {/* Guest Play Option */}
              <div className="border-t border-gray-600 pt-4">
                <Button
                  onClick={() => {
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
                  }}
                  variant="ghost"
                  className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50"
                  size="sm"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Play as Guest
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Progress won't be saved in guest mode
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <Card className="bg-black/10 border-gray-700 p-4">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-white text-sm font-medium">Space Racing</div>
          </Card>
          <Card className="bg-black/10 border-gray-700 p-4">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-white text-sm font-medium">Cosmic Rewards</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
