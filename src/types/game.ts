export type Player = 'X' | 'O';
export type Cell = Player | null;
export type GameBoard = Cell[][];
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type BoardSize = 3 | 4 | 5;

export interface GameState {
  board: GameBoard;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  difficulty: GameDifficulty;
  boardSize: BoardSize;
  isGameOver: boolean;
}

export interface GameScore {
  userId: string;
  userName: string;
  wins: number;
  losses: number;
  draws: number;
  timestamp: Date;
  difficulty: GameDifficulty;
  boardSize: BoardSize;
}

export interface CategoryScore {
  wins: number;
  losses: number;
  draws: number;
}

export interface UserScores {
  userId: string;
  userName: string;
  categories: {
    [key: string]: CategoryScore;  // key format: "difficulty-boardSize"
  };
  timestamp: Date;
}