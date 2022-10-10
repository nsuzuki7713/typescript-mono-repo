// https://atcoder.jp/contests/abc082/tasks/abc082_b
"use strict"
function Main(input) {
  const params = input.split('\n');
  const s = params[0];
  const sLen = s.length;
  const t = params[1];
  const tLen = t.length;
  
  const sort_s = s.split('').sort((a, b) => a < b ? -1 : 1);
  const sort_t = t.split('').sort((a, b) => a < b ? 1 : -1);
  
  let eqflag = true;
  for (let i = 0; i < sLen; i++) {
    if (sort_s[i] < sort_t[i]) {
      console.log('Yes');
      return;
    }

    if (sort_s[i] !== sort_t[i]) {
      eqflag = false;
    }
  }

  if(sLen < tLen && eqflag) {
    console.log('Yes');
    return;
  }
  console.log('No');
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));