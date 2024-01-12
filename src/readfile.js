import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
/** @param {string} filename   */
export async function readfile(filename) {
  const text = await fs.readFile(filename, "utf-8");
  const { ext } = path.parse(filename);
  switch (ext) {
    case ".json":
      return JSON.parse(text);
    case ".yaml":
      return YAML.parse(text);
    case ".yml":
      return YAML.parse(text);
    default:
      throw new Error("无法解析扩展名：" + filename);
  }
}
