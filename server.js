const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3500;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ submissions: [] }, null, 2), 'utf8');
  }
}

function readDatabase() {
  ensureDatabase();

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.submissions) ? data : { submissions: [] };
  } catch (error) {
    console.error('Database read failed:', error);
    return { submissions: [] };
  }
}

function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.post('/api/submit', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!name) {
    return res.status(400).json({ success: false, field: 'name', message: 'Name is required.' });
  }

  if (!email) {
    return res.status(400).json({ success: false, field: 'email', message: 'Email is required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, field: 'email', message: 'Please enter a valid email address.' });
  }

  if (!message) {
    return res.status(400).json({ success: false, field: 'message', message: 'Message is required.' });
  }

  const db = readDatabase();
  db.submissions.unshift({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  });

  writeDatabase(db);

  res.status(201).json({ success: true, message: 'Form Submitted Successfully' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

ensureDatabase();

app.listen(PORT, () => {
  console.log(`She Can Foundation app running at http://localhost:${PORT}`);
});
