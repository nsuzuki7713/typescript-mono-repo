// https://atcoder.jp/contests/abc061/tasks/abc061_b
// ↓のほうが早いし、良いと思う
// https://atcoder.jp/contests/abc061/submissions/9904614
"use strict";
function Main(input) {
  const [a, ...b] = input.trim().split("\n");
  const [N, M] = a.trim().split(" ").map(Number);
  const c = b.flatMap((a) => a.trim().split(" "));

  for (let i = 1; i <= N; i++) {
    const d = c.filter((d) => Number(d) === i);
    console.log(d.length);
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
