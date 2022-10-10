// https://atcoder.jp/contests/abc071/tasks/abc071_b
"use strict";
function Main(input) {
  const S = input.trim().split("\n")[0];
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  let exist = false;
  for (let i = 0; i < alphabet.length; i++) {
    if (!S.includes(alphabet[i])) {
      console.log(alphabet[i]);
      exist = true;
      return;
    }
  }

  if (!exist) {
    console.log("None");
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
