import React from 'react';
import { useGameStore } from '../store/gameStore';
import { GameDifficulty, BoardSize } from '../types/game';
import { Settings, Save } from 'lucide-react';

export const GameControls: React.FC = () => {
  const { difficulty, boardSize, setDifficulty, setBoardSize, saveSettings } = useGameStore();
  const [isSaving, setIsSaving] = React.useState(false);

  const difficulties: GameDifficulty[] = ['easy', 'medium', 'hard'];
  const boardSizes: BoardSize[] = [3, 4, 5];

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings();
    alert('Game settings saved successfully!');
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold">Game Settings</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${difficulty === d 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                onClick={() => setDifficulty(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Board Size
          </label>
          <div className="flex gap-2">
            {boardSizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${boardSize === size 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                onClick={() => setBoardSize(size)}
              >
                {size} x {size}
              </button>
            ))}
          </div>
        </div>

        <button
          className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md 
            hover:bg-blue-700 transition-colors font-medium flex items-center 
            justify-center gap-2 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};