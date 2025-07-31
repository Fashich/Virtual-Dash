import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Zap, Target, Shield, Coins, Diamond, Star, Rocket } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UpgradeItem {
  id: keyof typeof initialUpgrades;
  name: string;
  description: string;
  icon: React.ReactNode;
  maxLevel: number;
  costType: 'coins' | 'diamonds';
  baseCost: number;
  effect: string;
}

const initialUpgrades = {
  speed: 1,
  magnetism: 1,
  coinMultiplier: 1,
  shield: 1,
  jump: 1,
  doubleJump: false,
};

export default function Upgrade() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);

  const upgrades: UpgradeItem[] = [
    {
      id: 'speed',
      name: 'Speed Boost',
      description: 'Increases your running speed and agility',
      icon: <Rocket className="w-8 h-8" />,
      maxLevel: 10,
      costType: 'coins',
      baseCost: 500,
      effect: '+20% speed per level',
    },
    {
      id: 'magnetism',
      name: 'Coin Magnet',
      description: 'Attracts coins from a larger distance',
      icon: <Target className="w-8 h-8" />,
      maxLevel: 8,
      costType: 'coins',
      baseCost: 750,
      effect: '+1m attraction radius per level',
    },
    {
      id: 'coinMultiplier',
      name: 'Coin Multiplier',
      description: 'Increases coins earned per collection',
      icon: <Coins className="w-8 h-8" />,
      maxLevel: 5,
      costType: 'diamonds',
      baseCost: 5,
      effect: '+50% coin value per level',
    },
    {
      id: 'shield',
      name: 'Shield Power',
      description: 'Provides protection against obstacles',
      icon: <Shield className="w-8 h-8" />,
      maxLevel: 3,
      costType: 'diamonds',
      baseCost: 10,
      effect: '+1 hit protection per level',
    },
    {
      id: 'jump',
      name: 'Jump Height',
      description: 'Increases jump height and duration',
      icon: <Zap className="w-8 h-8" />,
      maxLevel: 7,
      costType: 'coins',
      baseCost: 600,
      effect: '+25% jump height per level',
    },
  ];

  const calculateUpgradeCost = (upgrade: UpgradeItem, currentLevel: number): number => {
    return Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel - 1));
  };

  const canAffordUpgrade = (upgrade: UpgradeItem, currentLevel: number): boolean => {
    const cost = calculateUpgradeCost(upgrade, currentLevel);
    if (upgrade.costType === 'coins') {
      return state.player.coins >= cost;
    } else {
      return state.player.diamonds >= cost;
    }
  };

  const handleUpgrade = (upgrade: UpgradeItem) => {
    const currentLevel = state.upgrades[upgrade.id] as number;
    
    if (currentLevel >= upgrade.maxLevel) {
      return;
    }

    const cost = calculateUpgradeCost(upgrade, currentLevel);
    
    if (!canAffordUpgrade(upgrade, currentLevel)) {
      return;
    }

    // Deduct cost
    if (upgrade.costType === 'coins') {
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { coins: state.player.coins - cost },
      });
    } else {
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { diamonds: state.player.diamonds - cost },
      });
    }

    // Apply upgrade
    dispatch({
      type: 'UPGRADE_SKILL',
      payload: { skill: upgrade.id, level: currentLevel + 1 },
    });
  };

  const getTotalUpgradePoints = (): number => {
    return Object.values(state.upgrades).reduce((total, level) => {
      return total + (typeof level === 'number' ? level - 1 : level ? 1 : 0);
    }, 0);
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Character Upgrades</h1>
          <p className="text-gray-300">Enhance your abilities and become unstoppable</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Player Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white">{getTotalUpgradePoints()}</div>
              <div className="text-gray-400">Upgrade Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upgrades.map((upgrade) => {
            const currentLevel = state.upgrades[upgrade.id] as number;
            const isMaxLevel = currentLevel >= upgrade.maxLevel;
            const cost = isMaxLevel ? 0 : calculateUpgradeCost(upgrade, currentLevel);
            const canAfford = isMaxLevel || canAffordUpgrade(upgrade, currentLevel);
            const progressPercentage = (currentLevel / upgrade.maxLevel) * 100;

            return (
              <Card 
                key={upgrade.id}
                className={`bg-black/20 border-gray-700 transition-all duration-200 hover:bg-black/30 ${
                  selectedUpgrade === upgrade.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedUpgrade(selectedUpgrade === upgrade.id ? null : upgrade.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">
                        {upgrade.icon}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{upgrade.name}</CardTitle>
                        <Badge 
                          variant={isMaxLevel ? "default" : "secondary"}
                          className={isMaxLevel ? "bg-yellow-500 text-black" : ""}
                        >
                          Level {currentLevel}{isMaxLevel ? ' (MAX)' : ` / ${upgrade.maxLevel}`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-300">
                    {upgrade.description}
                  </CardDescription>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Progress</span>
                      <span>{currentLevel} / {upgrade.maxLevel}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">
                      <strong>Effect:</strong> {upgrade.effect}
                    </div>
                    
                    {!isMaxLevel && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          Next upgrade cost:
                        </div>
                        <div className="flex items-center space-x-1">
                          {upgrade.costType === 'coins' ? (
                            <Coins className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Diamond className="w-4 h-4 text-blue-400" />
                          )}
                          <span className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                            {cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(upgrade);
                    }}
                    disabled={isMaxLevel || !canAfford}
                    className="w-full"
                    variant={canAfford && !isMaxLevel ? "default" : "outline"}
                  >
                    {isMaxLevel ? 'Maxed Out' : canAfford ? 'Upgrade' : 'Insufficient Funds'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Special Upgrades */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Special Abilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-purple-400" />
                  Double Jump
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 mb-4">
                  Allows you to jump twice in mid-air for better obstacle avoidance
                </CardDescription>
                
                {state.upgrades.doubleJump ? (
                  <Badge className="bg-green-500 text-white">
                    Unlocked
                  </Badge>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Cost:</span>
                      <div className="flex items-center space-x-1">
                        <Diamond className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-bold">25</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (state.player.diamonds >= 25) {
                          dispatch({
                            type: 'UPDATE_PLAYER',
                            payload: { diamonds: state.player.diamonds - 25 },
                          });
                          dispatch({
                            type: 'UPGRADE_SKILL',
                            payload: { skill: 'doubleJump', level: 1 },
                          });
                        }
                      }}
                      disabled={state.player.diamonds < 25}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      {state.player.diamonds >= 25 ? 'Unlock' : 'Insufficient Diamonds'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-6 h-6 mr-2 text-orange-400" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 mb-4">
                  More special abilities are coming in future updates!
                </CardDescription>
                <Badge variant="outline" className="text-gray-400">
                  Stay Tuned
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upgrade Tips */}
        <div className="mt-12">
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Zap className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>Pro Tip:</strong> Focus on Speed Boost and Coin Magnet early for better gameplay experience. 
              Save diamonds for Coin Multiplier and special abilities!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
