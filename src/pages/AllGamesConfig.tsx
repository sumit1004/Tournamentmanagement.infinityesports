import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_POSITION_POINTS } from '../data/games';
import { GameConfig } from '../types';
import { ChevronRight, Plus, Minus, Save } from 'lucide-react';
import ConfigLayout from '../components/layouts/ConfigLayout';

const AllGamesConfig: React.FC = () => {
  const navigate = useNavigate();
  
  // Initialize state from localStorage if available
  const [config, setConfig] = useState<GameConfig>(() => {
    const savedConfig = localStorage.getItem('globalGameConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      killPoints: 1,
      positionPoints: { ...DEFAULT_POSITION_POINTS }
    };
  });
  
  const [maxPositions, setMaxPositions] = useState(() => {
    const savedConfig = localStorage.getItem('globalGameConfig');
    if (savedConfig) {
      const positions = Object.keys(JSON.parse(savedConfig).positionPoints).map(Number);
      return positions.length > 0 ? Math.max(...positions) : 10;
    }
    return 10;
  });

  // Save to localStorage whenever config or positions change
  useEffect(() => {
    localStorage.setItem('globalGameConfig', JSON.stringify({
      ...config,
      maxPositions: maxPositions
    }));
  }, [config, maxPositions]);

  const handleKillPointsChange = (value: number) => {
    setConfig(prev => ({
      ...prev,
      killPoints: Math.max(0, value)
    }));
  };

  const handlePositionPointsChange = (position: number, value: number) => {
    setConfig(prev => ({
      ...prev,
      positionPoints: {
        ...prev.positionPoints,
        [position]: Math.max(0, value)
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

  const handleSave = () => {
    localStorage.setItem('globalGameConfig', JSON.stringify({
      ...config,
      maxPositions: maxPositions
    }));
    navigate('/match-calculator'); // Changed from '/tournament-config' to '/match-calculator'
  };

  return (
    <ConfigLayout title="Global Points Configuration">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Kill Points</h2>
        <div className="flex items-center mb-6">
          <button 
            onClick={() => handleKillPointsChange(config.killPoints - 1)}
            className="backdrop-blur-md bg-white/5 hover:bg-white/10 p-2 rounded-l-md border-r border-white/10"
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
              >
                <Plus size={18} />
              </button>
              <span className="ml-3 text-gray-300">Points</span>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
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
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-md flex items-center transition-all hover:shadow-lg"
        >
          <Save size={18} className="mr-2" />
          Save & Continue
          <ChevronRight size={18} className="ml-2" />
        </button>
      </div>
    </ConfigLayout>
  );
};

export default AllGamesConfig;
