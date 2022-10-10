// https://atcoder.jp/contests/abc082/tasks/abc082_a
"use strict"
function Main(input) {
  const total = input.split(' ').map(Number).reduce((acc, cur) => acc + cur, 0);
  const ave = Math.ceil(total / 2);
  console.log(ave);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));