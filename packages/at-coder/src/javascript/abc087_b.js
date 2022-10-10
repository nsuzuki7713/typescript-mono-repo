// https://atcoder.jp/contests/abc087/tasks/abc087_b
"use strict"
function Main(input) {
  const params = input.split('\n').map(Number);
  const a = params[0];
  const b = params[1];
  const c = params[2];
  const x = params[3];
  let count = 0;
  for (let i = 0; i <= a; i++) {
    for (let j = 0; j <= b; j++) {
      for (let k = 0; k <= c; k++) {
        const sum = (500 * i) + (100 * j) + (50 * k);
        const price = x - sum;
        if (price === 0) {
          count++;
        }
      }
    }
  }

  console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));