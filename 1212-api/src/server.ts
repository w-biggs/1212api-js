import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

/**
 * IMPORT TODO
 * Teams and division history √
 * Games (id, week_no, season_no, is_neutral) + GameTeam + GameThread + GameThreadTeam
 * Plays + Coaches
 * Metrics
 */

const prisma = new PrismaClient();

async function main() {
  const teams = [];
  fs.createReadStream(path.resolve(__dirname, 'fbsTeamsDivs.csv'))
    .pipe(csv.parse({headers: true}))
    .on('error', console.error)
    .on('data', async team => {
      const count = await prisma.team.count({
        where: {
          school: team.name
        }
      });
      if (count === 0) {
        const newTeam = await prisma.team.create({
          data: {
            school: team.name,
            shortSchool: team.shortName === '' ? null : team.shortName,
            abbreviation: team.abbreviation,
            color: team.color,
            divisionId: parseInt(team.div, 10)
          }
        });
        for (let i = 0; i < 6; i++) {
          await prisma.teamDivHistory.create({
            data: {
              teamId: newTeam.id,
              divisionId: parseInt(team.div, 10),
              seasonNo: i + 1
            }
          });
        }
        console.log(`inserted ${team.name}`);
      }
    });

  const fbsTeams = await prisma.team.findMany({
    where: {
      id: {
        gt: 131
      }
    }
  });

  console.log(fbsTeams);
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  });