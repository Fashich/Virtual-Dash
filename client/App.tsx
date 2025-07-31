import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Game from "./pages/Game";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Upgrade from "./pages/Upgrade";
import TopUp from "./pages/TopUp";
import Guide from "./pages/Guide";
import Leaderboard from "./pages/Leaderboard";
import Shop from "./pages/Shop";
import Inventory from "./pages/Inventory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<Game />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/topup" element={<TopUp />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/inventory" element={<Inventory />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GameProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
