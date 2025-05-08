
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle specific routes (not using wildcard with * to avoid path-to-regexp issues)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Additional routes if needed
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
