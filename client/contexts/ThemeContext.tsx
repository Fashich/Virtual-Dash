import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isTransitioning: boolean;
  requestThemeChange: (targetTheme: Theme) => void;
  completeThemeTransition: () => void;
  pendingTheme: Theme | null;
  cameraReachedGround: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage first
    const stored = localStorage.getItem("theme") as Theme;
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "dark"; // Default to dark for space theme
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const targetTheme = theme === "light" ? "dark" : "light";
    requestThemeChange(targetTheme);
  };

  const requestThemeChange = (targetTheme: Theme) => {
    if (isTransitioning || targetTheme === theme) return;

    setIsTransitioning(true);
    setPendingTheme(targetTheme);

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // For switching to light theme, wait much longer for camera to fully land on Earth
    // For switching to dark theme, apply immediately with smooth reverse animation
    if (targetTheme === "light") {
      // Wait for camera to completely land on Earth before switching theme
      // This gives time for the full 3-stage animation to complete and camera to settle on ground
      transitionTimeoutRef.current = setTimeout(() => {
        setTheme(targetTheme);
        setPendingTheme(null);
        setIsTransitioning(false);
      }, 8000); // 8 seconds to ensure camera fully lands on Earth
    } else {
      // Dark theme can switch immediately with reverse animation
      setTheme(targetTheme);
      transitionTimeoutRef.current = setTimeout(() => {
        setPendingTheme(null);
        setIsTransitioning(false);
      }, 6000); // 6 seconds for full reverse animation
    }
  };

  const completeThemeTransition = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (pendingTheme) {
      setTheme(pendingTheme);
    }
    setPendingTheme(null);
    setIsTransitioning(false);
  };

  const cameraReachedGround = () => {
    // Called when camera animation confirms it has reached the ground
    if (pendingTheme === "light" && transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      setTheme("light");
      setPendingTheme(null);
      setIsTransitioning(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isTransitioning,
        requestThemeChange,
        completeThemeTransition,
        pendingTheme,
        cameraReachedGround,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
