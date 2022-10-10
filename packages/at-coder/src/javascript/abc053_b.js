// https://atcoder.jp/contests/abc053/tasks/abc053_b
"use strict"
function Main(input) {
  const s = input;
  let aIndex = -1;
  let zIndex = -1;
  for(let i =0; i < s.length; i++) {
    if (s[i] === 'A' && aIndex === -1) {
      aIndex = i;
    }
    if (s[i] === 'Z') {
      zIndex = i;
    }
  }

  console.log(zIndex - aIndex + 1);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));