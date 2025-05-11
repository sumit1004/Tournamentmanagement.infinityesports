import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigLayout from '../components/layouts/ConfigLayout';
import { ChevronRight, Save } from 'lucide-react';

interface TournamentConfig {
  tournamentName: string;
  semifinals: string;
  finals: string;
}

const TournamentConfig: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TournamentConfig>(() => {
    const savedConfig = localStorage.getItem('tournamentConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      tournamentName: '',
      semifinals: '0',
      finals: '1'
    };
  });

  const handleSave = () => {
    if (!config.tournamentName.trim()) {
      alert('Please enter tournament name');
      return;
    }

    if ((config.semifinals === '0' || config.semifinals.toLowerCase() === 'na') &&
        (config.finals === '0' || config.finals.toLowerCase() === 'na')) {
      alert('You must configure at least one type of match');
      return;
    }

    const configToSave = {
      ...config,
      tournamentId: Date.now().toString(),
      semifinals: config.semifinals.toLowerCase() === 'na' ? '0' : config.semifinals,
      finals: config.finals.toLowerCase() === 'na' ? '0' : config.finals
    };

    localStorage.setItem('tournamentConfig', JSON.stringify(configToSave));
    navigate('/match-calculator');
  };

  const handleInputChange = (field: keyof TournamentConfig, value: string) => {
    const upperValue = value.toUpperCase();
    if (upperValue === 'NA' || upperValue === '') {
      setConfig(prev => ({ ...prev, [field]: upperValue }));
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setConfig(prev => ({ ...prev, [field]: Math.max(0, numValue).toString() }));
      }
    }
  };

  return (
    <ConfigLayout title="Tournament Configuration">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xl font-semibold mb-4 text-purple-400">
              Tournament Name
            </label>
            <input
              type="text"
              value={config.tournamentName}
              onChange={(e) => setConfig(prev => ({ ...prev, tournamentName: e.target.value }))}
              className="w-full backdrop-blur-md bg-white/5 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter tournament name"
            />
          </div>
          <div>
            <label className="block text-xl font-semibold mb-4 text-purple-400">
              Number of Semi-final Matches
            </label>
            <input
              type="text"
              value={config.semifinals}
              onChange={(e) => handleInputChange('semifinals', e.target.value)}
              className="w-full backdrop-blur-md bg-white/5 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter number or NA"
            />
            <p className="text-gray-400 text-sm mt-1">Enter 'NA' to skip semifinals</p>
          </div>

          <div>
            <label className="block text-xl font-semibold mb-4 text-purple-400">
              Number of Final Matches
            </label>
            <input
              type="text"
              value={config.finals}
              onChange={(e) => handleInputChange('finals', e.target.value)}
              className="w-full backdrop-blur-md bg-white/5 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter number or NA"
            />
            <p className="text-gray-400 text-sm mt-1">Enter 'NA' to skip finals</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/team-names')}
          className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-md flex items-center"
        >
          <Save size={18} className="mr-2" />
          Save & Continue
          <ChevronRight size={18} className="ml-2" />
        </button>
      </div>
    </ConfigLayout>
  );
};

export default TournamentConfig;
