import { PrismaClient, Team } from '@prisma/client';
import bent from 'bent';
// import gameList from './gameLists1w1.json';
import * as fs from 'fs';
import * as path from 'path';

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

/**
 * Fetch a game from Reddit.
 * @param {String} gameId The game's thread ID
 */
const fetchGameJson = async function fetchGameJson(gameId: string) {
  const rawPost = await getJson(`https://api.reddit.com/comments/${gameId}/api/info.json?limit=500&depth=10`);
  const postInfo = rawPost[0].data.children[0].data;
  const comments = rawPost[1].data.children.map((comment: any) => comment.data);
  if (rawPost[1].data.children[comments.length - 1].kind === 'more') {
    console.log('encountered a "more"!');
  }
  //postInfo.comments = comments;
  return postInfo;
};

const parseGameThread = function parseGameThread(gameJSON: any) {
  const homeAway = gameJSON.title.split('@');
  // const home = 
};

const getGameStats = async function getGameStats() {
  const gameList = [{
    id: 'diog7s'
  }]
  for (const game of gameList) {
    console.log(game.id);
    const json = await fetchGameJson(game.id);
    console.log('json acquired');
    fs.writeFileSync(path.resolve(__dirname, 'gameJSON.json'), JSON.stringify(json, null, 2));
    console.log('json written');
    break;
  }
  return;
};

getGameStats();
