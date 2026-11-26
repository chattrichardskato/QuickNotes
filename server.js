// server.js
// Express server providing a REST API for notes.

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'notes.json');

// Middleware to parse JSON bodies and serve static frontend files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Data Helpers ---

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function loadNotes() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
}

// --- API Routes ---

// GET all notes
app.get('/api/notes', (req, res) => {
  res.json(loadNotes());
});

// POST a new note
app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Note text is required.' });
  }
  const notes = loadNotes();
  const note = {
    id: Date.now().toString(),
    text: text.trim(),
    createdAt: new Date().toISOString()
  };
  notes.push(note);
  saveNotes(notes);
  res.status(201).json(note);
});

// DELETE a note by id
app.delete('/api/notes/:id', (req, res) => {
  const notes = loadNotes();
  const index = notes.findIndex(n => n.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found.' });
  }
  const [removed] = notes.splice(index, 1);
  saveNotes(notes);
  res.json(removed);
});

// Start server
app.listen(PORT, () => {
  console.log(`QuickNotes running at http://localhost:${PORT}`);
});