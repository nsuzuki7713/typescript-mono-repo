// 実行例) deno run --allow-net --allow-write http_server.ts
// curl http://localhost:8000
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const handler = async (request: Request): Promise<Response> => {
  const resp = await fetch("https://api.github.com/users/denoland", {
    headers: {
      accept: "application/json",
    },
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: {
      "content-type": "application/json",
    },
  });
};

console.log("Listening on http://localhost:8000");
serve(handler);
