import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Trophy, Medal, Star, Crown, Target, Timer, Coins } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  distance: number;
  coins: number;
  level: number;
  isCurrentPlayer?: boolean;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { state } = useGame();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'alltime'>('alltime');

  // Mock leaderboard data - in a real app, this would come from an API
  const generateLeaderboardData = (): LeaderboardEntry[] => {
    const mockPlayers = [
      { name: 'DashMaster', score: 89750, distance: 8975, coins: 12450, level: 15 },
      { name: 'SpeedRunner', score: 76890, distance: 7689, coins: 11230, level: 12 },
      { name: 'CoinCollector', score: 68420, distance: 6842, coins: 15680, level: 14 },
      { name: 'ProGamer2024', score: 61250, distance: 6125, coins: 9870, level: 11 },
      { name: 'DiamondHunter', score: 58790, distance: 5879, coins: 8940, level: 13 },
      { name: 'VirtualAce', score: 54320, distance: 5432, coins: 7650, level: 10 },
      { name: 'RunnerX', score: 49860, distance: 4986, coins: 6780, level: 9 },
      { name: 'DashLegend', score: 45230, distance: 4523, coins: 5890, level: 8 },
      { name: 'ObstacleKing', score: 41670, distance: 4167, coins: 5120, level: 7 },
      { name: 'JumpMaster', score: 38450, distance: 3845, coins: 4560, level: 6 },
    ];

    const leaderboard = mockPlayers.map((player, index) => ({
      rank: index + 1,
      playerName: player.name,
      score: player.score,
      distance: player.distance,
      coins: player.coins,
      level: player.level,
      isCurrentPlayer: false,
    }));

    // Add current player if they have a score
    if (state.player.highScore > 0) {
      const currentPlayerRank = leaderboard.findIndex(entry => entry.score < state.player.highScore) + 1;
      const playerEntry: LeaderboardEntry = {
        rank: currentPlayerRank || leaderboard.length + 1,
        playerName: state.player.name,
        score: state.player.highScore,
        distance: state.player.totalDistance,
        coins: state.player.coins,
        level: state.player.level,
        isCurrentPlayer: true,
      };

      if (currentPlayerRank > 0) {
        leaderboard.splice(currentPlayerRank - 1, 0, playerEntry);
        // Update ranks for entries below
        for (let i = currentPlayerRank; i < leaderboard.length; i++) {
          leaderboard[i].rank = i + 1;
        }
      } else {
        leaderboard.push(playerEntry);
      }
    }

    return leaderboard.slice(0, 20); // Top 20
  };

  const leaderboardData = generateLeaderboardData();
  const currentPlayerEntry = leaderboardData.find(entry => entry.isCurrentPlayer);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-white font-bold text-lg">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black',
        2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-black',
        3: 'bg-gradient-to-r from-orange-400 to-orange-600 text-black',
      };
      return colors[rank as keyof typeof colors];
    }
    return 'bg-gray-700 text-white';
  };

  const periods = [
    { id: 'daily', label: 'Daily', description: 'Last 24 hours' },
    { id: 'weekly', label: 'Weekly', description: 'Last 7 days' },
    { id: 'alltime', label: 'All Time', description: 'Since launch' },
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
          <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-300">Compete with players worldwide and climb the rankings</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl">
        {/* Current Player Stats */}
        {currentPlayerEntry && (
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                Your Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">#{currentPlayerEntry.rank}</div>
                  <div className="text-gray-300 text-sm">Global Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{currentPlayerEntry.score.toLocaleString()}</div>
                  <div className="text-gray-300 text-sm">High Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{currentPlayerEntry.distance.toLocaleString()}m</div>
                  <div className="text-gray-300 text-sm">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">Level {currentPlayerEntry.level}</div>
                  <div className="text-gray-300 text-sm">Player Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-2 bg-black/20 p-2 rounded-lg">
            {periods.map((period) => (
              <Button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as any)}
                variant={selectedPeriod === period.id ? "default" : "ghost"}
                className={`${selectedPeriod === period.id ? 'bg-blue-500' : 'text-white hover:bg-gray-700'}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-black/20 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
              Global Rankings - {periods.find(p => p.id === selectedPeriod)?.label}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {periods.find(p => p.id === selectedPeriod)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboardData.map((entry, index) => (
                <div
                  key={`${entry.playerName}-${index}`}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                    entry.isCurrentPlayer 
                      ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/50' 
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">
                          {entry.playerName}
                        </span>
                        {entry.isCurrentPlayer && (
                          <Badge className="bg-blue-500 text-white text-xs">You</Badge>
                        )}
                        <Badge 
                          className={`text-xs ${getRankBadge(entry.rank)}`}
                        >
                          Rank #{entry.rank}
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-sm">Level {entry.level}</div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="text-white font-bold">{entry.score.toLocaleString()}</div>
                        <div className="text-gray-400">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">{entry.distance.toLocaleString()}m</div>
                        <div className="text-gray-400">Distance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">{entry.coins.toLocaleString()}</div>
                        <div className="text-gray-400">Coins</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                How Rankings Work
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>• Rankings are based on your highest score achieved</p>
              <p>• Leaderboards update in real-time after each game</p>
              <p>• Ties are broken by total distance traveled</p>
              <p>• Only registered players appear on leaderboards</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Climbing the Ranks
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>• Upgrade your abilities to achieve higher scores</p>
              <p>• Practice consistently to improve your skills</p>
              <p>• Learn from top players' strategies</p>
              <p>• Focus on longer runs rather than risky plays</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Climb the Leaderboard?</h3>
              <p className="text-gray-300 mb-6">
                Challenge yourself and see how high you can rank!
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => navigate('/game')}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Play Now
                </Button>
                <Button 
                  onClick={() => navigate('/upgrade')}
                  size="lg"
                  variant="outline"
                >
                  Upgrade Character
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
