// https://atcoder.jp/contests/arc004/tasks/arc004_1
"use strict";
function Main(input) {
  const params = input.split("\n");
  let maxLen = 0;

  for (let i = 1; i < params.length - 1; i++) {
    for (let j = i + 1; j < params.length - 1; j++) {
      // const [x1, y1] = params[i].split(" ").map(Number);
      // const [x2, y2] = params[j].split(" ").map(Number);
      const target1 = params[i].split(" ").map(Number);
      const target2 = params[j].split(" ").map(Number);
      const x1 = target1[0];
      const y1 = target1[1];
      const x2 = target2[0];
      const y2 = target2[1];
      const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

      if (maxLen < distance) {
        maxLen = distance;
      }
    }
  }

  console.log(maxLen);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
