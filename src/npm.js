// @ts-check
import * as yaml from "yaml";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs/promises";
/**
 * @typedef {Object} PackageJson
 * @property {string} packageRoot package.json 所在文件夹
 * @property {string|undefined} name
 * @property {string|undefined} version
 */

/**
 * @typedef {Object} PnpmWorkspaceSearchRes
 * @property {PackageJson[]} success
 * @property {any[]} fail
 * @property {PackageJson} rootPkg 工作区根包的 package.json 信息
 */

/**
 * @param {string} workspaceRoot
 * @returns {Promise<PnpmWorkspaceSearchRes>}
 * @remarks 查找PNPM工作区目录下的所有包的信息
 */
async function findPnpmWorkspacePkgs(workspaceRoot) {
  const [rootPkg, packagesGlob] = await Promise.all([
    readPackageJson(workspaceRoot),
    getPnpmWorkspaceDefine(path.resolve(workspaceRoot, "pnpm-workspace.yaml")),
  ]);
  rootPkg.packageRoot = workspaceRoot;
  for (let i = 0; i < packagesGlob.length; i++) {
    if (!packagesGlob[i].endsWith("/")) packagesGlob[i] = packagesGlob[i] + "/package.json";
  }
  const packageFile = await glob(packagesGlob, {
    root: workspaceRoot,
    cwd: workspaceRoot,
    nodir: true,
    absolute: true,
  });
  const { success, fail } = await allSettled(
    packageFile.map(async (filename) => {
      const dir = path.resolve(filename, "..");
      const text = await fs.readFile(filename, "utf-8");

      return { ...JSON.parse(text), packageRoot: dir };
    })
  );

  return { success, fail, rootPkg };
}
/**
 *
 * @param {Promise<any>[]} list
 */
function allSettled(list) {
  return Promise.allSettled(list).then((res) => {
    const success = [];
    const fail = [];
    for (const item of res) {
      if (item.status === "fulfilled") success.push(item.value);
      else fail.push(item.reason);
    }
    return { success, fail };
  });
}
/**
 * @param {string} pkgDir
 */
async function readPackageJson(pkgDir) {
  const filename = path.resolve(pkgDir, "package.json");
  const text = await fs.readFile(filename, "utf-8");
  return JSON.parse(text);
}
/**
 * @param {string} file
 * @returns {Promise<string[]>}
 */
async function getPnpmWorkspaceDefine(file) {
  const text = await fs.readFile(file, "utf-8");
  try {
    const obj = yaml.parse(text);
    if (obj.packages instanceof Array) return obj.packages;
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * @typedef {Object} WorkspaceTagOpts
 * @property {boolean} includeRoot
 * @property {string} rootPrefix 默认为 'v'
 * @property {boolean} rooNamePrefix
 * @property {string} subPrefix
 */
/**
 * @param {string} workspaceRoot
 * @param {Partial<WorkspaceTagOpts>} options
 * @returns {Promise<string[]>}
 * @remarks 获取 Pnpm 工作区子包, 返回 标签到包的映射
 */
export async function getWorkspaceTags(workspaceRoot, options = {}) {
  const { includeRoot, subPrefix = "", rooNamePrefix = false, rootPrefix = rooNamePrefix ? "" : "v" } = options;
  /** @type {PackageJson[]} */
  let pkgInfoList;

  const { success, fail, rootPkg } = await findPnpmWorkspacePkgs(workspaceRoot);
  if (fail.length) console.log(`查找失败: ${fail.join(", ")}`);
  pkgInfoList = success;

  if (pkgInfoList.length === 0) {
    console.log("没有搜索到包, 跳过");
    return [];
  }

  /** @type {string[]} */
  const tags = [];
  for (const pkg of pkgInfoList) tags.push(pasePkgTags(pkg, subPrefix, true));
  if (includeRoot) {
    tags.push(pasePkgTags(rootPkg, rootPrefix, rooNamePrefix));
  }

  return tags;
}
/**
 * @param {PackageJson} pkg 描述
 * @param {string} prefix
 * @param {boolean} namePrefix
 */
function pasePkgTags(pkg, prefix, namePrefix) {
  const dir = pkg.packageRoot;
  if (namePrefix) {
    let name = pkg.name;
    if (typeof name !== "string") {
      name = dir.slice(dir.lastIndexOf(path.sep));
    }
    if (name.startsWith("@")) name = name.slice(name.indexOf("/") + 1);
    if (name === "") throw new Error(dir + ": 包名无效");
    prefix = name + "/" + prefix;
  }
  if (pkg.version) return prefix + pkg.version;
  else throw new Error("version 字段不存在");
}
