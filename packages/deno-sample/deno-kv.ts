// deno run --unstable deno-kv.ts

const kv = await Deno.openKv();

// 永続化されているか最初に取得してみる
const res3 = await kv.get(["b"]);
console.log("key:" + res3.key);
console.log("value:" + JSON.stringify(res3.value));

// setする
await kv.set(["a"], { name: "Alice" });

// getする
const res = await kv.get(["a"]);
console.log("key:" + res.key);
console.log(`value: ${JSON.stringify(res.value)}`);

// 削除する
await kv.delete(["a"]);

// 再度取得する
const res2 = await kv.get(["a"]);
console.log("key:" + res2.key);
console.log("value:" + res2.value);

// 永続化するのかの確認のためセットする
await kv.set(["b"], { name: "bob" });
