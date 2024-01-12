// @ts-check
const env = process.env;
const GITHUB_TOKEN = env.GITHUB_TOKEN;
const [GITHUB_OWNER, GITHUB_REPO] = env.GITHUB_REPOSITORY?.split("/") ?? [];

/**
 * @param {string[]} tags
 * @returns {Promise<string[]>}
 */
export async function filterNoExistTags(tags) {
  if (tags.length === 0) return [];
  const allTags = new Set(await githubRepo.listGitHubTags());
  return tags.filter((tag) => !allTags.has(tag));
}

class GithubRepo {
  /**
   * @param {string} repo
   * @param {string} owner
   * @param {string|void} token
   */
  constructor(owner, repo, token) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;

    this.#headers = new Headers({ accept: "application/vnd.github.v3+json" });
    if (token) {
      this.#headers.append("authorization", "token " + token);
    }
  }
  #headers;
  async listGitHubTags(tagPrefix = "") {
    const { owner, repo } = this;
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/matching-refs/tags/${tagPrefix}`, {
      headers: this.#headers,
    });
    if (resp.ok) {
      /** @type {any[]} */
      const data = await resp.json();

      return data.map((item) => item.ref.slice(10));
    } else {
      throw new Error(resp.statusText);
    }
  }
}
const githubRepo = new GithubRepo(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN);
