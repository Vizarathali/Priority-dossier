const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DISK_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DISK_DIR, 'responses.json');
const CATEGORIES_FILE = path.join(__dirname, 'public', 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- helpers ----
function loadResponses() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return []; }
}
function saveResponses(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}
function caseNameMap() {
  const { categories } = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  const map = {};
  categories.forEach(cat => cat.cases.forEach(c => { map[c.id] = { name: c.name, category: cat.name }; }));
  return map;
}

// ---- API ----

// Save a person's submission. Overwrites any earlier submission with the same name.
app.post('/api/responses', (req, res) => {
  const { name, picks } = req.body || {};
  if (!name || !Array.isArray(picks) || picks.length < 1) {
    return res.status(400).json({ error: 'name and picks[] are required' });
  }
  const list = loadResponses().filter(r => r.name.toLowerCase() !== String(name).toLowerCase());
  list.push({ name: String(name).trim(), picks, ts: Date.now() });
  saveResponses(list);
  res.json({ ok: true });
});

// Tally of picks across all submissions, for the in-app results screen.
app.get('/api/results', (req, res) => {
  const list = loadResponses();
  const tally = {};
  list.forEach(r => (r.picks || []).forEach(id => { tally[id] = (tally[id] || 0) + 1; }));
  res.json({ total: list.length, tally });
});

// CSV export for the facilitator: one row per person.
app.get('/api/export.csv', (req, res) => {
  const list = loadResponses();
  const names = caseNameMap();
  const maxPicks = list.reduce((m, r) => Math.max(m, (r.picks || []).length), 0);
  const header = ['Name', 'Submitted At', ...Array.from({ length: maxPicks }, (_, i) => `Pick ${i + 1}`)];
  const rows = list.map(r => {
    const picks = (r.picks || []).map(id => (names[id] ? names[id].name : id));
    while (picks.length < maxPicks) picks.push('');
    return [r.name, new Date(r.ts).toISOString(), ...picks];
  });
  const esc = v => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map(row => row.map(esc).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="priority_dossier_responses.csv"');
  res.send(csv);
});

app.listen(PORT, () => console.log(`Priority dossier listening on port ${PORT}`));
