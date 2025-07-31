import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { ArrowLeft, Coins, Diamond, Wallet, CreditCard, Star, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Package {
  id: string;
  name: string;
  type: 'coins' | 'diamonds';
  amount: number;
  bonus: number;
  price: number; // in ETH
  popular?: boolean;
  value?: string;
}

export default function TopUp() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { purchaseCoins, purchaseDiamonds, connectWallet, isConnecting } = useWeb3();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const coinPackages: Package[] = [
    {
      id: 'coins_small',
      name: 'Starter Pack',
      type: 'coins',
      amount: 1000,
      bonus: 0,
      price: 0.001,
    },
    {
      id: 'coins_medium',
      name: 'Popular Pack',
      type: 'coins',
      amount: 5000,
      bonus: 1000,
      price: 0.004,
      popular: true,
      value: '20% Bonus'
    },
    {
      id: 'coins_large',
      name: 'Value Pack',
      type: 'coins',
      amount: 10000,
      bonus: 3000,
      price: 0.007,
      value: '30% Bonus'
    },
    {
      id: 'coins_mega',
      name: 'Mega Pack',
      type: 'coins',
      amount: 25000,
      bonus: 10000,
      price: 0.015,
      value: '40% Bonus'
    },
  ];

  const diamondPackages: Package[] = [
    {
      id: 'diamonds_small',
      name: 'Gem Starter',
      type: 'diamonds',
      amount: 10,
      bonus: 0,
      price: 0.01,
    },
    {
      id: 'diamonds_medium',
      name: 'Gem Pack',
      type: 'diamonds',
      amount: 50,
      bonus: 10,
      price: 0.04,
      popular: true,
      value: '20% Bonus'
    },
    {
      id: 'diamonds_large',
      name: 'Premium Gems',
      type: 'diamonds',
      amount: 100,
      bonus: 30,
      price: 0.07,
      value: '30% Bonus'
    },
    {
      id: 'diamonds_mega',
      name: 'Diamond Vault',
      type: 'diamonds',
      amount: 250,
      bonus: 100,
      price: 0.15,
      value: '40% Bonus'
    },
  ];

  const handlePurchase = async (pkg: Package) => {
    if (!state.wallet.isConnected) {
      await connectWallet();
      return;
    }

    setSelectedPackage(pkg);
    setIsLoading(true);

    try {
      let txHash: string;
      const totalAmount = pkg.amount + pkg.bonus;

      if (pkg.type === 'coins') {
        txHash = await purchaseCoins(totalAmount);
      } else {
        txHash = await purchaseDiamonds(totalAmount);
      }

      // Show success message (you could add a toast here)
      console.log('Purchase successful:', txHash);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      // Show error message (you could add a toast here)
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  };

  const PackageCard = ({ pkg, packages }: { pkg: Package; packages: Package[] }) => (
    <Card 
      className={`relative transition-all duration-200 hover:scale-105 cursor-pointer ${
        pkg.popular 
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 ring-2 ring-purple-500/30' 
          : 'bg-black/20 border-gray-700 hover:bg-black/30'
      }`}
      onClick={() => handlePurchase(pkg)}
    >
      {pkg.popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2">
          {pkg.type === 'coins' ? (
            <Coins className="w-12 h-12 text-yellow-400" />
          ) : (
            <Diamond className="w-12 h-12 text-blue-400" />
          )}
        </div>
        <CardTitle className="text-white text-lg">{pkg.name}</CardTitle>
        {pkg.value && (
          <Badge variant="outline" className="text-green-400 border-green-400">
            {pkg.value}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div>
          <div className="text-3xl font-bold text-white">
            {pkg.amount.toLocaleString()}
          </div>
          {pkg.bonus > 0 && (
            <div className="text-green-400 text-sm">
              + {pkg.bonus.toLocaleString()} Bonus
            </div>
          )}
          <div className="text-gray-400 text-sm">
            {pkg.type === 'coins' ? 'Coins' : 'Diamonds'}
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-4">
          <div className="text-2xl font-bold text-white flex items-center justify-center">
            <span className="text-lg mr-1">Ξ</span>
            {pkg.price}
          </div>
          <div className="text-gray-400 text-sm">ETH</div>
        </div>
        
        <Button 
          className={`w-full ${
            pkg.popular 
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' 
              : ''
          }`}
          disabled={isLoading && selectedPackage?.id === pkg.id}
        >
          {isLoading && selectedPackage?.id === pkg.id ? 'Processing...' : 'Purchase'}
        </Button>
      </CardContent>
    </Card>
  );

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
          <h1 className="text-4xl font-bold text-white mb-2">Top Up</h1>
          <p className="text-gray-300">Purchase coins and diamonds to enhance your gaming experience</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Current Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{state.player.coins.toLocaleString()}</div>
              <div className="text-gray-400">Current Coins</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Diamond className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{state.player.diamonds}</div>
              <div className="text-gray-400">Current Diamonds</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-gray-700">
            <CardContent className="p-4 text-center">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-sm text-white">
                {state.wallet.isConnected ? 'Connected' : 'Not Connected'}
              </div>
              <div className="text-gray-400">Wallet Status</div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Connection Alert */}
        {!state.wallet.isConnected && (
          <Alert className="mb-8 bg-orange-500/10 border-orange-500/20">
            <Wallet className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200">
              <strong>Connect your wallet</strong> to purchase coins and diamonds with cryptocurrency.
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="ml-4 bg-orange-500 hover:bg-orange-600"
                size="sm"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Coin Packages */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <Coins className="w-8 h-8 text-yellow-400 mr-3" />
            <h2 className="text-3xl font-bold text-white">Coin Packages</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coinPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} packages={coinPackages} />
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Use coins to upgrade your character abilities and purchase power-ups
            </p>
          </div>
        </div>

        {/* Diamond Packages */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <Diamond className="w-8 h-8 text-blue-400 mr-3" />
            <h2 className="text-3xl font-bold text-white">Diamond Packages</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diamondPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} packages={diamondPackages} />
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Diamonds are premium currency for exclusive upgrades and special abilities
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Coins className="w-6 h-6 mr-2 text-yellow-400" />
                Why Buy Coins?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Upgrade character abilities</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Purchase power-ups</span>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Save time grinding</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Diamond className="w-6 h-6 mr-2 text-blue-400" />
                Why Buy Diamonds?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Exclusive premium upgrades</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Special abilities unlock</span>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-pink-400" />
                <span className="text-gray-300">Rare collectibles</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Alert className="bg-green-500/10 border-green-500/20">
          <Star className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            <strong>Secure Payments:</strong> All transactions are processed securely through blockchain technology. 
            Your purchases are immediately credited to your account.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
