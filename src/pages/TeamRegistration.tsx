import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAMES } from '../data/games';
import { Team, GameInfo } from '../types';
import { getTeams, saveTeams } from '../utils/storage';
import { exportTeamsToCSV } from '../utils/exportUtils';
import TeamForm from '../components/TeamForm';
import { UserPlus, Save, ChevronRight, Download, ArrowLeft } from 'lucide-react';

const TeamRegistration: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [tournamentConfig, setTournamentConfig] = useState<any>(null);
  
  // Find the game based on the gameId
  const game = GAMES.find(g => g.id === gameId);
  
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (gameId) {
      // Load teams from persistent storage
      const persistedTeams = localStorage.getItem(`teams_${gameId}`);
      const savedTeams = persistedTeams ? JSON.parse(persistedTeams) : getTeams(gameId);
      
      if (savedTeams.length > 0) {
        setTeams(savedTeams);
      } else {
        // Initialize with one empty team
        const initialTeam = {
          id: crypto.randomUUID(),
          teamName: game?.isTeamGame ? '' : 'Solo Player',
          members: [{
            id: crypto.randomUUID(),
            fullName: '',
            email: '',
            phone: '',
            erpId: '',
            branch: '',
            collegeName: ''
          }]
        };
        setTeams([initialTeam]);
        localStorage.setItem(`teams_${gameId}`, JSON.stringify([initialTeam]));
      }
    }
  }, [gameId, game]);

  useEffect(() => {
    // Load tournament config
    const config = JSON.parse(localStorage.getItem('globalGameConfig') || '{}');
    setTournamentConfig(config);
  }, []);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Game not found. Please return to the game selection.</p>
      </div>
    );
  }

  const handleTeamChange = (index: number, updatedTeam: Team) => {
    setTeams(prev => {
      const newTeams = [...prev];
      newTeams[index] = updatedTeam;
      return newTeams;
    });
  };

  const addTeam = () => {
    setTeams(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        teamName: game.isTeamGame ? '' : 'Solo Player',
        members: [{
          id: crypto.randomUUID(),
          fullName: '',
          email: '',
          phone: '',
          erpId: '',
          branch: '',
          collegeName: ''
        }]
      }
    ]);
  };

  const removeTeam = (index: number) => {
    setTeams(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTeams = () => {
    // Validate teams
    const isValid = teams.every(team => {
      if (game.isTeamGame && !team.teamName) return false;
      return team.members.every(member => 
        member.fullName && member.email && member.phone && 
        member.erpId && member.branch && member.collegeName
      );
    });

    if (!isValid) {
      alert('Please fill in all required fields for all teams/players');
      return;
    }

    if (gameId) {
      try {
        // Save teams with all necessary data
        const teamsData = teams.map(team => ({
          teamName: team.teamName,
          kills: 0,
          position: 0,
          totalPoints: 0
        }));

        localStorage.setItem(`teams_${gameId}`, JSON.stringify(teams));
        localStorage.setItem('teamNames', JSON.stringify(teams.map(t => t.teamName)));
        localStorage.setItem('currentGameId', gameId);
        localStorage.setItem('currentTeams', JSON.stringify(teamsData));
        
        navigate('/score-calculator');
      } catch (error) {
        console.error('Error saving teams:', error);
        alert('Error saving teams. Please try again.');
      }
    }
  };

  const handleExportTeams = () => {
    exportTeamsToCSV(teams);
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
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">
          {game.name} Team Registration
        </h1>
        <p className="text-gray-400 text-center mb-8">
          {game.isTeamGame 
            ? `Register teams with up to ${game.maxTeamSize} players each`
            : "Register players for the tournament"
          }
        </p>

        {teams.map((team, index) => (
          <TeamForm
            key={team.id}
            initialTeam={team}
            index={index}
            game={game}
            onDelete={removeTeam}
            onChange={handleTeamChange}
          />
        ))}

        <div className="mb-8 flex justify-center">
          <button
            onClick={addTeam}
            className="flex items-center backdrop-blur-md bg-white/10 hover:bg-white/20 px-6 py-3 rounded-md text-cyan-400 transition-colors border border-white/20"
          >
            <UserPlus size={20} className="mr-2" />
            Add {game.isTeamGame ? 'Team' : 'Player'}
          </button>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <button
            onClick={() => navigate(`/${gameId}/config`)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md flex items-center transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Configuration
          </button>

          <button
            onClick={handleExportTeams}
            className="bg-indigo-700 hover:bg-indigo-600 text-white px-6 py-3 rounded-md flex items-center transition-colors"
            disabled={teams.length === 0}
          >
            <Download size={18} className="mr-2" />
            Download as Excel
          </button>

          <button
            onClick={handleSaveTeams}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-md flex items-center transition-all hover:shadow-lg"
            disabled={teams.length === 0}
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

export default TeamRegistration;