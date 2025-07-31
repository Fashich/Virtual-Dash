import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { 
  Gamepad2, 
  Home, 
  User, 
  Trophy, 
  ShoppingCart, 
  Zap, 
  CreditCard, 
  BookOpen, 
  Package,
  Coins,
  Diamond,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface GameLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
}

export default function GameLayout({ children, title, showNavigation = true }: GameLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useGame();
  const { connectWallet, isConnecting } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { path: '/game', label: 'Play', icon: <Gamepad2 className="w-4 h-4" /> },
    { path: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { path: '/upgrade', label: 'Upgrades', icon: <Zap className="w-4 h-4" /> },
    { path: '/shop', label: 'Shop', icon: <ShoppingCart className="w-4 h-4" /> },
    { path: '/inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { path: '/topup', label: 'Top Up', icon: <CreditCard className="w-4 h-4" /> },
    { path: '/guide', label: 'Guide', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const isCurrentPath = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Top Navigation */}
      {showNavigation && (
        <nav className="border-b border-gray-700 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <Gamepad2 className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold text-white">Virtual Dash</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    variant={isCurrentPath(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      isCurrentPath(item.path) 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {item.icon}
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                ))}
              </div>

              {/* User Status & Mobile Menu */}
              <div className="flex items-center space-x-4">
                {/* Currency Display (Desktop) */}
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm">{state.player.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">{state.player.diamonds}</span>
                  </div>
                </div>

                {/* Wallet Status */}
                {state.wallet.isConnected ? (
                  <Badge variant="secondary" className="hidden md:flex">
                    <Wallet className="w-3 h-3 mr-1" />
                    {state.wallet.address?.slice(0, 6)}...
                  </Badge>
                ) : (
                  <Button 
                    onClick={connectWallet} 
                    disabled={isConnecting}
                    variant="outline" 
                    size="sm"
                    className="hidden md:flex"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </Button>
                )}

                {/* Mobile Menu Button */}
                <Button
                  onClick={toggleMobileMenu}
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-white"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-700 py-4">
                {/* Currency Display (Mobile) */}
                <div className="flex items-center justify-center space-x-6 mb-4 pb-4 border-b border-gray-700">
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm">{state.player.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">{state.player.diamonds}</span>
                  </div>
                  {!state.wallet.isConnected && (
                    <Button 
                      onClick={connectWallet} 
                      disabled={isConnecting}
                      variant="outline" 
                      size="sm"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>

                {/* Navigation Items (Mobile) */}
                <div className="grid grid-cols-2 gap-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      variant={isCurrentPath(item.path) ? "default" : "ghost"}
                      className={`justify-start ${
                        isCurrentPath(item.path) 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Page Title */}
      {title && (
        <div className="border-b border-gray-700 bg-black/10">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white text-center">{title}</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-black/20 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Virtual Dash</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Built with Three.js & Web3</span>
              <span>•</span>
              <span>&copy; 2024 Virtual Dash</span>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                onClick={() => navigate('/guide')}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                Help
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
