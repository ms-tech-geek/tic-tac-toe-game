import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserScores, GameDifficulty, BoardSize, CategoryScore, UserProfile } from '../types/game';
import { Trophy, Medal, Award, Trash2, X, ChevronDown } from 'lucide-react';
import { PlayerProfile } from './PlayerProfile';
import { deleteDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

type LeaderboardCategory = {
  difficulty: GameDifficulty;
  boardSize: BoardSize;
};

interface PlayerStats extends UserProfile {
  stats: CategoryScore;
  photoURL?: string;
}

export const Leaderboard: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<UserScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<UserScores | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>({
    difficulty: 'easy',
    boardSize: 3
  });
  const [isFilterOpen, setIsFilterOpen] = useState<{
    difficulty: boolean;
    boardSize: boolean;
  }>({
    difficulty: false,
    boardSize: false
  });

  const getRankIndicator = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 text-center">{index + 1}</span>;
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    scores.forEach(score => {
      if (score.categories) {
        Object.keys(score.categories).forEach(key => {
        uniqueCategories.add(key);
        });
      }
    });
    return Array.from(uniqueCategories).map(cat => {
      const [difficulty, boardSize] = cat.split('-');
      return {
        difficulty: difficulty as GameDifficulty,
        boardSize: parseInt(boardSize) as BoardSize
      };
    });
  }, [scores]);

  const filteredScores = useMemo(() => {
    const categoryKey = `${selectedCategory.difficulty}-${selectedCategory.boardSize}`;
    return scores
      .filter(score => score.categories && score.categories[categoryKey])
      .map(score => ({
        userId: score.userId,
        userName: score.userName,
        photoURL: score.photoURL,
        stats: score.categories[categoryKey]
      }))
      .sort((a, b) => {
        const aStats = a.stats;
        const bStats = b.stats;
        const aTotal = aStats.wins + aStats.losses + aStats.draws;
        const bTotal = bStats.wins + bStats.losses + bStats.draws;
        const aWinRate = aTotal > 0 ? (aStats.wins / aTotal) * 100 : 0;
        const bWinRate = bTotal > 0 ? (bStats.wins / bTotal) * 100 : 0;
        return bWinRate - aWinRate;
      })
      .slice(0, 5);
  }, [scores, selectedCategory]);

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      limit(100)
    );

    try {
      setLoading(true);
      return onSnapshot(q, 
        (snapshot) => {
          const newScores = snapshot.docs.map(doc => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as UserScores[];
          setScores(newScores);
          setError(null);
          setLoading(false);
        },
        (error: FirebaseError) => {
          console.error('Firestore error:', error);
          let errorMessage = 'Unable to load leaderboard. ';
          
          switch (error.code) {
            case 'permission-denied':
              errorMessage += 'Permission denied. Please check Firestore rules.';
              break;
            case 'unavailable':
              errorMessage += 'Service is temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage += 'Please try again later.';
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Firestore setup error:', error);
      setError('Unable to connect to leaderboard.');
      setLoading(false);
      return () => {};
    }
  }, []);

  const formatWinRate = (stats: CategoryScore) => {
    const total = stats.wins + stats.losses + stats.draws;
    if (total === 0) return '0%';
    return `${((stats.wins / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h2>
        {auth.currentUser && (
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to reset all scores? This cannot be undone.')) {
                try {
                  const snapshot = await getDocs(collection(db, 'scores'));
                  await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
                  alert('All scores have been reset successfully.');
                } catch (error) {
                  console.error('Error resetting scores:', error);
                  alert('Failed to reset scores. Please try again.');
                }
              }
            }}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md 
              hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Reset All
          </button>
        )}
      </div>
      
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <button
            onClick={() => setIsFilterOpen(prev => ({ ...prev, difficulty: !prev.difficulty }))}
            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 
              rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-left"
          >
            <span className="font-medium capitalize">
              {selectedCategory.difficulty}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform
              ${isFilterOpen.difficulty ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isFilterOpen.difficulty && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsFilterOpen(prev => ({ ...prev, difficulty: false }))}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 
                rounded-lg shadow-lg z-20 py-1">
                {['easy', 'medium', 'hard'].map((difficulty: GameDifficulty) => (
                  <button
                    key={difficulty}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors
                      ${selectedCategory.difficulty === difficulty ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => {
                      setSelectedCategory(prev => ({ ...prev, difficulty }));
                      setIsFilterOpen(prev => ({ ...prev, difficulty: false }));
                    }}
                  >
                    <span className="capitalize">{difficulty}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Board Size
          </label>
          <button
            onClick={() => setIsFilterOpen(prev => ({ ...prev, boardSize: !prev.boardSize }))}
            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 
              rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-left"
          >
            <span className="font-medium">
              {selectedCategory.boardSize} x {selectedCategory.boardSize}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform
              ${isFilterOpen.boardSize ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isFilterOpen.boardSize && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsFilterOpen(prev => ({ ...prev, boardSize: false }))}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 
                rounded-lg shadow-lg z-20 py-1">
                {[3, 4, 5].map((size: BoardSize) => (
                  <button
                    key={size}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors
                      ${selectedCategory.boardSize === size ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => {
                      setSelectedCategory(prev => ({ ...prev, boardSize: size }));
                      setIsFilterOpen(prev => ({ ...prev, boardSize: false }));
                    }}
                  >
                    {size} x {size}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-4 text-gray-500">
            <p>Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-600">
            <p>{error}</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <p>No scores yet. Be the first to play!</p>
          </div>
        ) : filteredScores.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <p>No scores yet for {selectedCategory.difficulty} mode {selectedCategory.boardSize}x{selectedCategory.boardSize}</p>
          </div>
        ) : filteredScores.map((score, index) => (
          <button
            key={score.userId}
            className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors text-left"
            onClick={async () => {
              try {
                const docRef = doc(db, 'scores', score.userId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                  setSelectedPlayer({
                    ...docSnap.data(),
                    timestamp: docSnap.data().timestamp?.toDate() || new Date(),
                  } as UserScores);
                }
              } catch (error) {
                console.error('Error fetching player data:', error);
              }
            }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div>
                <img
                  src={score.photoURL}
                  alt={score.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{score.userName}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">{score.stats.wins}W</span>
                  <span className="text-red-600 font-medium">{score.stats.losses}L</span>
                  <span className="text-gray-600 font-medium">{score.stats.draws}D</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-blue-600">
                  {formatWinRate(score.stats)}
                </div>
                <div className="text-xs text-gray-500 mb-1">Win Rate</div>
                <div className="transform scale-150">
                  {getRankIndicator(index)}
                </div>
              </div>
            </div>
          </button>
        ))}
        
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <PlayerProfile playerData={selectedPlayer} isModal={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};