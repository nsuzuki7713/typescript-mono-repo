// https://atcoder.jp/contests/abc214/tasks/abc214_b
import * as fs from "fs";

export function main(input: string): void {
  const [N, T] = input.split(" ").map((v) => Number(v));
  let count = 0;

  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N - i; j++) {
      for (let k = 0; k <= N - i - j; k++) {
        const sum = i + j + k;
        const multi = i * j * k;

        if (sum <= N && multi <= T) {
          count++;
        }
      }
    }
  }
  console.log(count);
}

// main(fs.readFileSync("/dev/stdin", "utf8"));
