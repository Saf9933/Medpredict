/**
 * RAG (Retrieval-Augmented Generation) utilities for textbook search.
 * BM25 sparse retrieval + dense vector retrieval via Reciprocal Rank Fusion.
 */

// ─── Text Chunking ───────────────────────────────────────────────
function chunkText(text, chunkSize = 200, overlap = 50) {
  // Split by form-feed (page breaks) first
  const pages = text.split("\f");
  const chunks = [];
  let id = 0;

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageText = pages[pageIdx].trim();
    if (!pageText) continue;

    // Split page into paragraphs, then into words
    const paragraphs = pageText.split(/\n{2,}/);
    let words = [];
    for (const para of paragraphs) {
      const w = para.split(/\s+/).filter(Boolean);
      words = words.concat(w);
    }

    // Sliding window over words
    for (let start = 0; start < words.length; start += chunkSize - overlap) {
      const slice = words.slice(start, start + chunkSize);
      if (slice.length === 0) break;
      chunks.push({
        id: id++,
        text: slice.join(" "),
        page: pageIdx + 1,
      });
      if (start + chunkSize >= words.length) break;
    }
  }

  return chunks;
}

// ─── BM25 Index ──────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","shall","should","may","might","must","can",
  "could","of","in","to","for","with","on","at","by","from","as","into","through",
  "during","before","after","above","below","between","out","off","over","under",
  "again","further","then","once","here","there","when","where","why","how","all",
  "both","each","few","more","most","other","some","such","no","nor","not","only",
  "own","same","so","than","too","very","and","but","or","if","it","its","this",
  "that","these","those","i","me","my","we","our","you","your","he","him","his",
  "she","her","they","them","their","what","which","who","whom",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function buildBM25Index(chunks) {
  const k1 = 1.5;
  const b = 0.75;
  const N = chunks.length;

  // Compute term frequencies per document
  const docs = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    const tf = {};
    for (const t of tokens) {
      tf[t] = (tf[t] || 0) + 1;
    }
    return { tf, len: tokens.length };
  });

  // Average document length
  const avgdl = docs.reduce((sum, d) => sum + d.len, 0) / (N || 1);

  // Document frequency (how many docs contain each term)
  const df = {};
  for (const doc of docs) {
    for (const term of Object.keys(doc.tf)) {
      df[term] = (df[term] || 0) + 1;
    }
  }

  // IDF
  const idf = {};
  for (const [term, freq] of Object.entries(df)) {
    idf[term] = Math.log((N - freq + 0.5) / (freq + 0.5) + 1);
  }

  return { docs, idf, avgdl, k1, b, N };
}

function searchBM25(index, query, topK = 5) {
  const { docs, idf, avgdl, k1, b } = index;
  const queryTokens = tokenize(query);

  const scores = docs.map((doc, i) => {
    let score = 0;
    for (const qt of queryTokens) {
      const tf = doc.tf[qt] || 0;
      const termIdf = idf[qt] || 0;
      const num = tf * (k1 + 1);
      const denom = tf + k1 * (1 - b + b * (doc.len / avgdl));
      score += termIdf * (num / denom);
    }
    return { index: i, score };
  });

  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ─── Dense Embedding (Hybrid RAG) ────────────────────────────────

let _pipelinePromise = null;

/**
 * Lazy singleton — loads all-MiniLM-L6-v2 on first call.
 * Returns a Xenova/transformers feature-extraction pipeline.
 */
async function getEmbeddingPipeline() {
  if (!_pipelinePromise) {
    _pipelinePromise = (async () => {
      try {
        const { pipeline } = await import("@xenova/transformers");
        return await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      } catch (err) {
        console.warn("Embedding pipeline failed to load:", err.message);
        _pipelinePromise = null;
        return null;
      }
    })();
  }
  return _pipelinePromise;
}

/** Embed a single text string → Float32Array (384-dim). */
async function embedText(text) {
  const pipe = await getEmbeddingPipeline();
  if (!pipe) return null;
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return output.data; // Float32Array
}

/** Embed an array of chunk objects → array of Float32Arrays. */
async function embedChunks(chunks) {
  const pipe = await getEmbeddingPipeline();
  if (!pipe) return null;
  const embeddings = [];
  // Process in batches of 16 for memory efficiency
  const batchSize = 16;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    for (const chunk of batch) {
      const output = await pipe(chunk.text, { pooling: "mean", normalize: true });
      embeddings.push(output.data);
    }
  }
  return embeddings;
}

/** Cosine similarity between two normalized vectors (dot product). */
function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/** Dense vector search — returns ranked list [{index, score}]. */
function searchDense(embeddings, queryEmbedding, topK = 5) {
  const scores = embeddings.map((emb, i) => ({
    index: i,
    score: cosineSimilarity(emb, queryEmbedding),
  }));
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Reciprocal Rank Fusion — merges multiple ranked lists into one.
 * @param {Array<Array<{index, score}>>} rankedLists
 * @param {number} k — RRF constant (default 60)
 */
function reciprocalRankFusion(rankedLists, k = 60) {
  const scores = {};
  for (const list of rankedLists) {
    for (let rank = 0; rank < list.length; rank++) {
      const { index } = list[rank];
      scores[index] = (scores[index] || 0) + 1 / (k + rank + 1);
    }
  }
  return Object.entries(scores)
    .map(([index, score]) => ({ index: Number(index), score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Hybrid search — combines BM25 + dense retrieval via RRF.
 * Falls back to BM25-only if embeddings aren't ready yet.
 * @returns {{ results: Array, method: string }}
 */
async function searchHybrid(textbookData, query, topK = 5) {
  const { index, embeddings, chunks } = textbookData;

  // Always run BM25
  const bm25Hits = searchBM25(index, query, topK * 2);

  // If embeddings are available, run dense search too
  if (embeddings && embeddings.length > 0) {
    const queryEmb = await embedText(query);
    if (queryEmb) {
      const denseHits = searchDense(embeddings, queryEmb, topK * 2);
      const fused = reciprocalRankFusion([bm25Hits, denseHits]);
      return {
        results: fused.slice(0, topK),
        method: "hybrid",
      };
    }
  }

  // Fallback: BM25-only
  return {
    results: bm25Hits.slice(0, topK),
    method: "bm25",
  };
}

// ─── In-memory Textbook Store (auto-expiry: 1 hour) ─────────────
const textbookStore = new Map();
const EXPIRY_MS = 60 * 60 * 1000;

function storeTextbook(fileId, data) {
  textbookStore.set(fileId, { ...data, createdAt: Date.now() });
  // Schedule cleanup
  setTimeout(() => {
    textbookStore.delete(fileId);
  }, EXPIRY_MS);
}

function getTextbook(fileId) {
  const entry = textbookStore.get(fileId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > EXPIRY_MS) {
    textbookStore.delete(fileId);
    return null;
  }
  return entry;
}

module.exports = {
  chunkText,
  buildBM25Index,
  searchBM25,
  storeTextbook,
  getTextbook,
  tokenize,
  embedChunks,
  searchHybrid,
};
