import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import { generate } from 'csv/sync';

/**
 * faker.js を使用して、大きなファイルを出力するサンプル
 */
async function createJsonFile() {
  faker.setLocale('ja');
  const fileName = `${__dirname}/test.json`;

  fs.existsSync(fileName) && fs.unlinkSync(fileName);

  const data = [...Array(10000).keys()].map(() => {
    return {
      userId: faker.datatype.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.date.past(),
    };
  });

  fs.writeFileSync(fileName, JSON.stringify(data));
}
// createJsonFile().catch((e) => console.error(e));

/**
 * csv/sync を使用して、大きなファイルを出力するサンプル
 */
function createCsvFile() {
  const fileName = `${__dirname}/test.csv`;
  fs.writeFileSync(fileName, generate({ length: 10000 }));
}
createCsvFile();

// メモリを計測する
let maxMemory = 0;
process.nextTick(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.rss > maxMemory) {
    maxMemory = memUsage.rss;
  }
});
process.on('exit', () => {
  console.log(`Max memory: ${maxMemory / 1024 / 1024}MB`);
});
