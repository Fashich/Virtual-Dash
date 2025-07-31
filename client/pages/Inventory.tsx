import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Package, Zap, Shield, Star, Gift, Trash2, Play } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'powerup' | 'booster' | 'character' | 'trail';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  icon: React.ReactNode;
  isActive?: boolean;
  isEquipped?: boolean;
}

export default function Inventory() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [selectedTab, setSelectedTab] = useState<'powerups' | 'boosters' | 'cosmetics'>('powerups');

  // Mock inventory data - in a real app, this would come from game state
  const inventoryItems: InventoryItem[] = [
    {
      id: 'speed_boost',
      name: 'Speed Boost',
      description: 'Increases running speed by 50% for 30 seconds',
      type: 'powerup',
      rarity: 'common',
      quantity: 3,
      icon: <Zap className="w-8 h-8" />,
    },
    {
      id: 'coin_magnet',
      name: 'Coin Magnet',
      description: 'Automatically attracts coins for 45 seconds',
      type: 'powerup',
      rarity: 'common',
      quantity: 5,
      icon: <Star className="w-8 h-8" />,
    },
    {
      id: 'shield_protection',
      name: 'Shield Protection',
      description: 'Protects from one obstacle collision',
      type: 'powerup',
      rarity: 'rare',
      quantity: 2,
      icon: <Shield className="w-8 h-8" />,
    },
    {
      id: 'double_coins',
      name: '2x Coin Booster',
      description: 'Double coin collection for one game',
      type: 'booster',
      rarity: 'common',
      quantity: 1,
      icon: <Star className="w-8 h-8" />,
      isActive: true,
    },
    {
      id: 'cyber_runner',
      name: 'Cyber Runner',
      description: 'Futuristic character with +10% coin collection',
      type: 'character',
      rarity: 'legendary',
      quantity: 1,
      icon: <Gift className="w-8 h-8" />,
      isEquipped: true,
    },
    {
      id: 'fire_trail',
      name: 'Fire Trail',
      description: 'Blazing trail effect',
      type: 'trail',
      rarity: 'rare',
      quantity: 1,
      icon: <Star className="w-8 h-8" />,
      isEquipped: false,
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

  const filterItemsByTab = (tab: string) => {
    switch (tab) {
      case 'powerups':
        return inventoryItems.filter(item => item.type === 'powerup');
      case 'boosters':
        return inventoryItems.filter(item => item.type === 'booster');
      case 'cosmetics':
        return inventoryItems.filter(item => item.type === 'character' || item.type === 'trail');
      default:
        return inventoryItems;
    }
  };

  const handleActivateItem = (item: InventoryItem) => {
    console.log(`Activated ${item.name}`);
    // In a real app, this would activate the item for the next game
  };

  const handleEquipItem = (item: InventoryItem) => {
    console.log(`Equipped ${item.name}`);
    // In a real app, this would equip the cosmetic item
  };

  const getInventoryStats = () => {
    const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const activeItems = inventoryItems.filter(item => item.isActive || item.isEquipped).length;
    const rarityCount = inventoryItems.reduce((acc, item) => {
      acc[item.rarity] = (acc[item.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalItems, activeItems, rarityCount };
  };

  const stats = getInventoryStats();

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
            <Button onClick={() => navigate('/shop')} variant="outline">
              Visit Shop
            </Button>
            <Button onClick={() => navigate('/game')} className="bg-gradient-to-r from-green-500 to-emerald-600">
              Play Game
            </Button>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Inventory</h1>
          <p className="text-gray-300">Manage your items, power-ups, and cosmetics</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{stats.totalItems}</div>
              <div className="text-gray-400">Total Items</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Play className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{stats.activeItems}</div>
              <div className="text-gray-400">Active/Equipped</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white">{stats.rarityCount.epic || 0}</div>
              <div className="text-gray-400">Epic Items</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{stats.rarityCount.legendary || 0}</div>
              <div className="text-gray-400">Legendary Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Tabs */}
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/20">
            <TabsTrigger value="powerups" className="text-white">Power-ups</TabsTrigger>
            <TabsTrigger value="boosters" className="text-white">Boosters</TabsTrigger>
            <TabsTrigger value="cosmetics" className="text-white">Cosmetics</TabsTrigger>
          </TabsList>

          {/* Power-ups Tab */}
          <TabsContent value="powerups" className="space-y-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                  Power-ups
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Consumable items that provide temporary advantages during gameplay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterItemsByTab('powerups').map((item) => (
                    <Card 
                      key={item.id}
                      className={`bg-gradient-to-r ${getRarityBg(item.rarity)} border-gray-600`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-blue-400">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{item.name}</h4>
                              <Badge className={`${getRarityColor(item.rarity)} text-xs`} variant="outline">
                                {item.rarity}
                              </Badge>
                            </div>
                          </div>
                          <Badge className="bg-green-500 text-white">
                            x{item.quantity}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                        
                        <Button
                          onClick={() => handleActivateItem(item)}
                          disabled={item.quantity === 0}
                          className="w-full"
                          size="sm"
                        >
                          Activate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boosters Tab */}
          <TabsContent value="boosters" className="space-y-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-6 h-6 mr-2 text-purple-400" />
                  Boosters
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Game-wide enhancements that last for one complete game session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterItemsByTab('boosters').map((item) => (
                    <Card 
                      key={item.id}
                      className={`bg-gradient-to-r ${getRarityBg(item.rarity)} border-gray-600 ${
                        item.isActive ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-purple-400">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{item.name}</h4>
                              <Badge className={`${getRarityColor(item.rarity)} text-xs`} variant="outline">
                                {item.rarity}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className="bg-green-500 text-white">
                              x{item.quantity}
                            </Badge>
                            {item.isActive && (
                              <Badge className="bg-green-500 text-white text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                        
                        <Button
                          onClick={() => handleActivateItem(item)}
                          disabled={item.quantity === 0 || item.isActive}
                          className="w-full"
                          size="sm"
                          variant={item.isActive ? "outline" : "default"}
                        >
                          {item.isActive ? 'Active' : 'Activate'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cosmetics Tab */}
          <TabsContent value="cosmetics" className="space-y-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="w-6 h-6 mr-2 text-pink-400" />
                  Cosmetics
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Characters, trails, and visual customizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterItemsByTab('cosmetics').map((item) => (
                    <Card 
                      key={item.id}
                      className={`bg-gradient-to-r ${getRarityBg(item.rarity)} border-gray-600 ${
                        item.isEquipped ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-pink-400">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{item.name}</h4>
                              <Badge className={`${getRarityColor(item.rarity)} text-xs`} variant="outline">
                                {item.rarity}
                              </Badge>
                            </div>
                          </div>
                          {item.isEquipped && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              Equipped
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                        
                        <Button
                          onClick={() => handleEquipItem(item)}
                          className="w-full"
                          size="sm"
                          variant={item.isEquipped ? "outline" : "default"}
                        >
                          {item.isEquipped ? 'Equipped' : 'Equip'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Play className="w-6 h-6 mr-2" />
                Ready to Play?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Your items are ready! Start a game to use your power-ups and boosters.
              </p>
              <Button 
                onClick={() => navigate('/game')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
              >
                Start Game
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Need More Items?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Visit the shop to purchase more power-ups, boosters, and cosmetics.
              </p>
              <Button 
                onClick={() => navigate('/shop')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Visit Shop
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Tips */}
        <Card className="bg-black/20 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Inventory Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Power-ups & Boosters</h4>
                <ul className="text-sm space-y-1">
                  <li>• Power-ups are consumed when used in-game</li>
                  <li>• Boosters last for one complete game session</li>
                  <li>• Activate boosters before starting a game</li>
                  <li>• Stack different types for maximum effect</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Cosmetics</h4>
                <ul className="text-sm space-y-1">
                  <li>• Characters and trails are permanent unlocks</li>
                  <li>• Some characters provide gameplay bonuses</li>
                  <li>• Only one character and trail can be equipped at a time</li>
                  <li>• Cosmetics carry over between game sessions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
