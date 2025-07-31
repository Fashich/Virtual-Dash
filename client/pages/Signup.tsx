import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Wallet,
  User,
  ArrowLeft,
  Gamepad2,
  Mail,
  UserCheck,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Signup() {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const { connectWallet, isConnecting, error } = useWeb3();
  const { theme } = useTheme();
  const [playerName, setPlayerName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleCreateAccount = async () => {
    if (!playerName.trim() || !username.trim() || !email.trim()) {
      return;
    }

    setIsCreatingAccount(true);

    try {
      // Create player account
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      dispatch({
        type: "UPDATE_PLAYER",
        payload: {
          id: playerId,
          name: playerName.trim(),
          username: username.trim(),
          email: email.trim(),
          coins: 1000, // Starting coins
          diamonds: 10, // Starting diamonds
        },
      });

      // Simulate account creation delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsCreatingAccount(false);
      navigate("/");
    } catch (error) {
      setIsCreatingAccount(false);
      console.error("Error creating account:", error);
    }
  };

  const handleWalletSignup = async () => {
    try {
      await connectWallet();
      if (!error) {
        // Auto-generate player name from wallet address
        const address = ""; // Will be updated by wallet connection
        const defaultName = `Player_${address.slice(-6)}`;
        setPlayerName(defaultName);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        theme === "light"
          ? "bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100"
          : "bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
      }`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Button - Better positioned */}
        <div className="mb-6 flex justify-between items-center">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className={`${theme === "light" ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"} transition-colors`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Gamepad2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Virtual Dash</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Join the Adventure
          </h2>
          <p className="text-gray-300">
            Create your player profile and start your journey
          </p>
        </div>

        {/* Signup Form */}
        <Card
          className={`${theme === "light" ? "bg-white/80 border-gray-200" : "bg-black/20 border-gray-700"} backdrop-blur-sm`}
        >
          <CardHeader>
            <CardTitle className="text-white text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Choose your signup method and create your player profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Web3 Wallet Signup */}
            <div className="space-y-4">
              <Button
                onClick={handleWalletSignup}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet & Signup"}
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

            {/* Traditional Signup */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-white">
                  Display Name
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter your display name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-black/20 border-gray-600 text-white placeholder:text-gray-400"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/20 border-gray-600 text-white placeholder:text-gray-400"
                  maxLength={15}
                />
              </div>

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

              <Button
                onClick={handleCreateAccount}
                disabled={
                  !playerName.trim() ||
                  !username.trim() ||
                  !email.trim() ||
                  isCreatingAccount
                }
                className="w-full"
                variant="outline"
                size="lg"
              >
                <User className="w-5 h-5 mr-2" />
                {isCreatingAccount ? "Creating Account..." : "Create Account"}
              </Button>
            </div>

            {/* Benefits */}
            <div className="mt-8 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <h3 className="text-white font-semibold mb-2">
                Starting Rewards
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">1,000 Coins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">10 Diamonds</span>
                </div>
              </div>
            </div>

            {/* Login Alternative */}
            <div className="text-center space-y-3">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </p>

              {/* Guest Play Option */}
              <div className="border-t border-gray-600 pt-4">
                <Button
                  onClick={() => {
                    // Set guest mode in game state
                    dispatch({
                      type: "UPDATE_PLAYER",
                      payload: {
                        id: "guest_" + Date.now(),
                        name: "Guest Player",
                        coins: 0,
                        diamonds: 0,
                      },
                    });
                    navigate("/game");
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
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-white text-sm font-medium">3D Gameplay</div>
          </Card>
          <Card className="bg-black/10 border-gray-700 p-4">
            <div className="text-2xl mb-2">💎</div>
            <div className="text-white text-sm font-medium">Earn Rewards</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
