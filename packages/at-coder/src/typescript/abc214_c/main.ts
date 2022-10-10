// https://atcoder.jp/contests/abc214/tasks/abc214_c
import * as fs from "fs";

export function main(input: string): void {
  const rows = input.split("\n");
  const N = Number(rows[0]);
  const S = convertRowsNumberArray(rows[1]);
  const T = convertRowsNumberArray(rows[2]);

  const times = [T[0]];

  for (let i = 1; i < N; i++) {
    times[i] = Math.min(times[i - 1] + S[i - 1], T[i]);
  }

  times[0] = Math.min(times[N - 1] + S[N - 1], times[0]);
  for (let i = 1; i < N; i++) {
    times[i] = Math.min(times[i - 1] + S[i - 1], T[i]);
  }

  times.forEach((v) => console.log(v));
}

const convertRowsNumberArray = (val: string) => {
  return val
    .trim()
    .split(" ")
    .map((v) => Number(v));
};

main(fs.readFileSync("/dev/stdin", "utf8"));
