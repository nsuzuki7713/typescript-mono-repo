// https://dev.classmethod.jp/articles/node-js-stream-newbie/#:~:text=process.memoryUsage()%2Bprocess.nextTick()
let maxMemory = 0;
process.nextTick(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.rss > maxMemory) {
    // メモリ最大量を更新する
    maxMemory = memUsage.rss;
  }
});
process.on('exit', () => {
  // Max memory: 511.1953125MB のように出力する
  console.log(`Max memory: ${maxMemory / 1024 / 1024}MB`);
});

(() => {
  const total = [];
  for (let i = 0; i < 10000000; i++) {
    total.push(i);
  }
})();
