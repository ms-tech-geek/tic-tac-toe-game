import React from 'react';
import { GameControls } from '../components/GameControls';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <GameControls />
    </div>
  );
};