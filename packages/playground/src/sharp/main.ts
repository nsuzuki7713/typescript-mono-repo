import sharp from 'sharp';

(async () => {
  const res = await sharp('./src/sharp/test.png').resize(512).toFile('./src/sharp/test2.png');

  console.log(res);
})();
