import { createHash } from "node:crypto";
export const createChunkId = (content: string) => {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
};
