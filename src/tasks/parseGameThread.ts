const parseHomeAway = function parseHomeAway(gameTitle: string) {
  const teamNamesRegex = /(?:\[.*\])(?: .*?\))? (.+?) @ (?:.*?\) )?(.+)/gm;
  const teamNamesMatch = teamNamesRegex.exec(gameTitle);
  if (teamNamesMatch) {
    const [, awayTeam, homeTeam] = teamNamesMatch;
    return {
      homeTeam,
      awayTeam
    }
  }
  return false;
};

const parseTeamStats = function parseTeamStats(gameSelfText: string) {
  const statsStringsRegex = /Total Passing Yards.+?\n.+?\n(.+?)\n/gm;
  let statsStringsMatch;
  let stats = {
    home: {},
    away: {}
  }

  let matchNo = 0;
  while ((statsStringsMatch = statsStringsRegex.exec(gameSelfText)) !== null && matchNo < 2) {
    const [passYds, rushYds,, interceptions, fumbles, fgs, timeOfPossession,] = statsStringsMatch[1].split('|');
    const splitFGs = fgs.split('/').map(val => parseInt(val, 10));
    const splitTOP = timeOfPossession.split(':').map(val => parseInt(val, 10));
    const topSeconds = (splitTOP[0] * 60) + splitTOP[1];
    const teamStats = {
      rushYds: parseInt(rushYds, 10),
      passYds: parseInt(passYds, 10),
      interceptions: parseInt(interceptions, 10),
      fumbles: parseInt(fumbles, 10),
      fgAttempts: splitFGs[1],
      fgMakes: splitFGs[0],
      timeOfPossession: topSeconds
    }
    if (matchNo === 0) {
      stats.away = teamStats;
    } else if (matchNo === 1) {
      stats.home = teamStats;
    }
    matchNo++;
  }
  return stats;
};

const parseTeamScores = function parseTeamScores(gameSelfText: string) {
  const scoreStringsRegex = /Team\|Q1.+?\n.+?\n(.+?)\n(.+?)\n/gm;
  const scoreStringsMatch = scoreStringsRegex.exec(gameSelfText);
  if (scoreStringsMatch) {
    const [, homeScoreString, awayScoreString] = scoreStringsMatch;
    const parsedScores = [homeScoreString, awayScoreString].map((scoreString) => {
      return scoreString.split('|').slice(1, -1).map(score => parseInt(score, 10)); // slice to remove team name and final total
    });
    return {
      home: parsedScores[0],
      away: parsedScores[1]
    }
  }
  return false;
};

export {
  parseHomeAway,
  parseTeamStats,
  parseTeamScores
};