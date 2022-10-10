// https://atcoder.jp/contests/abc105/tasks/abc105_b
"use strict";
function Main(input) {
  const n = Number(input);
  let ok = false;
  for (let i = 0; i <= 25; i++) {
    for (let j = 0; j <= 14; j++) {
      const sum = 4 * i + 7 * j;
      if (n - sum === 0) {
        ok = true;
        break;
      }
    }
  }

  if (ok) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
