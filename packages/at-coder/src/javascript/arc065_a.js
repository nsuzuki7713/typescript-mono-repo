// https://atcoder.jp/contests/abc049/tasks/arc065_a
"use strict"
function Main(input) {
  let s = input.split('\n')[0];
  const reverseS = s.split('').reverse().join('');
  const words = ['dream', 'dreamer', 'erase', 'eraser'].map(word => word.split('').reverse().join(''));
  let index = 0;

  while(true) {
    const findS = words.find((word) => {
      return reverseS.startsWith(word, index);
    })

    if (!findS) break;
    index += findS.length
  }

  if(index === reverseS.length) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));