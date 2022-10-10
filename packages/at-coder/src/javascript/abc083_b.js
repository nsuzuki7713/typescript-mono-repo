// https://atcoder.jp/contests/abc083/tasks/abc083_b
"use strict"
function Main(input) {
  const params = input.split(' ').map(Number);
  const n = params[0];
  const a = params[1];
  const b = params[2];
  let sum = 0;

  for (let i = 1; i <= n; i++) {
    const total = String(i).split('').reduce((acc, cur) => Number(acc) + Number(cur), 0);
    if (a <= total && total <= b) {
      sum += i;
    }
  }

  console.log(sum);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));