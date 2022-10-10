https://atcoder.jp/contests/abc081/tasks/abc081_a
function Main(input) {
  console.log(input.split('').reduce((acc, cur) => Number(acc) + Number(cur), 0))
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));