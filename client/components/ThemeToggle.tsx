import React from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, isTransitioning } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`relative w-10 h-10 p-0 rounded-full text-white border transition-all duration-300 ${
        isTransitioning
          ? "bg-blue-500/20 border-blue-400/40 cursor-not-allowed"
          : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30"
      }`}
      title={
        isTransitioning
          ? "Camera transitioning..."
          : `Switch to ${theme === "light" ? "dark" : "light"} mode`
      }
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Loading indicator during transition */}
        {isTransitioning && (
          <div className="absolute animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
        )}

        <Sun
          className={`w-4 h-4 transition-all duration-500 ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          } ${isTransitioning ? "opacity-50" : ""}`}
        />
        <Moon
          className={`w-4 h-4 absolute transition-all duration-500 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          } ${isTransitioning ? "opacity-50" : ""}`}
        />
      </div>
    </Button>
  );
}
