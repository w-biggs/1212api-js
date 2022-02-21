import { PrismaClient, Team } from '@prisma/client';
import * as fs from 'fs';
import * as readline from 'readline';
import bent from 'bent';
import * as path from 'path';
import * as csv from 'fast-csv';

// Script for getting old games

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    }
  ]
});
const getJson = bent('json', {
  'User-Agent': 'linux:1212data:v1.0.0 (by /u/jokullmusic)',
});
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// get threads between dates
const fetchGamesByTeamAndDates = async function fetchGamesByTeamAndDates(team: Team, start: string, end: string, secondTeam: Team|null = null) {
  const startDate = new Date(start).getTime() / 1000;
  const endDate = new Date(end).getTime() / 1000;
  // console.log(startDate, endDate);
  let query = `-flair:"Post Game Thread" (title:"${team.school}" `;
  if (team.shortSchool) {
    query += ` OR title:"${team.shortSchool}"`;
  }
  query += `)`;
  if (secondTeam) {
    query += ` AND (title:"${secondTeam.school}"`;
    if (secondTeam.shortSchool) {
      query += ` OR title:"${secondTeam.shortSchool}"`;
    }
    query += `)`;
  }
  const params = new URLSearchParams({
    subreddit: 'fakecollegefootball',
    restrict_sr: 'on',
    q: query,
    sort: 'new',
    limit: '100'
  });
  let filteredResults: any[] = [];
  while (filteredResults.length === 0) {
    const results = await getJson(`https://api.reddit.com/r/FakeCollegeFootball/search.json?${params.toString()}`);
    if (secondTeam) {
      console.log(`https://api.reddit.com/r/FakeCollegeFootball/search.json?${params.toString()}`);
    }
    if (results.data.children.length === 0) {
      break;
    }
    filteredResults = results.data.children.filter((thread: any) => {
      return (thread.data.created_utc > startDate && thread.data.created_utc < endDate);
    });
    params.set('after', results.data.children[results.data.children.length - 1].data.name);
  }
  return filteredResults;
}

/**
 * fixes &amp; and nested &amp;s
 */
const fixTeamHtmlEntities = function fixTeamHtmlEntities(teamName: string) {
  let fixedTeamName = teamName;
  while (fixedTeamName.indexOf('&amp;') >= 0) {
    fixedTeamName = fixedTeamName.replace('&amp;', '&');
  }
  return fixedTeamName;
};

const ask = function ask(teamAName: string, teamBName: string, games: any[]): Promise<false|{teams:[string,string],id:string}> {
  return new Promise((resolve, reject) => {
    let question = `Which game to use for ${teamAName} vs ${teamBName}?\n`;
    const ids = new Array(games.length);
    games.forEach((game, i) => {
      ids[i] = game.data.id;
      question += `${i}: ${game.data.title} <${game.data.id}>\n`;
    });

    rl.question(question, (answer) => {
      if (answer === 'n') {
        return resolve(false);
      }
      const answerInt = parseInt(answer, 10);
      if (Number.isNaN(answerInt)) {
        return reject(new Error(`${answer} is not an integer.`));
      }
      if (!(answerInt in games)) {
        return reject(new Error(`${answerInt} is not a valid choice.`));
      }
      console.log(`${[teamAName, teamBName].join()}: resolving q with ${answerInt}`);
      return resolve({
        teams: [teamAName, teamBName],
        id: games[answerInt].data.id
      });
    });
  });
};

const handleTeamsGames = async function handleTeamsGames(teamAName: string, teamBName: string) {
  const teamA = await prisma.team.findFirst({
    where: {
      OR: [
        { school: teamAName },
        { shortSchool: teamAName }
      ]
    }
  });
  if (!teamA) {
    throw new Error(`Team ${teamAName} not found.`);
  }
  const teamB = await prisma.team.findFirst({
    where: {
      OR: [
        { school: teamBName },
        { shortSchool: teamBName }
      ]
    }
  });
  if (!teamB) {
    throw new Error(`Team ${teamBName} not found.`);
  }
  const gamesA = await fetchGamesByTeamAndDates(teamA, '2018-01-10', '2018-03-31');
  const gamesB = await fetchGamesByTeamAndDates(teamB, '2018-01-10', '2018-03-31');
  let games = gamesA;
  for (const gameB of gamesB) {
    if (gamesA.filter(gameA => gameA.data.id === gameB.data.id).length === 0) {
      games.push(gameB);
    }
  }
  if (games.length === 0) {
    console.log('Doing a both search');
    games = await fetchGamesByTeamAndDates(teamA, '2018-01-10', '2018-03-31', teamB);
  }

  if (games.length > 1) {
    return await ask(teamAName, teamBName, games);
  } else if (games.length === 0) {
    console.log(`no game found for ${teamAName} vs ${teamBName}.`);
    return false;
  } else {
    console.log(`${[teamAName, teamBName].join()}: resolving no-q with ${games.length} game`);
    if (!games[0].data.id) {
      console.log(games[0]);
    }
    return {
      teams: [teamAName, teamBName],
      id: games[0].data.id
    };
  }
}

const getMatchupsForWeek = function getMatchupsForWeek(readStream: fs.ReadStream): Promise<{teams: [string,string], game:string|false}[]> {
  return new Promise((resolve, reject) => {
    const gameList: {teams: [string,string], game:string|false}[] = [];
    readStream.pipe(csv.parse())
      .on('error', reject)
      .on('data', async row => {
        gameList.push({
          teams: row,
          game: false
        });
      })
      .on('end', () => resolve(gameList));
  });
};

/**
 * S1
 * W1: Jan 19/20 2018
 */
async function main() {
  const readStream = fs.createReadStream(path.resolve(__dirname, 's1w1.csv'));
  getMatchupsForWeek(readStream)
    .then(async matchupList => {
      const gameList: { teams: string[]; id: any; }[] = [];
      for (let matchup of matchupList) {
        const game = await handleTeamsGames(...matchup.teams);
        if (game) {
          gameList.push(game);
        }
      }
      fs.writeFileSync(path.resolve(__dirname, 'gameList.json'), JSON.stringify(gameList, null, 2));
    })
    .catch(error => console.error);
}

prisma.$on('query', (e) => {
  // console.log('Query: ' + e.query)
  // console.log('Duration: ' + e.duration + 'ms')
});

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  });