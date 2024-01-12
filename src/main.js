// @ts-check
import { getInput, setOutput } from "@actions/core";
import { readfile } from "./readfile.js";
import { filterNoExistTags } from "./github.js";
import path from "node:path";

await main();

async function main() {
  const file = getInput("json");
  /** @type {string[]} */
  let versions;
  if (file.startsWith(".") || file.startsWith("/")) {
    const field = getInput("field");
    const prefix = getInput("prefix");
    versions = await getVersion(file, field, prefix);
  } else {
    versions = await getPreset(file);
  }

  versions = await filterNoExistTags(versions);
  setOutput("tags", JSON.stringify(versions));
}

/**
 * @param {string} jsonpath
 * @param {string} field
 * @param {string} prefix
 *
 * @returns {Promise<string[]>}
 */
async function getVersion(jsonpath, field, prefix) {
  jsonpath = path.resolve(jsonpath);
  const json = await readfile(jsonpath).catch((e) => {
    throw new Error("json 文件读取失败：" + jsonpath, { cause: e });
  });
  const version = json?.[field];

  if (typeof version === "string") {
    return [version];
  } else if (version instanceof Array) {
    if (prefix) return version.map((val) => prefix + val);
    else return version;
  } else throw new Error(`JSON '${field}' 字段(${typeof version}) 不存在或格式错误`);
}
/**
 * @param {string} preset
 * @returns {Promise<string[]>}
 */
function getPreset(preset) {
  switch (preset) {
    default:
      throw new Error("不支持预设：" + preset);
  }
}
