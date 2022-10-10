// https://atcoder.jp/contests/abc214/tasks/abc214_a
import * as fs from 'fs';

export function main(input: string): void {
  const N = Number(input.split(' ')[0]);

  if (1 <= N && N <= 125) {
    console.log(4);
    return;
  }

  if (126 <= N && N <= 211) {
    console.log(6);
    return;
  }

  if (212 <= N && N <= 214) {
    console.log(8);
    return;
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
