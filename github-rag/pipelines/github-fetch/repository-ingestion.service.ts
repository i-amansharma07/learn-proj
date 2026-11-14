import {
  getFileContent,
  getRepository,
  getRepositoryTree,
} from "@/lib/github/github-client";

import { parseGithubUrl } from "@/lib/github/github-url";
import { shouldIncludeFile } from "@/utils/file-fliter";
import { detectLanguage } from "@/utils/language";

import type { RepositoryFile, RepositryInfo } from "@/types/repository";

export class RepositoryIngestion {
  async ingest(repositoryUrl: string): Promise<{
    repository: RepositryInfo;
    files: RepositoryFile[];
  }> {
    const { owner, repo } = parseGithubUrl(repositoryUrl);

    //1. get repo metadata
    const repository = await getRepository(owner, repo);

    const default_branch = repository.default_branch;


    //2. Get repo tree
    const { tree, truncated } = await getRepositoryTree(
      owner,
      repo,
      default_branch,
    );


    if (truncated) {
      throw new Error(
        "Repository tree is too large and was truncated by GitHub",
      );
    }

    //3. only keep files
    const files = tree.filter(
      (item) => item.type === "blob" && shouldIncludeFile(item.path),
    );


    //4. fetch file contents in loop
    const repositoryFiles: RepositoryFile[] = [];

    for (const file of files) {
      if (!file.size) continue;

      const result = await getFileContent(owner, repo, file.sha);

      repositoryFiles.push({
        path: file.path,
        content: result.content,
        size: result.size,
        language: detectLanguage(file.path),
      });
    }

    return {
      repository: {
        owner,
        name: repo,
        defaultBranch: default_branch,
      },
      files: repositoryFiles,
    };
  }
}
