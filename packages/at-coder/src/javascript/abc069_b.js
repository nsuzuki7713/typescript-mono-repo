// https://atcoder.jp/contests/abc069/tasks/abc069_b
"use strict"
function Main(input) {
  const str = input.split('\n')[0];
  const len = str.length;
  console.log(`${str[0]}${len-2}${str[len-1]}`);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));