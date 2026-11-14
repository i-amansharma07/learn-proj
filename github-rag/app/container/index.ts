import { EmbedChunks } from "@/pipelines/embedding/embedding.service";
import { RepositoryIngestion } from "@/pipelines/github-fetch/repository-ingestion.service";

const RepositoryIngestionService = new RepositoryIngestion();
const EmbedChunksService = new EmbedChunks();

export { RepositoryIngestionService, EmbedChunksService };

//assign chunker as per file
import type { RepositoryFile } from "@/types/repository";
import type { Chunker } from "@/types/chunker";

import { TypeScriptChunker } from "@/pipelines/chunking/repository-chunking.service";
import { MarkdownChunker } from "@/pipelines/chunking/markdown-chunking.service";
import { FallbackChunker } from "@/pipelines/chunking/fallback-chunking.service";

export function getChunker(file: RepositoryFile): Chunker {
  switch (file.language) {
    case "typescript":
      return new TypeScriptChunker(file);
    case "javascript":
      return new TypeScriptChunker(file);

    case "markdown":
      return new MarkdownChunker(file);

    default:
      return new FallbackChunker(file);
  }
}
