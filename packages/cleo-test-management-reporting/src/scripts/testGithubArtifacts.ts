import { GithubArtifactService } from "../services/githubArtifactService.js";
import { configAccess } from "../services/configAccessService.js";

async function main(): Promise<void> {
  const github = configAccess.getGithubConfig();

  const service = new GithubArtifactService({
    ...github,
    token: process.env.GITHUB_TOKEN ?? "",
  });

  const artifactPaths = await service.fetchRunArtifacts(33520512064);

  console.log(artifactPaths);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
