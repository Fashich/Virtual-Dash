import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, ShoppingCart, Coins, Diamond, Zap, Shield, Star, Gift } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'diamonds';
  icon: React.ReactNode;
  category: 'powerups' | 'characters' | 'trails' | 'boosters';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  duration?: string;
  effect?: string;
}

export default function Shop() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<'powerups' | 'characters' | 'trails' | 'boosters'>('powerups');

  const shopItems: ShopItem[] = [
    // Power-ups
    {
      id: 'speed_boost',
      name: 'Speed Boost',
      description: 'Increases your running speed for a limited time',
      price: 100,
      currency: 'coins',
      icon: <Zap className="w-8 h-8" />,
      category: 'powerups',
      rarity: 'common',
      duration: '30 seconds',
      effect: '+50% speed'
    },
    {
      id: 'coin_magnet',
      name: 'Coin Magnet',
      description: 'Automatically attracts all coins in a large radius',
      price: 150,
      currency: 'coins',
      icon: <Coins className="w-8 h-8" />,
      category: 'powerups',
      rarity: 'common',
      duration: '45 seconds',
      effect: 'Auto-collect coins'
    },
    {
      id: 'shield_protection',
      name: 'Shield Protection',
      description: 'Protects you from one obstacle collision',
      price: 200,
      currency: 'coins',
      icon: <Shield className="w-8 h-8" />,
      category: 'powerups',
      rarity: 'rare',
      duration: 'Single use',
      effect: 'Obstacle immunity'
    },
    {
      id: 'diamond_rush',
      name: 'Diamond Rush',
      description: 'Converts all coins to diamonds temporarily',
      price: 5,
      currency: 'diamonds',
      icon: <Diamond className="w-8 h-8" />,
      category: 'powerups',
      rarity: 'epic',
      duration: '20 seconds',
      effect: 'Coins → Diamonds'
    },

    // Boosters
    {
      id: 'double_coins',
      name: '2x Coin Booster',
      description: 'Double coin collection for your next game',
      price: 50,
      currency: 'coins',
      icon: <Coins className="w-8 h-8" />,
      category: 'boosters',
      rarity: 'common',
      duration: 'One game',
      effect: '2x coin value'
    },
    {
      id: 'score_multiplier',
      name: 'Score Multiplier',
      description: 'Increases score by 50% for your next game',
      price: 3,
      currency: 'diamonds',
      icon: <Star className="w-8 h-8" />,
      category: 'boosters',
      rarity: 'rare',
      duration: 'One game',
      effect: '+50% score'
    },
    {
      id: 'lucky_start',
      name: 'Lucky Start',
      description: 'Begin your next game with 3 power-ups active',
      price: 8,
      currency: 'diamonds',
      icon: <Gift className="w-8 h-8" />,
      category: 'boosters',
      rarity: 'epic',
      duration: 'Game start',
      effect: '3 random power-ups'
    },

    // Characters (placeholder for future updates)
    {
      id: 'cyber_runner',
      name: 'Cyber Runner',
      description: 'Futuristic character with neon trails',
      price: 25,
      currency: 'diamonds',
      icon: <Star className="w-8 h-8" />,
      category: 'characters',
      rarity: 'legendary',
      effect: '+10% coin collection'
    },
    {
      id: 'ninja_dash',
      name: 'Ninja Dash',
      description: 'Stealthy character with enhanced jump ability',
      price: 20,
      currency: 'diamonds',
      icon: <Zap className="w-8 h-8" />,
      category: 'characters',
      rarity: 'epic',
      effect: '+25% jump height'
    },

    // Trails
    {
      id: 'fire_trail',
      name: 'Fire Trail',
      description: 'Leave a blazing trail behind you',
      price: 300,
      currency: 'coins',
      icon: <Star className="w-8 h-8" />,
      category: 'trails',
      rarity: 'rare',
      effect: 'Visual effect'
    },
    {
      id: 'rainbow_trail',
      name: 'Rainbow Trail',
      description: 'Colorful rainbow trail effect',
      price: 10,
      currency: 'diamonds',
      icon: <Star className="w-8 h-8" />,
      category: 'trails',
      rarity: 'epic',
      effect: 'Visual effect'
    },
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-500',
      rare: 'text-blue-400 border-blue-500',
      epic: 'text-purple-400 border-purple-500',
      legendary: 'text-yellow-400 border-yellow-500',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityBg = (rarity: string) => {
    const backgrounds = {
      common: 'from-gray-500/20 to-gray-600/20',
      rare: 'from-blue-500/20 to-blue-600/20',
      epic: 'from-purple-500/20 to-purple-600/20',
      legendary: 'from-yellow-500/20 to-yellow-600/20',
    };
    return backgrounds[rarity as keyof typeof backgrounds] || backgrounds.common;
  };

  const canAfford = (item: ShopItem) => {
    if (item.currency === 'coins') {
      return state.player.coins >= item.price;
    } else {
      return state.player.diamonds >= item.price;
    }
  };

  const handlePurchase = (item: ShopItem) => {
    if (!canAfford(item)) return;

    // Deduct currency
    if (item.currency === 'coins') {
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { coins: state.player.coins - item.price }
      });
    } else {
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { diamonds: state.player.diamonds - item.price }
      });
    }

    // Add item to inventory (you'd implement this in a real app)
    console.log(`Purchased ${item.name}`);
  };

  const filteredItems = shopItems.filter(item => item.category === selectedCategory);

  const categories = [
    { id: 'powerups', name: 'Power-ups', icon: <Zap className="w-4 h-4" /> },
    { id: 'boosters', name: 'Boosters', icon: <Star className="w-4 h-4" /> },
    { id: 'characters', name: 'Characters', icon: <Gift className="w-4 h-4" /> },
    { id: 'trails', name: 'Trails', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="container mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex space-x-2">
            <Button onClick={() => navigate('/game')} className="bg-gradient-to-r from-green-500 to-emerald-600">
              Play Game
            </Button>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Item Shop</h1>
          <p className="text-gray-300">Purchase power-ups, boosters, and cosmetics to enhance your gameplay</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Currency Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{state.player.coins.toLocaleString()}</div>
              <div className="text-gray-400">Coins</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Diamond className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{state.player.diamonds}</div>
              <div className="text-gray-400">Diamonds</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-4 gap-2 bg-black/20 p-2 rounded-lg">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className={`flex items-center space-x-2 ${
                  selectedCategory === category.id ? 'bg-blue-500' : 'text-white hover:bg-gray-700'
                }`}
              >
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Shop Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card 
              key={item.id}
              className={`bg-gradient-to-r ${getRarityBg(item.rarity)} border-gray-700 hover:scale-105 transition-transform duration-200`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-400">
                      {item.icon}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                      <Badge className={`${getRarityColor(item.rarity)} text-xs`} variant="outline">
                        {item.rarity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-300">
                  {item.description}
                </CardDescription>
                
                {item.duration && (
                  <div className="text-sm text-gray-400">
                    <strong>Duration:</strong> {item.duration}
                  </div>
                )}
                
                {item.effect && (
                  <div className="text-sm text-green-400">
                    <strong>Effect:</strong> {item.effect}
                  </div>
                )}
                
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-white flex items-center space-x-2">
                      {item.currency === 'coins' ? (
                        <Coins className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <Diamond className="w-6 h-6 text-blue-400" />
                      )}
                      <span>{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford(item)}
                    className="w-full"
                    variant={canAfford(item) ? "default" : "outline"}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {canAfford(item) ? 'Purchase' : 'Insufficient Funds'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Shop Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-green-400" />
                How the Shop Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>• Power-ups are consumed when activated in-game</p>
              <p>• Boosters last for one game session</p>
              <p>• Characters and trails are permanent purchases</p>
              <p>• Items are automatically added to your inventory</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Rarity Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Common</span>
                <Badge className="text-gray-400 border-gray-500" variant="outline">Basic items</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400">Rare</span>
                <Badge className="text-blue-400 border-blue-500" variant="outline">Enhanced effects</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400">Epic</span>
                <Badge className="text-purple-400 border-purple-500" variant="outline">Powerful abilities</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400">Legendary</span>
                <Badge className="text-yellow-400 border-yellow-500" variant="outline">Exclusive items</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Shop Actions */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Need More Currency?</h3>
              <p className="text-gray-300 mb-6">
                Purchase coins and diamonds to unlock more items and upgrades
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => navigate('/topup')}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Top Up Currency
                </Button>
                <Button 
                  onClick={() => navigate('/upgrade')}
                  size="lg"
                  variant="outline"
                >
                  Character Upgrades
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
