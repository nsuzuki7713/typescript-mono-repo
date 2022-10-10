// https://atcoder.jp/contests/abc085/tasks/abc085_b
"use strict"
function Main(input) {
  const args = input.split('\n');
  const n = args[0];
  const kagamiMoti = [];

  for(let i = 1;i<=n; i++) {
    const moti = args[i];
    // if(!kagamiMoti.includes(moti)) 
    if(kagamiMoti.indexOf(moti) === -1) {
      kagamiMoti.push(moti);
    }
  }

  console.log(kagamiMoti.length);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));