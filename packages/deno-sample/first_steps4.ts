// 実行例) deno run --allow-read https://deno.land/std@0.168.0/examples/cat.ts /etc/hosts
import { copy } from "https://deno.land/std@0.170.0/streams/conversion.ts";

const filenames = Deno.args;

for (const filename of filenames) {
  const file = await Deno.open(filename);
  // 標準出力に書き出す
  await copy(file, Deno.stdout);
  file.close();
}
