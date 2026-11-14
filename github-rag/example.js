import { createHash } from "node:crypto";

const createChunkId = (content) => {
  console.log(content);
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
};
