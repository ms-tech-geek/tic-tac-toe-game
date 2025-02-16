import React from 'react';
import { UserScores, GameDifficulty, BoardSize, CategoryScore } from '../types/game';
import { Trophy, Medal, Award } from 'lucide-react';

interface PlayerProfileProps {
  playerData: UserScores;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerData }) => {
  const formatWinRate = (stats: CategoryScore) => {
    const total = stats.wins + stats.losses + stats.draws;
    if (total === 0) return '0%';
    return `${((stats.wins / total) * 100).toFixed(1)}%`;
  };

  const difficulties: GameDifficulty[] = ['easy', 'medium', 'hard'];
  const boardSizes: BoardSize[] = [3, 4, 5];

  const getRankIcon = (stats: CategoryScore) => {
    const total = stats.wins + stats.losses + stats.draws;
    const winRate = total > 0 ? (stats.wins / total) * 100 : 0;
    
    if (winRate >= 80) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (winRate >= 60) return <Medal className="w-5 h-5 text-gray-400" />;
    if (winRate >= 40) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <img
            src={playerData.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${playerData.userName}`}
            alt={playerData.userName}
            className="w-8 h-8 rounded-full"
          />
          {playerData.userName}'s Profile
        </h2>
      </div>

      <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Wins</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(playerData.categories || {}).reduce((sum, cat) => sum + cat.wins, 0)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Losses</p>
              <p className="text-2xl font-bold text-red-600">
                {Object.values(playerData.categories || {}).reduce((sum, cat) => sum + cat.losses, 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Draws</p>
              <p className="text-2xl font-bold text-gray-600">
                {Object.values(playerData.categories || {}).reduce((sum, cat) => sum + cat.draws, 0)}
              </p>
            </div>
          </div>

          {difficulties.map(difficulty => (
            <div key={difficulty} className="space-y-4">
              <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  difficulty === 'easy' ? 'bg-green-500' :
                  difficulty === 'medium' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                {difficulty} Mode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {boardSizes.map(size => {
                  const categoryKey = `${difficulty}-${size}`;
                  const stats = playerData.categories?.[categoryKey];

                  if (!stats) return null;

                  return (
                    <div
                      key={categoryKey}
                      className="bg-gray-50 rounded-lg p-4 space-y-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{size}x{size} Board</h4>
                        {getRankIcon(stats)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-base">
                          {formatWinRate(stats)} Win Rate
                        </p>
                        <div className="flex gap-2 text-gray-600">
                          <span className="text-green-600">{stats.wins}W</span>
                          <span>·</span>
                          <span className="text-red-600">{stats.losses}L</span>
                          <span>·</span>
                          <span>{stats.draws}D</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: formatWinRate(stats)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {boardSizes.every(size => !playerData.categories?.[`${difficulty}-${size}`]) && (
                  <div className="col-span-3 text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
                    No games played in {difficulty} mode yet
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};