import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Save, Download, Trash2 } from 'lucide-react';
import ConfigLayout from '../components/layouts/ConfigLayout';

const TeamNames: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    // Load config and saved teams
    const config = JSON.parse(localStorage.getItem('globalGameConfig') || '{}');
    const maxPositions = config.maxPositions || 10;
    const savedTeams = JSON.parse(localStorage.getItem('teamNames') || '[]');
    
    // If we have saved teams and they match maxPositions, use them
    if (savedTeams.length === maxPositions) {
      setTeams(savedTeams);
    } else {
      // Otherwise create new array with maxPositions length
      setTeams(Array(maxPositions).fill(''));
    }
  }, []);

  const handleTeamNameChange = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
    localStorage.setItem('teamNames', JSON.stringify(newTeams));
  };

  const handleDownload = () => {
    const teamsData = teams.map((team, index) => `Team ${index + 1}: ${team}`).join('\n');
    const blob = new Blob([teamsData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team_names.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (teams.every(team => team.trim())) {
      localStorage.setItem('teamNames', JSON.stringify(teams));
      handleDownload();
      navigate('/tournament-config');
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all team names?')) {
      setTeams(Array(teams.length).fill(''));
      localStorage.removeItem('teamNames');
    }
  };

  return (
    <ConfigLayout title="Enter Team Names">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team, index) => (
            <div key={index} className="flex items-center space-x-4">
              <span className="text-gray-400 w-8">#{index + 1}</span>
              <input
                type="text"
                value={team}
                onChange={(e) => handleTeamNameChange(index, e.target.value)}
                placeholder={`Team ${index + 1}`}
                className="flex-1 backdrop-blur-md bg-white/5 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/all-games-config')}
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Clear All
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleDownload}
            disabled={!teams.every(team => team.trim())}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md flex items-center transition-all hover:shadow-lg disabled:opacity-50"
          >
            <Download size={18} className="mr-2" />
            Download Teams
          </button>
          <button
            onClick={handleSave}
            disabled={!teams.every(team => team.trim())}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-md flex items-center transition-all hover:shadow-lg disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            Save & Continue
            <ChevronRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    </ConfigLayout>
  );
};

export default TeamNames;
