const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // v2 installed
const dotenv = require("dotenv");
const cosineSimilarity = require("cosine-similarity");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta";

// -------------------------------
// 1. Load knowledge base
// -------------------------------
const knowledgeBase = JSON.parse(fs.readFileSync("data/knowledge.json", "utf-8"));

// -------------------------------
// 2. Function: Get embeddings from Gemini
// -------------------------------
async function getEmbedding(text) {
  const res = await fetch(`${GEMINI_URL}/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/embedding-001",
      content: { parts: [{ text }] }
    })
  });

  const data = await res.json();
  return data.embedding?.values || [];
}

// -------------------------------
// 3. Precompute embeddings for KB
// -------------------------------
let embeddedKB = [];
async function embedKnowledgeBase() {
  for (const doc of knowledgeBase) {
    const embedding = await getEmbedding(doc.text);
    embeddedKB.push({ ...doc, embedding });
  }
  console.log("✅ Knowledge base embeddings ready");
}

// -------------------------------
// 4. Find most relevant docs
// -------------------------------
function retrieveContext(queryEmbedding, topK = 2) {
  const similarities = embeddedKB.map(doc => {
    const score = cosineSimilarity(queryEmbedding, doc.embedding);
    return { ...doc, score };
  });

  return similarities.sort((a, b) => b.score - a.score).slice(0, topK);
}

// -------------------------------
// 5. Chatbot endpoint
// -------------------------------
app.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;

    const queryEmbedding = await getEmbedding(query);
    const retrievedDocs = retrieveContext(queryEmbedding, 2);
    const context = retrievedDocs.map(d => d.text).join("\n");

    const body = {
      contents: [
        { role: "user", parts: [{ text: `Context:\n${context}\n\nQuestion: ${query}` }] }
      ]
    };

    const response = await fetch(`${GEMINI_URL}/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn’t generate an answer.";

    res.json({ answer, retrievedDocs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// -------------------------------
// 6. Start server
// -------------------------------
app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  await embedKnowledgeBase();
});
