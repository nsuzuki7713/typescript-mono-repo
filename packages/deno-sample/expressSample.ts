// @deno-types="npm:@types/express@^4.17"
import express from "npm:express@^4.17";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000);
console.log("listening on http://localhost:3000/");

// deno run -A expressSample.ts
