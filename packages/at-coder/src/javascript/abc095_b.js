// https://atcoder.jp/contests/abc095/tasks/abc095_b
"use strict"
function Main(input) {
  const params = input.split('\n');
  const N = Number(params[0].split(' ')[0]);
  const X = Number(params[0].split(' ')[1]);
  const donuts = params.slice(1, -1).map(Number).sort((a, b) => a - b);
  const total = donuts.reduce((acc, cur) => acc + cur);
  console.log(N + Math.floor((X - total) / donuts[0]));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));