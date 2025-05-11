import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Save } from 'lucide-react';
import ConfigLayout from '../components/layouts/ConfigLayout';

const TeamNameInput: React.FC = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');

  const handleSave = () => {
    if (teamName.trim()) {
      localStorage.setItem('teamName', teamName);
      navigate('/tournament-config');
    }
  };

  return (
    <ConfigLayout title="Enter Team Name">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xl font-semibold mb-4 text-purple-400">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full backdrop-blur-md bg-white/5 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your team name"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/all-games-config')}
          className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={!teamName.trim()}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-md flex items-center transition-all hover:shadow-lg disabled:opacity-50"
        >
          <Save size={18} className="mr-2" />
          Save & Continue
          <ChevronRight size={18} className="ml-2" />
        </button>
      </div>
    </ConfigLayout>
  );
};

export default TeamNameInput;
