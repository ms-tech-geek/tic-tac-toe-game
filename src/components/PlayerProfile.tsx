import React from 'react';
import { UserScores, GameDifficulty, BoardSize, CategoryScore } from '../types/game';
import { Trophy, X, ArrowLeft } from 'lucide-react';

interface PlayerProfileProps {
  playerData: UserScores;
  onClose: () => void;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerData, onClose }) => {
  const formatWinRate = (stats: CategoryScore) => {
    const total = stats.wins + stats.losses + stats.draws;
    if (total === 0) return '0%';
    return `${((stats.wins / total) * 100).toFixed(1)}%`;
  };

  const difficulties: GameDifficulty[] = ['easy', 'medium', 'hard'];
  const boardSizes: BoardSize[] = [3, 4, 5];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${playerData.userName}`}
              alt={playerData.userName}
              className="w-8 h-8 rounded-full"
            />
            {playerData.userName}'s Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {difficulties.map(difficulty => (
            <div key={difficulty} className="space-y-4">
              <h3 className="text-lg font-semibold capitalize">
                {difficulty} Difficulty
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {boardSizes.map(size => {
                  const categoryKey = `${difficulty}-${size}`;
                  const stats = playerData.categories?.[categoryKey];

                  if (!stats) return null;

                  return (
                    <div
                      key={categoryKey}
                      className="bg-gray-50 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{size}x{size} Board</h4>
                        {stats.wins > 0 && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          Win Rate: {formatWinRate(stats)}
                        </p>
                        <div className="flex gap-2 text-gray-500">
                          <span>{stats.wins}W</span>
                          <span>·</span>
                          <span>{stats.losses}L</span>
                          <span>·</span>
                          <span>{stats.draws}D</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};