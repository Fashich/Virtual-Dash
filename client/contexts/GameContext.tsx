import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface GameState {
  player: {
    id: string;
    name: string;
    level: number;
    experience: number;
    coins: number;
    diamonds: number;
    highScore: number;
    totalDistance: number;
    gamesPlayed: number;
    achievements: string[];
  };
  currentGame: {
    isPlaying: boolean;
    score: number;
    distance: number;
    coins: number;
    diamonds: number;
    speed: number;
    lives: number;
  };
  upgrades: {
    speed: number;
    magnetism: number;
    coinMultiplier: number;
    shield: number;
    jump: number;
    doubleJump: boolean;
  };
  wallet: {
    isConnected: boolean;
    address: string | null;
    balance: string;
  };
  ui: {
    isPaused: boolean;
    showMenu: boolean;
    currentPage: string;
  };
}

type GameAction =
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'COLLECT_COIN'; payload: number }
  | { type: 'COLLECT_DIAMOND'; payload: number }
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'CONNECT_WALLET'; payload: { address: string; balance: string } }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'UPDATE_PLAYER'; payload: Partial<GameState['player']> }
  | { type: 'UPGRADE_SKILL'; payload: { skill: keyof GameState['upgrades']; level: number } }
  | { type: 'SET_PAGE'; payload: string };

const initialState: GameState = {
  player: {
    id: '',
    name: 'Player',
    level: 1,
    experience: 0,
    coins: 0,
    diamonds: 0,
    highScore: 0,
    totalDistance: 0,
    gamesPlayed: 0,
    achievements: [],
  },
  currentGame: {
    isPlaying: false,
    score: 0,
    distance: 0,
    coins: 0,
    diamonds: 0,
    speed: 10,
    lives: 3,
  },
  upgrades: {
    speed: 1,
    magnetism: 1,
    coinMultiplier: 1,
    shield: 1,
    jump: 1,
    doubleJump: false,
  },
  wallet: {
    isConnected: false,
    address: null,
    balance: '0',
  },
  ui: {
    isPaused: false,
    showMenu: false,
    currentPage: 'home',
  },
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        currentGame: {
          ...initialState.currentGame,
          isPlaying: true,
          speed: 10 + (state.upgrades.speed - 1) * 2,
        },
        ui: { ...state.ui, isPaused: false },
      };
    
    case 'END_GAME':
      const newHighScore = Math.max(state.player.highScore, state.currentGame.score);
      return {
        ...state,
        player: {
          ...state.player,
          highScore: newHighScore,
          coins: state.player.coins + state.currentGame.coins,
          diamonds: state.player.diamonds + state.currentGame.diamonds,
          totalDistance: state.player.totalDistance + state.currentGame.distance,
          gamesPlayed: state.player.gamesPlayed + 1,
          experience: state.player.experience + Math.floor(state.currentGame.score / 100),
        },
        currentGame: {
          ...state.currentGame,
          isPlaying: false,
        },
      };
    
    case 'UPDATE_SCORE':
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          score: action.payload,
          distance: Math.floor(action.payload / 10),
        },
      };
    
    case 'COLLECT_COIN':
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          coins: state.currentGame.coins + (action.payload * state.upgrades.coinMultiplier),
        },
      };
    
    case 'COLLECT_DIAMOND':
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          diamonds: state.currentGame.diamonds + action.payload,
        },
      };
    
    case 'PAUSE_GAME':
      return {
        ...state,
        ui: { ...state.ui, isPaused: true },
      };
    
    case 'RESUME_GAME':
      return {
        ...state,
        ui: { ...state.ui, isPaused: false },
      };
    
    case 'CONNECT_WALLET':
      return {
        ...state,
        wallet: {
          isConnected: true,
          address: action.payload.address,
          balance: action.payload.balance,
        },
      };
    
    case 'DISCONNECT_WALLET':
      return {
        ...state,
        wallet: {
          isConnected: false,
          address: null,
          balance: '0',
        },
      };
    
    case 'UPDATE_PLAYER':
      return {
        ...state,
        player: {
          ...state.player,
          ...action.payload,
        },
      };
    
    case 'UPGRADE_SKILL':
      return {
        ...state,
        upgrades: {
          ...state.upgrades,
          [action.payload.skill]: action.payload.level,
        },
      };
    
    case 'SET_PAGE':
      return {
        ...state,
        ui: { ...state.ui, currentPage: action.payload },
      };
    
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
