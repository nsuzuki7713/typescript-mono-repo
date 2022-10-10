// https://atcoder.jp/contests/abc095/tasks/abc095_a
"use strict"
function Main(input) {
  const params = input.split('');
  const total = params.reduce((acr, cur) => {
    if (cur === "o") {
      return acr + 100;
    }

    return acr;
  }, 700);

  console.log(total);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));