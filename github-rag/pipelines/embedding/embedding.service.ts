
import { DocumentChunk } from "@/types/chunk";
import { EmbeddedChunk } from "@/types/embedding";
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

export class EmbedChunks {
  private count = 0;

  private extractor: FeatureExtractionPipeline | null = null;

  private async getExtractor(): Promise<FeatureExtractionPipeline> {
    if (!this.extractor) {
      console.log("Loading embedding model...");

      this.extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
    }

    return this.extractor;
  }

  private async fetchEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Embedding request count: ${++this.count}`);

    const extractor = await this.getExtractor();

    const output = await extractor(texts, {
      pooling: "mean",
      normalize: true,
    });

    return output.tolist() as number[][];
  }

  async embedChunks(
    chunks: DocumentChunk[],
    batchSize: number = 32,
  ): Promise<EmbeddedChunk[]> {
    const results: EmbeddedChunk[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map((c) => c.content);

      console.log(
        `Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} (${texts.length} chunks)`,
      );

      const embeddings = await this.fetchEmbeddings(texts);

      for (let j = 0; j < batch.length; j++) {
        results.push({
          chunk: batch[j],
          embedding: embeddings[j],
        });
      }
    }

    this.count = 0;
    return results;
  }
}
