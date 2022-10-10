// https://atcoder.jp/contests/abc042/tasks/abc042_b
"use strict";
function Main(input) {
  const params = input.split("\n");
  // const [N, L] = params[0].split(" ");

  const s = params.slice(1);

  console.log(s.sort().join(""));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
