import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Calendar, Users, Medal, Trash2, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TournamentData {
  id: number;
  date: string;
  name: string;
  standings: Array<{
    teamName: string;
    totalKills: number;
    totalPoints: number;
    matches: number;
  }>;
}

const TournamentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{name: string, date: string}>({ name: '', date: '' });

  useEffect(() => {
    const savedTournaments = JSON.parse(localStorage.getItem('tournamentHistory') || '[]');
    setTournaments(savedTournaments.reverse()); // Show newest first
  }, []);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this tournament history?')) {
      const updatedTournaments = tournaments.filter(t => t.id !== id);
      localStorage.setItem('tournamentHistory', JSON.stringify(updatedTournaments));
      setTournaments(updatedTournaments);
    }
  };

  const handleEdit = (tournament: TournamentData) => {
    setEditingId(tournament.id);
    setEditForm({ name: tournament.name, date: tournament.date });
  };

  const handleSaveEdit = (id: number) => {
    const updatedTournaments = tournaments.map(t => {
      if (t.id === id) {
        return { ...t, ...editForm };
      }
      return t;
    });
    
    localStorage.setItem('tournamentHistory', JSON.stringify(updatedTournaments));
    setTournaments(updatedTournaments);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen relative text-gray-100 p-6">
      <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: 'url("/public/background.jpg")',
          zIndex: -1 
        }} />
      <div className="fixed inset-0 bg-black/70" style={{ zIndex: -1 }} />
      
      <div className="relative max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Games
        </button>

        <h1 className="text-3xl font-bold text-purple-400 mb-8 flex items-center">
          <Trophy className="w-8 h-8 mr-3" />
          Tournament History
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div 
              key={tournament.id}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 text-white 
                shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 relative"
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                {editingId === tournament.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(tournament.id)}
                      className="text-green-400 hover:text-green-300 p-1 backdrop-blur-md bg-black/20 rounded-full transition-all duration-300 hover:scale-110"
                      title="Save changes"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-400 hover:text-gray-300 p-1 backdrop-blur-md bg-black/20 rounded-full transition-all duration-300 hover:scale-110"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(tournament)}
                      className="text-blue-400 hover:text-blue-300 p-1 backdrop-blur-md bg-black/20 rounded-full transition-all duration-300 hover:scale-110"
                      title="Edit tournament"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(tournament.id)}
                      className="text-red-400 hover:text-red-300 p-1 backdrop-blur-md bg-black/20 rounded-full transition-all duration-300 hover:scale-110"
                      title="Delete tournament"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-4 pr-16">
                <div>
                  {editingId === tournament.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-black/30 border border-white/20 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="text"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full bg-black/30 border border-white/20 rounded px-2 py-1 text-white"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                      <p className="text-purple-400 font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {tournament.date}
                      </p>
                    </>
                  )}
                </div>
                <Medal className="w-8 h-8 text-yellow-400" />
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-3">Top 3 Teams</h4>
                {tournament.standings.slice(0, 3).map((team, index) => (
                  <div key={team.teamName} className="flex justify-between items-center mb-2">
                    <span className="flex items-center">
                      <span className={`
                        ${index === 0 ? 'text-yellow-400' : ''}
                        ${index === 1 ? 'text-gray-300' : ''}
                        ${index === 2 ? 'text-amber-600' : ''}
                        font-bold mr-2
                      `}>
                        #{index + 1}
                      </span>
                      {team.teamName}
                    </span>
                    <span className="text-purple-400">{team.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p>No tournament history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentHistory;
