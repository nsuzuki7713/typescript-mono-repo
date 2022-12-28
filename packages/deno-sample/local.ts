// deno run local.ts
import { add, multiply } from "./arithmetic.ts";

function totalCost(outboud: number, inbound: number, tax: number): number {
  return multiply(add(outboud, inbound), tax);
}

console.log(totalCost(19, 31, 1.2));
console.log(totalCost(45, 27, 1.15));
