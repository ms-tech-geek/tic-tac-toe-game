import React from 'react';
import { useGameStore } from '../store/gameStore';
import clsx from 'clsx';

export const GameBoard: React.FC = () => {
  const { board, makeMove, currentPlayer, winner, isGameOver } = useGameStore();

  return (
    <div className="grid gap-2" style={{ 
      gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`
    }}>
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            className={clsx(
              'w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center text-2xl font-bold',
              'transition-all duration-200 hover:bg-gray-50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              {
                'text-blue-600': cell === 'X',
                'text-red-600': cell === 'O',
              }
            )}
            disabled={!!cell || isGameOver || currentPlayer === 'O'}
            onClick={() => makeMove(rowIndex, colIndex)}
          >
            {cell}
          </button>
        ))
      ))}
    </div>
  );
};