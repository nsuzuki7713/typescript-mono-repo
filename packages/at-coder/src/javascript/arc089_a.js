// https://atcoder.jp/contests/abc086/tasks/arc089_a
"use strict"
function Main(input) {
  const params = input.split('\n');
  const n = Number(params[0]);
  let t = [0];
  let x = [0];
  let y = [0];

  let flag = true;
  for(let i=1; i<=n; i++) {
    const line = params[i].split(' ').map(Number);
    t.push(line[0]);
    x.push(line[1]);
    y.push(line[2]);

    const dt = t[i] - t[i-1];
    const dist = Math.abs(x[i] - x[i-1]) + Math.abs(y[i] - y[i-1]);
    if (dt < dist) {
      flag = false;
      break;
    }

    if(dt % 2 !== dist % 2) {
      flag = false;
      break;
    }
  }

  if (flag) {
    console.log('Yes');
  } else {
    console.log('No')
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));