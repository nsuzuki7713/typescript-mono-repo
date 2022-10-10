// https://atcoder.jp/contests/abc113/tasks/abc113_b
"use strict"
function Main(input) {
  const params = input.split('\n');
  const n = params[0];
  const t = params[1].split(' ')[0];
  const a = params[1].split(' ')[1];
  const hs = params[2].split(' ');

  let currentTemperatureDifference = Infinity;
  let currentIndex = 0;
  hs.forEach((h, index) => {
    const targetTemperatureDifference = Math.abs(a - (t - (h * 0.006)));
    if(targetTemperatureDifference < currentTemperatureDifference) {
      currentTemperatureDifference = targetTemperatureDifference;
      currentIndex = index;
    }
  });

  console.log(currentIndex + 1);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));