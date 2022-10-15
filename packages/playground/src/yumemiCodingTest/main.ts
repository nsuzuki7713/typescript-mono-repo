import * as fs from 'fs';

const getRanking = () => {
  const filePath = `${__dirname}/log.csv`;

  const body = fs.readFileSync(filePath, 'utf-8');
  const [header, ...rows] = body.split('\n');

  const aggregateByUser = rows.reduce((acc, row) => {
    const [createTimestamp, playerId, score] = row.split(',');

    if (!playerId) {
      return acc;
    }

    acc[playerId] = (acc[playerId] ?? 0) + (score === undefined ? 0 : Number(score));

    return acc;
  }, {} as Record<string, number>);

  const sortedAggregateByUser = Object.entries(aggregateByUser).sort((a, b) => b[1] - a[1]);

  let count = 0;
  for (let i = 0; i < sortedAggregateByUser.length; i++) {
    if (count >= 10) {
      break;
    }

    console.log(`${count + 1}, ${sortedAggregateByUser[i]![0]}, ${sortedAggregateByUser[i]![1]}`);
    count++;
  }
};

getRanking();
