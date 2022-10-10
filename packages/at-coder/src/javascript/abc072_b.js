// https://atcoder.jp/contests/abc072/tasks/abc072_b
"use strict"
function Main(input) {
  const arrS = input.split('');
  const oddS = arrS.reduce((pre, cur, index) => {
    if ((index + 1) % 2 !== 0) {
      return pre = pre + cur;
    }
    return pre;
  }, '');

  console.log(oddS);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));