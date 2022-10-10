// https://atcoder.jp/contests/agc027/tasks/agc027_a
"use strict";
function Main(input) {
  input = input.trim().split("\n");
  let [N, X] = input[0].trim().split(" ").map(Number);
  const a = input[1]
    .trim()
    .split(" ")
    .map(Number)
    .sort((a, b) => a - b);

  let count = 0;
  for (let i = 0; i < N; i++) {
    if (i === N - 1) {
      if (a[i] === X) {
        count++;
      }
    } else if (X >= a[i]) {
      X -= a[i];
      count++;
    } else {
      break;
    }
  }

  console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
