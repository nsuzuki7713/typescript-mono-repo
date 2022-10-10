// https://atcoder.jp/contests/abc088/tasks/abc088_b
"use strict"
function Main(input) {
  const params = input.split('\n');
  const n = Number(params[0]);
  const a = params[1].split(' ').map(Number);
  const sortA = a.sort((s1, s2) => s2 - s1);

  // リファクタでコメントアウト化
  // const aliceTotal = sortA.reduce((acc, cur, index) => {
  //   if (index % 2 === 0) {
  //     return acc + cur;
  //   }
    
  //   return acc;
  // }, 0);

  // const bobTotal = sortA.reduce((acc, cur, index) => {
  //   if (index % 2 !== 0) {
  //     return acc + cur;
  //   }
    
  //   return acc;
  // }, 0);

  let aliceTotal = 0;
  let bobTotal = 0;

  sortA.forEach((cur, index) => {
    if (index % 2 === 0) {
      aliceTotal += cur;
    } else {
      bobTotal += cur;
    }
  });

  console.log(aliceTotal - bobTotal);

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));