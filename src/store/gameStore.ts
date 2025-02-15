import { create } from 'zustand';
import { GameState, Player, GameDifficulty, BoardSize, Cell } from '../types/game';
import { calculateWinner, minimax } from '../utils/gameLogic';

interface GameStore extends GameState {
  initializeBoard: (size: BoardSize) => void;
  makeMove: (row: number, col: number) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  setBoardSize: (size: BoardSize) => void;
  resetGame: () => void;
}

const createEmptyBoard = (size: BoardSize): Cell[][] => 
  Array(size).fill(null).map(() => Array(size).fill(null));

export const useGameStore = create<GameStore>((set, get) => ({
  board: createEmptyBoard(3),
  currentPlayer: 'X',
  winner: null,
  difficulty: 'easy',
  boardSize: 3,
  isGameOver: false,

  initializeBoard: (size) => {
    set({
      board: createEmptyBoard(size),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
      boardSize: size
    });
  },

  makeMove: (row, col) => {
    const state = get();
    if (state.board[row][col] || state.winner) return;

    const newBoard = state.board.map(row => [...row]);
    newBoard[row][col] = state.currentPlayer;

    const winner = calculateWinner(newBoard);
    const isGameOver = winner !== null || newBoard.flat().every(cell => cell !== null);

    set({ board: newBoard, isGameOver });

    if (!isGameOver) {
      set({ currentPlayer: 'O' });
      
      // Computer's turn
      setTimeout(() => {
        const { difficulty, board } = get();
        const computerMove = minimax(board, difficulty);
        if (computerMove) {
          get().makeMove(computerMove.row, computerMove.col);
          set({ currentPlayer: 'X' });
        }
      }, 500);
    } else {
      set({ winner });
    }
  },

  setDifficulty: (difficulty) => set({ difficulty }),
  setBoardSize: (size) => get().initializeBoard(size),
  resetGame: () => get().initializeBoard(get().boardSize),
}));