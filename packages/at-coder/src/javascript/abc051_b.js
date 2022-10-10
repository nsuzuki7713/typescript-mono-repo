// https://atcoder.jp/contests/abc051/tasks/abc051_b
"use strict";
function Main(input) {
  // const [K, S] = input.split(" ").map(Number);
  const params = input.split(" ").map(Number);
  const K = params[0];
  const S = params[1];

  let count = 0;
  for (let x = 0; x <= K; x++) {
    for (let y = 0; y <= K; y++) {
      const z = S - (x + y);
      if (0 <= z && z <= K) {
        count++;
      }
    }
  }
  console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
