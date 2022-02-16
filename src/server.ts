import { PrismaClient } from '@prisma/client';
import divisions from './divisions.json';
import teams from './fcsTeamsDivs.json';

const prisma = new PrismaClient();

async function main() {
  /*for (const team of teams) {
    const newTeam = await prisma.team.create({
      data: {
        school: team.name,
        shortSchool: team.shortName,
        abbreviation: team.abbreviation,
        color: team.color,
        divisionId: team.divs[team.divs.length - 1]
      }
    });
    let seasonNo = 1;
    for (const division of team.divs) {
      if (division !== null) {
        await prisma.teamDivHistory.create({
          data: {
            teamId: newTeam.id,
            divisionId: division,
            seasonNo
          }
        });
      }
      seasonNo++;
    }
  }*/

  const newTeams = await prisma.team.findMany();
  console.log(newTeams);
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  });