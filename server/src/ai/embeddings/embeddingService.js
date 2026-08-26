import { pipeline } from "@xenova/transformers";

let extractor = null;

/**
 * Load embedding model once and reuse it.
 */
const getExtractor = async () => {
  if (!extractor) {
    console.log("Loading embedding model...");

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded.");
  }

  return extractor;
};

/**
 * Generate embedding for a text.
 *
 * Returns:
 * 384-dimensional normalized vector
 */
const generateEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Text is required for embedding generation.");
  }

  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};

export {
  generateEmbedding,
};
