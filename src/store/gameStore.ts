import { create } from 'zustand';
import { GameState, Player, GameDifficulty, BoardSize, Cell } from '../types/game';
import { calculateWinner, minimax } from '../utils/gameLogic';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface GameStore extends GameState {
  initializeBoard: (size: BoardSize) => void;
  makeMove: (row: number, col: number) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  setBoardSize: (size: BoardSize) => void;
  resetGame: () => void;
}

const createEmptyBoard = (size: BoardSize): Cell[][] => 
  Array(size).fill(null).map(() => Array(size).fill(null));

const updateUserScore = async (result: 'win' | 'loss' | 'draw', difficulty: GameDifficulty, boardSize: BoardSize) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const scoreRef = doc(db, 'scores', user.uid);
    const scoreDoc = await getDoc(scoreRef);

    if (scoreDoc.exists()) {
      const data = scoreDoc.data();
      await updateDoc(scoreRef, {
        wins: result === 'win' ? (data.wins || 0) + 1 : data.wins || 0,
        losses: result === 'loss' ? (data.losses || 0) + 1 : data.losses || 0,
        draws: result === 'draw' ? (data.draws || 0) + 1 : data.draws || 0,
        timestamp: new Date(),
        difficulty,
        boardSize
      });
    } else {
      await setDoc(scoreRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        wins: result === 'win' ? 1 : 0,
        losses: result === 'loss' ? 1 : 0,
        draws: result === 'draw' ? 1 : 0,
        timestamp: new Date(),
        difficulty,
        boardSize
      });
    }
  } catch (error) {
    console.error('Error updating score:', error);
  }
};

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
    if (state.board[row][col] || state.winner || state.currentPlayer !== 'X') return;

    const newBoard = state.board.map(row => [...row]);
    newBoard[row][col] = state.currentPlayer;

    const winner = calculateWinner(newBoard);
    const isGameOver = winner !== null || newBoard.flat().every(cell => cell !== null);

    set({ board: newBoard, isGameOver, winner });

    if (!isGameOver) {
      // Switch to computer's turn
      set({ currentPlayer: 'O' });
      
      // Computer's turn
      setTimeout(() => {
        const { difficulty, board } = get();
        const computerMove = minimax(board, difficulty);
        
        if (computerMove) {
          const newBoard = board.map(row => [...row]);
          newBoard[computerMove.row][computerMove.col] = 'O';
          
          const winner = calculateWinner(newBoard);
          const isGameOver = winner !== null || newBoard.flat().every(cell => cell !== null);
          
          set({ 
            board: newBoard,
            isGameOver,
            winner,
            currentPlayer: isGameOver ? 'O' : 'X'  // Switch back to player's turn if game isn't over
          });
          
          // Update score in Firestore if game is over
          if (isGameOver && winner) {
            const result = winner === 'X' ? 'win' : winner === 'O' ? 'loss' : 'draw';
            updateUserScore(result, get().difficulty, get().boardSize);
          }
        }
      }, 500);
    } else if (winner) {
      // Update score in Firestore
      const result = winner === 'X' ? 'win' : winner === 'O' ? 'loss' : 'draw';
      updateUserScore(result, get().difficulty, get().boardSize);
    }
  },

  setDifficulty: (difficulty) => set({ difficulty }),
  setBoardSize: (size) => get().initializeBoard(size),
  resetGame: () => get().initializeBoard(get().boardSize),
}));