import * as fs from 'fs';
import dayjs from 'dayjs';

/**
 *
 */
export const createCsv = () => {
  const filePath = `${__dirname}/log.csv`;
  const header = 'create_timestamp,player_id,score\n';
  fs.writeFileSync(filePath, header);

  for (let i = 0; i < 100; i++) {
    const createTimestamp = dayjs().format('YYYY-MM-DD HH:mm');
    const playerId = `player${random()}`;
    const score = 10 * random();
    const row = `${createTimestamp},${playerId},${score}\n`;

    fs.appendFileSync(filePath, row);
  }
};

const random = () => {
  return Math.floor(Math.random() * 101);
};

createCsv();
