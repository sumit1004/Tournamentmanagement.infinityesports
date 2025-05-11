import React, { useState, useEffect } from 'react';
import { Player, Team, GameInfo } from '../types';
import { X, UserPlus } from 'lucide-react';

interface TeamFormProps {
  initialTeam?: Team;
  index: number;
  game: GameInfo;
  onDelete: (index: number) => void;
  onChange: (index: number, team: Team) => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ initialTeam, index, game, onDelete, onChange }) => {
  const [team, setTeam] = useState<Team>(
    initialTeam || {
      id: crypto.randomUUID(),
      teamName: '',
      members: [createEmptyPlayer()]
    }
  );

  useEffect(() => {
    // Ensure the team has at least one member
    if (team.members.length === 0) {
      setTeam(prev => ({
        ...prev,
        members: [createEmptyPlayer()]
      }));
    }

    // Notify parent component of changes
    onChange(index, team);
  }, [team, index, onChange]);

  function createEmptyPlayer(): Player {
    return {
      id: crypto.randomUUID(),
      fullName: '',
      email: '',
      phone: '',
      erpId: '',
      branch: '',
      collegeName: ''
    };
  }

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeam(prev => ({
      ...prev,
      teamName: e.target.value
    }));
  };

  const handlePlayerChange = (playerIndex: number, field: keyof Player, value: string) => {
    setTeam(prev => {
      const updatedMembers = [...prev.members];
      updatedMembers[playerIndex] = {
        ...updatedMembers[playerIndex],
        [field]: value
      };
      return {
        ...prev,
        members: updatedMembers
      };
    });
  };

  const addPlayer = () => {
    if (team.members.length < game.maxTeamSize) {
      setTeam(prev => ({
        ...prev,
        members: [...prev.members, createEmptyPlayer()]
      }));
    }
  };

  const removePlayer = (playerIndex: number) => {
    // Don't remove if it's the last player
    if (team.members.length > 1) {
      setTeam(prev => {
        const updatedMembers = prev.members.filter((_, i) => i !== playerIndex);
        return {
          ...prev,
          members: updatedMembers
        };
      });
    }
  };

  const clearTeamDetails = () => {
    setTeam({
      id: crypto.randomUUID(),
      teamName: '',
      members: [createEmptyPlayer()]
    });
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-purple-400">
          {game.isTeamGame ? `Team ${index + 1}` : `Player ${index + 1}`}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={clearTeamDetails}
            className="text-gray-400 hover:text-yellow-400 px-2 py-1 rounded-md text-sm"
            aria-label="Clear team details"
          >
            Clear Details
          </button>
          <button
            onClick={() => onDelete(index)}
            className="text-gray-400 hover:text-red-400"
            aria-label="Delete team"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Team Name (only for team games) */}
      {game.isTeamGame && (
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Team Name</label>
          <input
            type="text"
            value={team.teamName}
            onChange={handleTeamNameChange}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter team name"
            required
          />
        </div>
      )}

      {/* Player forms */}
      {team.members.map((player, playerIndex) => (
        <div key={player.id} className="mb-6 pb-6 border-b border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-cyan-400">
              {game.isTeamGame ? `Player ${playerIndex + 1}` : 'Player Information'}
            </h4>
            {game.isTeamGame && team.members.length > 1 && (
              <button
                onClick={() => removePlayer(playerIndex)}
                className="text-gray-400 hover:text-red-400"
                aria-label="Remove player"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={player.fullName}
                onChange={(e) => handlePlayerChange(playerIndex, 'fullName', e.target.value)}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={player.email}
                onChange={(e) => handlePlayerChange(playerIndex, 'email', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={player.phone}
                onChange={(e) => handlePlayerChange(playerIndex, 'phone', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">ERP ID</label>
              <input
                type="text"
                value={player.erpId}
                onChange={(e) => handlePlayerChange(playerIndex, 'erpId', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter ERP ID"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Branch</label>
              <input
                type="text"
                value={player.branch}
                onChange={(e) => handlePlayerChange(playerIndex, 'branch', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter branch"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">College Name</label>
              <input
                type="text"
                value={player.collegeName}
                onChange={(e) => handlePlayerChange(playerIndex, 'collegeName', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter college name"
                required
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Player Button (only for team games) */}
      {game.isTeamGame && team.members.length < game.maxTeamSize && (
        <button
          onClick={addPlayer}
          className="mt-2 flex items-center text-cyan-400 hover:text-cyan-300"
        >
          <UserPlus size={18} className="mr-2" />
          Add Player ({team.members.length}/{game.maxTeamSize})
        </button>
      )}
    </div>
  );
};

export default TeamForm;