import { Octokit } from "@octokit/rest";
const env = process.env;
const GITHUB_TOKEN = env.GITHUB_TOKEN;
const [GITHUB_OWNER, GITHUB_REPO] = env.GITHUB_REPOSITORY?.split("/") ?? [];
const info = { repo: GITHUB_REPO, owner: GITHUB_OWNER, octokit: new Octokit({ auth: GITHUB_TOKEN }) };
/**
 * @param {string} tag
 * @returns {Promise<boolean>}
 * @remarks 检测 标签是否存在
 */
async function tagExist(tag) {
  const { repo, octokit, owner } = info;
  return octokit.git.getRef({ owner, repo, ref: "tags/" + tag }).then(
    () => true,
    (e) => {
      if (e?.status === 404) return false;
      else throw e;
    }
  );
}
/**
 * @public
 * @remark 获取当前仓库的所有标签
 */
async function listTags(matchPrix = "") {
  const { owner, repo, octokit } = info;
  const { data } = await octokit.git.listMatchingRefs({ owner, repo, ref: "tags/" + matchPrix });
  return data.map((item) => item.ref.slice(10)); //  refs/tags/
}
/**
 * @param {string[]} tags
 * @returns {string[]}
 */
export async function filterNoExistTags(tags) {
  if (tags.length === 1) {
    return tagExist(tags[0]).then((exist) => (exist ? tags : []));
  } else if (tags.length === 0) return [];
  const allTags = new Set(await listTags());

  return tags.filter((tag) => !allTags.has(tag));
}
