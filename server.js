const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3500;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin Passcode
const ADMIN_PASSCODE = 'admin123';

// Initialize JSON database if it doesn't exist
function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { submissions: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    console.log('Database initialized successfully.');
  }
}

// Read database helper
function readDb() {
  try {
    initDb();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { submissions: [] };
  }
}

// Write database helper
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

// Helper to authenticate admin requests
function authenticateAdmin(req, res, next) {
  const passcode = req.headers['x-admin-passcode'];
  if (passcode === ADMIN_PASSCODE) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized. Invalid passcode.' });
  }
}

// --- API ROUTES ---

// Submit contact form
app.post('/api/submit', (req, res) => {
  const { name, email, message } = req.body;

  // Server-side validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, field: 'name', message: 'Name is required.' });
  }
  
  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, field: 'email', message: 'Email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, field: 'email', message: 'Please enter a valid email address.' });
  }

  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, field: 'message', message: 'Message is required.' });
  }

  // Create submission object
  const newSubmission = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  // Add to database
  const db = readDb();
  db.submissions.unshift(newSubmission); // Add to the top of the list

  if (writeDb(db)) {
    res.status(201).json({
      success: true,
      message: 'Form Submitted Successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to save submission. Please try again later.'
    });
  }
});

// Admin verification
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE) {
    res.json({ success: true, message: 'Authentication successful.' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin passcode.' });
  }
});

// Get all submissions (Admin only)
app.get('/api/admin/submissions', authenticateAdmin, (req, res) => {
  const db = readDb();
  res.json({ success: true, submissions: db.submissions });
});

// Delete a submission (Admin only)
app.delete('/api/admin/submissions/:id', authenticateAdmin, (req, res) => {
  const idToDelete = req.params.id;
  const db = readDb();
  const initialLength = db.submissions.length;
  
  db.submissions = db.submissions.filter(sub => sub.id !== idToDelete);

  if (db.submissions.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Submission not found.' });
  }

  if (writeDb(db)) {
    res.json({ success: true, message: 'Submission deleted successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update database.' });
  }
});

// Fallback index.html router for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
initDb();
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
  console.log(`==================================================`);
});
