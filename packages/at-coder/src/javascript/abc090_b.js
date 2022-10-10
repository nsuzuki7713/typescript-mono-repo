// https://atcoder.jp/contests/abc090/tasks/abc090_b
"use strict";
function Main(input) {
  // const [A, B] = input.split(" ").map(Number);
  const A = input.split(" ")[0] - 0;
  const B = input.split(" ")[1] - 0;
  let count = 0;

  for (let i = A; i <= B; i++) {
    const s = i.toString();
    const reverseS = s.split("").reverse().join("");

    if (s === reverseS) {
      count++;
    }
  }

  console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
