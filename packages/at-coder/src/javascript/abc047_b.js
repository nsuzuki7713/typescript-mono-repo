// https://atcoder.jp/contests/abc047/tasks/abc047_b
"use strict";
function Main(input) {
  const [basePoint, ...points] = input.trim().split("\n");
  const [W, H, N] = basePoint.trim().split(" ").map(Number);
  const field = Array(W)
    .fill()
    .map(() => Array(H).fill(1));

  for (let i = 0; i < N; i++) {
    const [x, y, a] = points[i].trim().split(" ").map(Number);

    let [jmin, jmax, kmin, kmax] = [0, 0, 0, 0];
    if (a === 1) {
      [jmin, jmax, kmin, kmax] = [0, x, 0, H];
    } else if (a === 2) {
      [jmin, jmax, kmin, kmax] = [x, W, 0, H];
    } else if (a === 3) {
      [jmin, jmax, kmin, kmax] = [0, W, 0, y];
    } else if (a === 4) {
      [jmin, jmax, kmin, kmax] = [0, W, y, H];
    }

    for (let j = jmin; j < jmax; j++) {
      for (let k = kmin; k < kmax; k++) {
        field[j][k] = 0;
      }
    }
  }

  const area = field.flat().reduce((acc, cur) => acc + cur, 0);
  console.log(area);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
