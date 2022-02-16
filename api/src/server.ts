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
  // Code!
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  });