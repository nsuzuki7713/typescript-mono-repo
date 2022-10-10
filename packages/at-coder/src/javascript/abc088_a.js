// https://atcoder.jp/contests/abc088/tasks/abc088_a
"use strict"
function Main(input) {
  const params = input.split('\n').map(Number);
  const n = params[0];
  const a = params[1];
  const fraction = n % 500;

  if (fraction <= a) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));