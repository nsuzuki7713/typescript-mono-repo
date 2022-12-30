/**
 * # Examples
 *
 * ```ts
 * import { foo } from "./foo.ts";
 * ```
 */
export function foo(): string {
  return "foo";
}

/**
 * # Examples
 *
 * ```ts
 * import { foo2 } from "./foo.ts";
 * ```
 */
export function foo02(): string {
  return "foo";
}

// deno test --doc foo.ts
// foo02はExamplesの記載と違うので失敗する。
