import { create } from 'zustand';
import { GameState, Player, GameDifficulty, BoardSize, Cell, CategoryScore } from '../types/game';
import { calculateWinner, minimax } from '../utils/gameLogic';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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
    const settingsRef = doc(db, 'user_settings', user.uid);
    await setDoc(settingsRef, {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      difficulty,
      boardSize,
      updatedAt: new Date()
    }, { merge: true });  // Use merge to prevent overwriting other fields
    
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

const loadUserSettings = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user logged in, using default settings');
    return null;
  }

  try {
    const settingsRef = doc(db, 'user_settings', user.uid);
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return settingsDoc.data() as {
        difficulty: GameDifficulty;
        boardSize: BoardSize;
      };
    }
    
    // If no settings exist, create default settings
    const defaultSettings = {
      difficulty: 'easy' as GameDifficulty,
      boardSize: 3 as BoardSize
    };
    
    await saveUserSettings(defaultSettings.difficulty, defaultSettings.boardSize);
    console.log('Created default settings for user:', user.uid);
    return defaultSettings;
    
  } catch (error) {
    console.error('Error loading settings:', {
      error,
      userId: user.uid,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    // Return default settings instead of throwing
    return {
      difficulty: 'easy' as GameDifficulty,
      boardSize: 3 as BoardSize
    };
  }
};

const useGameStore = create<GameStore>((set, get) => {
  // Initialize auth state listener
  let unsubscribe: (() => void) | null = null;

  // Set up auth state listener when store is created
  const setupAuthListener = () => {
    unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log('User logged out, resetting to default settings');
        set({
          difficulty: 'easy',
          boardSize: 3
        });
        get().initializeBoard(3);
      } else {
        console.log('User logged in, loading settings');
        try {
          const settings = await loadUserSettings();
          if (settings) {
            console.log('Applying loaded settings:', settings);
            set({ 
              difficulty: settings.difficulty,
              boardSize: settings.boardSize
            });
            get().initializeBoard(settings.boardSize);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          // Use default settings on error
          set({
            difficulty: 'easy',
            boardSize: 3
          });
          get().initializeBoard(3);
        }
      }
    });
  };

  // Set up listener immediately
  setupAuthListener();

  return {
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
    console.log('Settings saved for user:', auth.currentUser?.uid);
  },

  loadSettings: async () => {
    if (auth.currentUser) {
      try {
        console.log('Loading settings for user:', auth.currentUser.uid);
        const settings = await loadUserSettings();
        if (settings) {
          console.log('Successfully loaded settings:', settings);
          set({ 
            difficulty: settings.difficulty,
            boardSize: settings.boardSize
          });
          get().initializeBoard(settings.boardSize);
          console.log('Settings loaded for user:', auth.currentUser.uid);
        }
      } catch (error) {
        console.error('Error in loadSettings:', error);
        // Use default settings on error
        set({
          difficulty: 'easy',
          boardSize: 3
        });
        get().initializeBoard(3);
      }
    }
  },

  // Cleanup function for auth listener
  cleanup: () => {
    if (unsubscribe) {
      unsubscribe();
    }
  },
  };
});

export { useGameStore };