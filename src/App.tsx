import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Games from './pages/Games';
import GameConfig from './pages/GameConfig';
import TeamRegistration from './pages/TeamRegistration';
import MatchInput from './pages/MatchInput';
import Results from './pages/Results';
import AllGamesConfig from './pages/AllGamesConfig';
import TeamNameInput from './pages/TeamNameInput';
import TeamNames from './pages/TeamNames';
import ScoreCalculator from './pages/ScoreCalculator';
import MatchCalculator from './pages/MatchCalculator';
import FinalResult from './pages/FinalResult';
import TournamentHistory from './pages/TournamentHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/games" element={<Games />} />
        <Route path="/:gameId/config" element={<GameConfig />} />
        <Route path="/:gameId/register" element={<TeamRegistration />} />
        <Route path="/:gameId/match" element={<MatchInput />} />
        <Route path="/:gameId/results" element={<Results />} />
        <Route path="/all-games-config" element={<AllGamesConfig />} />
        <Route path="/team-name-input" element={<TeamNameInput />} />
        <Route path="/team-names" element={<TeamNames />} />
        <Route path="/score-calculator" element={<ScoreCalculator />} />
        <Route path="/results" element={<Results />} />
        <Route path="/match-calculator" element={<MatchCalculator />} />
        <Route path="/final-result" element={<FinalResult />} />
        <Route path="/tournament-history" element={<TournamentHistory />} />
        <Route path="*" element={<Navigate to="/games" replace />} />
      </Routes>
    </Router>
  );
}

export default App;