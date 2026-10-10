const fs = require('fs');
const path = require('path');
const { extractTextFromFolder } = require('./pdfHelper');

// Cache file for embeddings so we don't hit the API on every restart
const CACHE_FILE = path.join(__dirname, 'embeddings_cache.json');

// In-memory store
let vectorStore = [];
let embeddingModel = null;

// Helper: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper: Split text into chunks
function chunkText(text, chunkSize = 1500, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

/**
 * Initialize RAG: Extract PDF texts, chunk them, and create embeddings.
 */
async function initializeRAG(pdfDirPath, genAI) {
  embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  
  // Try loading from cache first
  if (fs.existsSync(CACHE_FILE)) {
    console.log("Loading RAG embeddings from cache...");
    try {
      const rawCache = fs.readFileSync(CACHE_FILE, 'utf-8');
      vectorStore = JSON.parse(rawCache);
      if (vectorStore.length > 0) {
        console.log(`Loaded ${vectorStore.length} chunks from cache.`);
        return;
      } else {
        console.log("Cache is empty, regenerating embeddings...");
      }
    } catch (e) {
      console.log("Cache reading failed, regenerating embeddings...");
    }
  }

  console.log("Extracting texts from PDFs...");
  const { text, count } = await extractTextFromFolder(pdfDirPath);
  
  if (count === 0 || text.trim().length === 0) {
    console.log("No PDF text found. Skipping RAG init.");
    return;
  }

  console.log(`Chunking text... (Total length: ${text.length} chars)`);
  const chunks = chunkText(text);
  console.log(`Generated ${chunks.length} chunks. Creating embeddings (this may take a moment)...`);

  // Create embeddings in batches to avoid rate limits and quota exhaustion
  const BATCH_SIZE = 50;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);
    try {
      const requests = batchChunks.map(chunk => ({ content: { parts: [{ text: chunk }] } }));
      const result = await embeddingModel.batchEmbedContents({ requests });
      
      for (let j = 0; j < result.embeddings.length; j++) {
        vectorStore.push({ text: batchChunks[j], embedding: result.embeddings[j].values });
      }
      
      process.stdout.write(`Embedded ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks...\r`);
      
      // Small delay to prevent 429 Too Many Requests
      await new Promise(res => setTimeout(res, 500));
    } catch (error) {
      console.error(`\nFailed to embed batch ${i / BATCH_SIZE}: ${error.message}`);
    }
  }

  console.log(`\nFinished creating embeddings. Saving to cache...`);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(vectorStore));
}

/**
 * Retrieve the most relevant chunks for a given query
 */
async function retrieveRelevantContext(query, topK = 3) {
  if (vectorStore.length === 0 || !embeddingModel) return "";

  try {
    const result = await embeddingModel.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // Calculate similarity for all chunks
    const scoredChunks = vectorStore.map(item => ({
      text: item.text,
      score: cosineSimilarity(queryEmbedding, item.embedding)
    }));

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return topK chunks joined
    const topChunks = scoredChunks.slice(0, topK).map(c => c.text);
    return topChunks.join("\n\n...[SNIP]...\n\n");
  } catch (error) {
    console.error(`Retrieval error: ${error.message}`);
    return "";
  }
}

module.exports = {
  initializeRAG,
  retrieveRelevantContext
};
