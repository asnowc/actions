// @ts-check
import { getInput, setOutput } from "@actions/core";
import { readfile } from "./readfile.js";
import { filterNoExistTags } from "./github.js";
import { getWorkspaceTags } from "./npm.js";
import path from "node:path";

await main();

async function main() {
  const file = getInput("file");
  const preset = getInput("preset");
  const prefix = getInput("prefix");
  /** @type {string[]} */
  let versions;
  if (preset) {
    versions = await getPreset(preset);
    versions = await filterNoExistTags(versions);
  } else {
    const field = getInput("field");
    versions = await getVersion(file, field, prefix);
    versions = await filterNoExistTags(versions, prefix);
  }

  if (versions.length) {
    setOutput("tags", JSON.stringify(versions));
    console.log("Tags: " + versions.join(", "));
  } else {
    console.log("No tags");
  }
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
    return [prefix + version];
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
    case "pnpm-workspace":
      return getWorkspaceTags(getInput("file"), { subPrefix: getInput("prefix") });
    default:
      throw new Error("不支持预设：" + preset);
  }
}
