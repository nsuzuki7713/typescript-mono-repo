// https://atcoder.jp/contests/agc025/tasks/agc025_a
"use strict";
function Main(input) {
  const N = Number(input);
  let min = Infinity;

  for (let i = 1; i < N; i++) {
    const A = i;
    const B = N - A;

    const sumA = String(A)
      .split("")
      .reduce((acc, cur) => Number(acc) + Number(cur), 0);
    const sumB = String(B)
      .split("")
      .reduce((acc, cur) => Number(acc) + Number(cur), 0);

    if (sumA + sumB < min) {
      min = sumA + sumB;
    }
  }
  console.log(min);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
