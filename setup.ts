const script = Deno.env.get("SCRIPT");
const encode = new TextEncoder();
const buf = encode.encode("console.log('::endgroup::');\n" + script);
const outputFile = Deno.env.get("GITHUB_ACTION_PATH") + "/main.ts";
console.log("Script writing to", outputFile);

await Deno.writeFile(outputFile, buf, { create: true });
