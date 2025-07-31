import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { 
  User, 
  Trophy, 
  Coins, 
  Diamond, 
  Zap, 
  Star, 
  Target, 
  Clock, 
  ArrowLeft,
  Wallet,
  Copy,
  ExternalLink 
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { connectWallet, disconnectWallet, isConnecting } = useWeb3();

  const experienceToNextLevel = (state.player.level * 1000) - state.player.experience;
  const experienceProgress = (state.player.experience / (state.player.level * 1000)) * 100;

  const achievements = [
    { id: 'first_game', name: 'First Steps', description: 'Play your first game', unlocked: state.player.gamesPlayed > 0, icon: '🎮' },
    { id: 'coin_collector', name: 'Coin Collector', description: 'Collect 1000 coins', unlocked: state.player.coins >= 1000, icon: '🪙' },
    { id: 'diamond_hunter', name: 'Diamond Hunter', description: 'Collect 50 diamonds', unlocked: state.player.diamonds >= 50, icon: '💎' },
    { id: 'high_scorer', name: 'High Scorer', description: 'Reach 10,000 points', unlocked: state.player.highScore >= 10000, icon: '🏆' },
    { id: 'distance_runner', name: 'Distance Runner', description: 'Run 10,000 meters total', unlocked: state.player.totalDistance >= 10000, icon: '🏃' },
    { id: 'veteran', name: 'Veteran Player', description: 'Play 100 games', unlocked: state.player.gamesPlayed >= 100, icon: '⭐' },
  ];

  const copyAddress = () => {
    if (state.wallet.address) {
      navigator.clipboard.writeText(state.wallet.address);
    }
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
          <h1 className="text-4xl font-bold text-white mb-2">Player Profile</h1>
          <p className="text-gray-300">Track your progress and achievements</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="stats" className="text-white">Statistics</TabsTrigger>
            <TabsTrigger value="achievements" className="text-white">Achievements</TabsTrigger>
            <TabsTrigger value="wallet" className="text-white">Wallet</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Player Info Card */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">{state.player.name}</CardTitle>
                    <CardDescription className="text-gray-300">
                      Level {state.player.level} Player
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Experience to Level {state.player.level + 1}</span>
                      <span>{experienceToNextLevel} XP needed</span>
                    </div>
                    <Progress value={experienceProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/20 border-gray-700 text-center">
                <CardContent className="p-6">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <div className="text-3xl font-bold text-white">{state.player.highScore.toLocaleString()}</div>
                  <div className="text-gray-400">High Score</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700 text-center">
                <CardContent className="p-6">
                  <Coins className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <div className="text-3xl font-bold text-white">{state.player.coins.toLocaleString()}</div>
                  <div className="text-gray-400">Coins</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700 text-center">
                <CardContent className="p-6">
                  <Diamond className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <div className="text-3xl font-bold text-white">{state.player.diamonds.toLocaleString()}</div>
                  <div className="text-gray-400">Diamonds</div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700 text-center">
                <CardContent className="p-6">
                  <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <div className="text-3xl font-bold text-white">{state.player.gamesPlayed}</div>
                  <div className="text-gray-400">Games Played</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Game Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Distance</span>
                    <span className="text-white font-bold">{state.player.totalDistance.toLocaleString()}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Average Score</span>
                    <span className="text-white font-bold">
                      {state.player.gamesPlayed > 0 ? Math.floor(state.player.highScore / state.player.gamesPlayed).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Playtime</span>
                    <span className="text-white font-bold">{Math.floor(state.player.gamesPlayed * 2.5)} minutes</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Collection Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Coins per Game</span>
                    <span className="text-white font-bold">
                      {state.player.gamesPlayed > 0 ? Math.floor(state.player.coins / state.player.gamesPlayed) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Diamonds per Game</span>
                    <span className="text-white font-bold">
                      {state.player.gamesPlayed > 0 ? (state.player.diamonds / state.player.gamesPlayed).toFixed(1) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Experience Gained</span>
                    <span className="text-white font-bold">{state.player.experience.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`border-gray-700 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30' 
                      : 'bg-black/20'
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="text-white font-bold mb-2">{achievement.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                    <Badge 
                      variant={achievement.unlocked ? "default" : "secondary"}
                      className={achievement.unlocked ? "bg-yellow-500 text-black" : ""}
                    >
                      {achievement.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Wallet Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.wallet.isConnected ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-400 text-sm font-medium">Connected</span>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                            {state.wallet.address?.slice(0, 6)}...{state.wallet.address?.slice(-4)}
                          </span>
                          <Button size="sm" variant="ghost" onClick={copyAddress}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-gray-300 text-sm mt-2">
                          Balance: {parseFloat(state.wallet.balance).toFixed(4)} ETH
                        </div>
                      </div>
                      
                      <Button onClick={disconnectWallet} variant="outline" className="w-full">
                        Disconnect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
                        <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-300 mb-4">Connect your wallet to enable Web3 features</p>
                        <Button 
                          onClick={connectWallet} 
                          disabled={isConnecting}
                          className="bg-gradient-to-r from-blue-500 to-purple-600"
                        >
                          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Web3 Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg">
                      <span className="text-gray-300">Purchase Coins</span>
                      <Button size="sm" disabled={!state.wallet.isConnected}>
                        Buy
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg">
                      <span className="text-gray-300">Purchase Diamonds</span>
                      <Button size="sm" disabled={!state.wallet.isConnected}>
                        Buy
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg">
                      <span className="text-gray-300">NFT Rewards</span>
                      <Button size="sm" disabled={!state.wallet.isConnected}>
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
