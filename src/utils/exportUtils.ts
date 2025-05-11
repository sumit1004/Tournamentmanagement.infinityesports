import { Team, MatchResult } from '../types';

// Note: In a real application, you would use a library like xlsx or exceljs
// Since we're simulating this behavior, we'll use CSV format
export const exportTeamsToCSV = (teams: Team[]): void => {
  let csvContent = "Team Name,Player Name,Email,Phone,ERP ID,Branch,College Name\n";
  
  teams.forEach(team => {
    team.members.forEach(player => {
      csvContent += `"${team.teamName}","${player.fullName}","${player.email}","${player.phone}","${player.erpId}","${player.branch}","${player.collegeName}"\n`;
    });
  });
  
  downloadCSV(csvContent, 'teams_export.csv');
};

export const exportResultsToCSV = (teams: Team[], results: MatchResult[]): void => {
  // Create a map for quick team lookup
  const teamsMap = teams.reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {} as Record<string, Team>);
  
  // Sort results by points (descending)
  const sortedResults = [...results].sort((a, b) => b.points - a.points);
  
  let csvContent = "Rank,Team Name,Total Points,Kills\n";
  
  sortedResults.forEach((result, index) => {
    const team = teamsMap[result.teamId];
    if (team) {
      csvContent += `${index + 1},"${team.teamName}",${result.points},${result.kills}\n`;
    }
  });
  
  downloadCSV(csvContent, 'tournament_results.csv');
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};