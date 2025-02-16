import { create } from 'zustand';
import { GameState, Player, GameDifficulty, BoardSize, Cell, CategoryScore } from '../types/game';
import { calculateWinner, minimax } from '../utils/gameLogic';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface GameStore extends GameState {
  initializeBoard: (size: BoardSize) => void;
  makeMove: (row: number, col: number) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  setBoardSize: (size: BoardSize) => void;
  resetGame: () => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const createEmptyBoard = (size: BoardSize): Cell[][] => 
  Array(size).fill(null).map(() => Array(size).fill(null));

const getCategoryKey = (difficulty: GameDifficulty, boardSize: BoardSize): string => 
  `${difficulty}-${boardSize}`;

const updateUserScore = async (result: 'win' | 'loss' | 'draw', difficulty: GameDifficulty, boardSize: BoardSize) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const scoreRef = doc(db, 'scores', user.uid);
    const categoryKey = getCategoryKey(difficulty, boardSize);
    const scoreDoc = await getDoc(scoreRef);

    if (scoreDoc.exists()) {
      const data = scoreDoc.data();
      const currentCategory = data.categories?.[categoryKey] || { wins: 0, losses: 0, draws: 0 };
      
      const updatedCategories = {
        ...data.categories,
        [categoryKey]: {
          wins: result === 'win' ? currentCategory.wins + 1 : currentCategory.wins,
          losses: result === 'loss' ? currentCategory.losses + 1 : currentCategory.losses,
          draws: result === 'draw' ? currentCategory.draws + 1 : currentCategory.draws
        }
      };

      await updateDoc(scoreRef, { 
        categories: updatedCategories,
        timestamp: new Date()
      });
    } else {
      await setDoc(scoreRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        categories: {
          [categoryKey]: {
            wins: result === 'win' ? 1 : 0,
            losses: result === 'loss' ? 1 : 0,
            draws: result === 'draw' ? 1 : 0
          }
        },
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating score:', error);
  }
};

const saveUserSettings = async (difficulty: GameDifficulty, boardSize: BoardSize) => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    // Store settings in a subcollection of the user's document
    const settingsRef = doc(db, 'users', user.uid);
    await setDoc(settingsRef, {
      settings: {
        difficulty,
        boardSize,
        updatedAt: new Date()
      }
    }, { merge: true });
    
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

const loadUserSettings = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const settingsRef = doc(db, 'users', user.uid);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      const settings = data.settings;
      
      if (settings) {
        return {
          difficulty: settings.difficulty as GameDifficulty,
          boardSize: settings.boardSize as BoardSize
        };
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  return null;
};

const useGameStore = create<GameStore>((set, get) => ({
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

  setDifficulty: (difficulty) => {
    set({ difficulty });
  },

  setBoardSize: (size) => {
    set({ boardSize: size });
    get().initializeBoard(size);
  },

  resetGame: () => get().initializeBoard(get().boardSize),

  saveSettings: async () => {
    const { difficulty, boardSize } = get();
    await saveUserSettings(difficulty, boardSize);
    console.log('Settings saved:', { difficulty, boardSize });
  },

  loadSettings: async () => {
    const settings = await loadUserSettings();
    if (settings) {
      console.log('Settings loaded:', settings);
      set({ 
        difficulty: settings.difficulty,
        boardSize: settings.boardSize
      });
      get().initializeBoard(settings.boardSize);
    } else {
      console.log('No settings found, using defaults');
    }
  }
}));

export { useGameStore };