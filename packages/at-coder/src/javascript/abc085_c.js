// https://atcoder.jp/contests/abc085/tasks/abc085_c
"use strict"
function Main(input) {
  const params = input.split(' ').map(Number);
  const n = params[0];
  const y = params[1];
  let total = 0;
  let existing = false;

  loop:
  for (let i = n; i>= 0; i--) {
    total = 10000 * i;
    if(total > y) continue;

    for (let j= n-i; j >= 0; j--){
      let k = n - i - j;
      total = 10000 * i + 5000 * j + 1000 * k;
      if(total === y) {
        console.log(`${i} ${j} ${k}`);
        existing = true;
        break loop;
      }
    }
  }

  if(!existing) {
    console.log('-1 -1 -1');
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));