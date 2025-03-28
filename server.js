const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Send all other requests to the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});