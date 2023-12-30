import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
const path = resolve(process.argv[2]);
const text = await readFile(path, "utf-8");

console.log(JSON.parse(text).join("\n"));
