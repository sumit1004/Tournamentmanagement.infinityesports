import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAMES, DEFAULT_POSITION_POINTS } from '../data/games';
import { GameConfig, GameInfo } from '../types';
import { getGameConfig, saveGameConfig } from '../utils/storage';
import { ChevronRight, Plus, Minus, Save } from 'lucide-react';

const GameConfigPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // Find the game based on the gameId
  const game = GAMES.find(g => g.id === gameId);
  
  const [config, setConfig] = useState<GameConfig>({
    killPoints: 1,
    positionPoints: { ...DEFAULT_POSITION_POINTS }
  });
  
  const [maxPositions, setMaxPositions] = useState(10);

  useEffect(() => {
    if (gameId) {
      // Load existing configuration or use default
      const savedConfig = getGameConfig(gameId);
      setConfig(savedConfig);
      
      // Determine the maximum position from the saved config
      const positions = Object.keys(savedConfig.positionPoints).map(Number);
      if (positions.length > 0) {
        setMaxPositions(Math.max(...positions));
      }
    }
  }, [gameId]);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Game not found. Please return to the game selection.</p>
      </div>
    );
  }

  const handleKillPointsChange = (value: number) => {
    setConfig(prev => ({
      ...prev,
      killPoints: Math.max(0, value) // Ensure kill points are not negative
    }));
  };

  const handlePositionPointsChange = (position: number, value: number) => {
    setConfig(prev => ({
      ...prev,
      positionPoints: {
        ...prev.positionPoints,
        [position]: Math.max(0, value) // Ensure position points are not negative
      }
    }));
  };

  const addPosition = () => {
    setMaxPositions(prev => prev + 1);
    setConfig(prev => ({
      ...prev,
      positionPoints: {
        ...prev.positionPoints,
        [maxPositions + 1]: 0
      }
    }));
  };

  const removePosition = () => {
    if (maxPositions > 1) {
      setMaxPositions(prev => prev - 1);
      const newPositionPoints = { ...config.positionPoints };
      delete newPositionPoints[maxPositions];
      setConfig(prev => ({
        ...prev,
        positionPoints: newPositionPoints
      }));
    }
  };

  const handleSaveConfig = () => {
    if (gameId) {
      const configToSave = {
        ...config,
        maxPositions,
        tournamentId: gameId,
        gameName: game.name
      };
      
      saveGameConfig(gameId, configToSave);
      // Save to global config for other components
      localStorage.setItem('globalGameConfig', JSON.stringify(configToSave));
      navigate(`/${gameId}/register`);
    }
  };

  return (
    <div className="min-h-screen relative text-white p-6">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: 'url("/public/background.jpg")',
          zIndex: -1 
        }} 
      />
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: -1 }} />
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">
          {game.name} Configuration
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Set up the scoring rules for this tournament
        </p>

        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Kill Points</h2>
          <div className="flex items-center mb-6">
            <button 
              onClick={() => handleKillPointsChange(config.killPoints - 1)}
              className="backdrop-blur-md bg-white/5 hover:bg-white/10 p-2 rounded-l-md border-r border-white/10"
              aria-label="Decrease kill points"
            >
              <Minus size={18} />
            </button>
            <input
              type="number"
              value={config.killPoints}
              onChange={(e) => handleKillPointsChange(Number(e.target.value))}
              className="backdrop-blur-md bg-white/5 text-center p-2 w-20 focus:outline-none"
              min="0"
            />
            <button 
              onClick={() => handleKillPointsChange(config.killPoints + 1)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-r-md"
              aria-label="Increase kill points"
            >
              <Plus size={18} />
            </button>
            <span className="ml-3 text-gray-300">Points per kill</span>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-purple-400">Position Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Array.from({ length: maxPositions }, (_, i) => i + 1).map(position => (
              <div key={position} className="flex items-center">
                <span className="w-16 text-gray-400">#{position}</span>
                <button
                  onClick={() => handlePositionPointsChange(position, (config.positionPoints[position] || 0) - 1)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-l-md"
                  aria-label={`Decrease position ${position} points`}
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={config.positionPoints[position] || 0}
                  onChange={(e) => handlePositionPointsChange(position, Number(e.target.value))}
                  className="bg-gray-700 text-center p-2 w-20 focus:outline-none"
                  min="0"
                />
                <button
                  onClick={() => handlePositionPointsChange(position, (config.positionPoints[position] || 0) + 1)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-r-md"
                  aria-label={`Increase position ${position} points`}
                >
                  <Plus size={18} />
                </button>
                <span className="ml-3 text-gray-300">Points</span>
              </div>
            ))}
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={addPosition}
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
            >
              <Plus size={18} className="mr-1" />
              Add Position
            </button>
            <button
              onClick={removePosition}
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
              disabled={maxPositions <= 1}
            >
              <Minus size={18} className="mr-1" />
              Remove Position
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate('/games')}
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSaveConfig}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-md flex items-center transition-all hover:shadow-lg"
          >
            <Save size={18} className="mr-2" />
            Save & Continue
            <ChevronRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameConfigPage;