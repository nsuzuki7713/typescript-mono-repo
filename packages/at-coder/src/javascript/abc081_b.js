// https://atcoder.jp/contests/abc081/tasks/abc081_b
"use strict"
function Main(input) {
  const splited = input.split('\n');
  const n = splited[0];
  const a = splited[1].split(' ');
  let oddFlag = false;
  let count = 0;

  outer:
  while (true) {
    for(let i = 0; i < n; i++) {
      if (a[i] % 2 !== 0 ) {
        oddFlag = true;
        break outer;
      }
      a[i] = a[i] / 2;
    }

    count++;
  }

  console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));