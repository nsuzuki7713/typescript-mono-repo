// https://atcoder.jp/contests/abc086/tasks/abc086_a
function Main(input) {
  const splited = input.split(' ');
  const a = splited[0];
  const b = splited[1];
  const ret = (a * b) % 2 === 0 ? 'Even' : 'Odd';
  console.log(ret);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));