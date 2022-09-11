import { faker } from '@faker-js/faker';
import * as fs from 'fs';

async function main() {
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

main().catch((e) => console.error(e));
