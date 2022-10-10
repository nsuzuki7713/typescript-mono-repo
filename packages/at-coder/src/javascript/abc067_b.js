// https://atcoder.jp/contests/abc067/tasks/abc067_b
"use strict";
function Main(input) {
  const params = input.split("\n");
  // const [N, K] = params[0].split(" ").map(Number);
  const K = params[0].split(" ").map(Number)[1];
  const ln = params[1]
    .split(" ")
    .map(Number)
    .sort((a, b) => b - a);

  let len = 0;
  for (let i = 0; i < K; i++) {
    len += ln[i];
  }

  console.log(len);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
