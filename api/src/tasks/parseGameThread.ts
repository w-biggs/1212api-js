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

export {
  parseHomeAway
};