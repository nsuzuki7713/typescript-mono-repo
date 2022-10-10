// https://atcoder.jp/contests/abc068/tasks/abc068_b
"use strict"
function Main(input) {
  const n = Number(input);

  let i = 0;
  while (true) {
    if (Math.pow(2, i) > n) {
      console.log(Math.pow(2, i - 1));
      return;
    }
    i++;
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
