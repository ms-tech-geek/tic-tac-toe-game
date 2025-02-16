import React from 'react';
import { GameBoard } from '../components/GameBoard';
import { GameStatus } from '../components/GameStatus';
import { useGameStore } from '../store/gameStore';
import { RotateCcw } from 'lucide-react';

export const GamePage: React.FC = () => {
  const resetGame = useGameStore(state => state.resetGame);
  const loadSettings = useGameStore(state => state.loadSettings);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <GameStatus />
      
      <div className="flex items-center justify-center">
        <GameBoard />
      </div>
      
      <div className="flex justify-center gap-4">
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md 
            hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset Game
        </button>
      </div>
    </div>
  );
};