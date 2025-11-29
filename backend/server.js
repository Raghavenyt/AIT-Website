const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "public")));

// In-memory data store (demo)
let tools = [
  {
    id: 1,
    name: "ChatGPT",
    category: "Writing & Chat",
    website: "https://chat.openai.com",
    description: "Conversational AI assistant for writing, coding, and learning."
  },
    {
      id: 2,
      name: "Perplexity",
      category:"Productivity",
      website:"https://www.perplexity.ai",
      description:"Acts similar like wikipedia but with intelligence."
    },
  {
    id: 3,
    name: "Whisper",
    category: "Speech to Text",
    website: "https://openai.com/research/whisper",
    description: "Automatic speech recognition system for transcription."
  },
   {
    id: 4,
    name: "Gemini",
    category: "Writing & Chat",
    website: "https://gemini.google.com/app",
    description: "Summa Iru Da."
  }
];

let nextId = 4;

// API routes
app.get("/api/tools", (req, res) => {
  const { q, category } = req.query;
  let result = [...tools];

  if (q) {
    const query = q.toLowerCase();
    result = result.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }

  if (category && category !== "All") {
    result = result.filter(t => t.category === category);
  }

  res.json(result);
});

app.post("/api/tools", (req, res) => {
  const { name, category, website, description } = req.body;
  if (!name || !category || !website || !description) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const newTool = { id: nextId++, name, category, website, description };
  tools.push(newTool);
  res.status(201).json(newTool);
});

// Simple delete endpoint (for demo)
app.delete("/api/tools/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = tools.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const removed = tools.splice(idx, 1);
  res.json({ removed: removed[0] });
});

// Fallback for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
