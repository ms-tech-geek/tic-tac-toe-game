import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy } from 'lucide-react';

export const GameStatus: React.FC = () => {
  const { winner, currentPlayer } = useGameStore();

  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md">
      {winner ? (
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="text-lg font-semibold">
            {winner === 'draw' 
              ? "It's a draw!" 
              : `Player ${winner} wins!`}
          </span>
        </div>
      ) : (
        <span className="text-lg font-semibold">
          {currentPlayer === 'X' 
            ? "Your turn" 
            : "Computer is thinking..."}
        </span>
      )}
    </div>
  );
};