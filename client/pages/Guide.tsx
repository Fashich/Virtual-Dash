import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Gamepad2, 
  Target, 
  Coins, 
  Diamond, 
  Zap, 
  Shield, 
  Star,
  ArrowUp,
  ArrowDown,
  ArrowLeftIcon,
  ArrowRight,
  Space
} from 'lucide-react';

export default function Guide() {
  const navigate = useNavigate();

  const controls = [
    { key: 'Arrow Keys / WASD', action: 'Move left and right', icon: <ArrowLeftIcon className="w-5 h-5" /> },
    { key: 'Space / Arrow Up', action: 'Jump over obstacles', icon: <ArrowUp className="w-5 h-5" /> },
    { key: 'Mouse', action: 'Pause menu interaction', icon: <Target className="w-5 h-5" /> },
  ];

  const gameObjects = [
    { 
      name: 'Coins', 
      description: 'Collect to earn currency for upgrades',
      color: 'text-yellow-400',
      icon: <Coins className="w-6 h-6" />,
      value: '10 points each',
      tip: 'Coins are the most common collectible - grab as many as you can!'
    },
    { 
      name: 'Diamonds', 
      description: 'Premium currency for special upgrades',
      color: 'text-blue-400',
      icon: <Diamond className="w-6 h-6" />,
      value: '100 points each',
      tip: 'Diamonds are rare but valuable - prioritize them when safe to collect.'
    },
    { 
      name: 'Power-ups', 
      description: 'Temporary abilities and boosts',
      color: 'text-purple-400',
      icon: <Zap className="w-6 h-6" />,
      value: '50 points each',
      tip: 'Power-ups provide temporary advantages - use them strategically!'
    },
    { 
      name: 'Obstacles', 
      description: 'Barriers that end your run if hit',
      color: 'text-red-400',
      icon: <Shield className="w-6 h-6" />,
      value: 'Game Over',
      tip: 'Jump over or dodge around obstacles to keep your run going.'
    },
  ];

  const strategies = [
    {
      title: 'Early Game Strategy',
      tips: [
        'Focus on collecting coins to fund your first upgrades',
        'Prioritize Speed Boost and Coin Magnet upgrades',
        'Practice jumping timing to avoid obstacles',
        'Don\'t risk difficult diamond collections until you\'re more skilled'
      ]
    },
    {
      title: 'Mid Game Strategy',
      tips: [
        'Invest in Coin Multiplier to increase earnings',
        'Start collecting diamonds for premium upgrades',
        'Use Shield Power to survive longer runs',
        'Learn obstacle patterns to improve consistency'
      ]
    },
    {
      title: 'Advanced Strategy',
      tips: [
        'Max out all upgrades for optimal performance',
        'Unlock Double Jump for advanced maneuvers',
        'Focus on achieving high scores for leaderboard positions',
        'Master the rhythm of the game for longer runs'
      ]
    }
  ];

  const achievements = [
    { name: 'First Steps', requirement: 'Play your first game', reward: 'Experience' },
    { name: 'Coin Collector', requirement: 'Collect 1000 coins total', reward: 'Badge' },
    { name: 'Diamond Hunter', requirement: 'Collect 50 diamonds total', reward: 'Special Title' },
    { name: 'High Scorer', requirement: 'Reach 10,000 points', reward: 'Exclusive Avatar' },
    { name: 'Distance Runner', requirement: 'Run 10,000 meters total', reward: 'Endurance Badge' },
    { name: 'Veteran Player', requirement: 'Play 100 games', reward: 'Veteran Status' },
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
          <h1 className="text-4xl font-bold text-white mb-2">Game Guide</h1>
          <p className="text-gray-300">Learn how to master Virtual Dash and achieve high scores</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        <Tabs defaultValue="basics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20">
            <TabsTrigger value="basics" className="text-white">Game Basics</TabsTrigger>
            <TabsTrigger value="strategy" className="text-white">Strategy</TabsTrigger>
            <TabsTrigger value="upgrades" className="text-white">Upgrades</TabsTrigger>
            <TabsTrigger value="achievements" className="text-white">Achievements</TabsTrigger>
          </TabsList>

          {/* Game Basics Tab */}
          <TabsContent value="basics" className="space-y-6">
            {/* Controls */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gamepad2 className="w-6 h-6 mr-2" />
                  Controls
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Master these controls to navigate through the game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {controls.map((control, index) => (
                    <Card key={index} className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-4 text-center">
                        <div className="text-blue-400 mb-2">
                          {control.icon}
                        </div>
                        <div className="text-white font-semibold text-sm mb-1">{control.key}</div>
                        <div className="text-gray-300 text-xs">{control.action}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Objects */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Game Objects</CardTitle>
                <CardDescription className="text-gray-300">
                  Learn about different objects you'll encounter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameObjects.map((obj, index) => (
                    <Card key={index} className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={obj.color}>
                            {obj.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{obj.name}</h4>
                            <p className="text-gray-300 text-sm mb-2">{obj.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {obj.value}
                            </Badge>
                            <p className="text-gray-400 text-xs mt-2">{obj.tip}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Objective */}
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Game Objective
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="mb-4">
                  The goal of Virtual Dash is to run as far as possible while collecting coins, diamonds, 
                  and power-ups. Avoid obstacles to keep your run going and achieve the highest score possible.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Collect coins and diamonds to earn points and currency</li>
                  <li>Jump over or dodge obstacles to avoid game over</li>
                  <li>Use collected currency to upgrade your abilities</li>
                  <li>Compete with other players on the global leaderboard</li>
                  <li>Unlock achievements by reaching specific milestones</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategies.map((strategy, index) => (
                <Card key={index} className="bg-black/20 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{strategy.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {strategy.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2">
                          <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pro Tips */}
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-6 h-6 mr-2" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Movement Tips</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Stay in the center lane when possible</li>
                      <li>• Jump early rather than late</li>
                      <li>• Use quick taps for precise movements</li>
                      <li>• Plan your route ahead of obstacles</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Collection Tips</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Prioritize safety over collection</li>
                      <li>• Use Coin Magnet upgrade effectively</li>
                      <li>• Save diamonds for crucial upgrades</li>
                      <li>• Focus on consistent runs over risky plays</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upgrades Tab */}
          <TabsContent value="upgrades" className="space-y-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Upgrade Priority Guide</CardTitle>
                <CardDescription className="text-gray-300">
                  Recommended upgrade order for optimal gameplay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Badge className="bg-green-500 text-white mr-2">1st Priority</Badge>
                      Essential Upgrades
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h5 className="text-white font-medium">Speed Boost</h5>
                        <p className="text-gray-300 text-sm">Increases movement speed for better control</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h5 className="text-white font-medium">Coin Magnet</h5>
                        <p className="text-gray-300 text-sm">Attracts coins automatically</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Badge className="bg-yellow-500 text-black mr-2">2nd Priority</Badge>
                      Efficiency Upgrades
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h5 className="text-white font-medium">Coin Multiplier</h5>
                        <p className="text-gray-300 text-sm">Increases coin value significantly</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h5 className="text-white font-medium">Jump Height</h5>
                        <p className="text-gray-300 text-sm">Better obstacle clearance</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Badge className="bg-purple-500 text-white mr-2">3rd Priority</Badge>
                      Advanced Upgrades
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h5 className="text-white font-medium">Shield Power</h5>
                        <p className="text-gray-300 text-sm">Protection against obstacles</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h5 className="text-white font-medium">Double Jump</h5>
                        <p className="text-gray-300 text-sm">Ultimate mobility upgrade</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Achievement Guide</CardTitle>
                <CardDescription className="text-gray-300">
                  Complete these challenges to earn rewards and bragging rights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold">{achievement.name}</h4>
                          <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{achievement.requirement}</p>
                        <Badge variant="outline" className="text-xs">
                          Reward: {achievement.reward}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Achievement Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li>• Achievements unlock automatically when requirements are met</li>
                  <li>• Focus on natural progression rather than grinding specific achievements</li>
                  <li>• Some achievements have hidden requirements - experiment and explore!</li>
                  <li>• Check your profile regularly to track achievement progress</li>
                  <li>• Achievement rewards provide permanent benefits</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Play?</h3>
              <p className="text-gray-300 mb-6">
                Now that you know the basics, it's time to put your skills to the test!
              </p>
              <Button 
                onClick={() => navigate('/game')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Start Playing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
