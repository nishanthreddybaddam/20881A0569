const express = require('express');
const axios = require('axios');
const app = express();

// GET /numbers endpoint
app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'URLs are required' });
  }

  const urlArray = Array.isArray(urls) ? urls : [urls];
  const promises = [];

  // Send requests to each URL concurrently
  for (const url of urlArray) {
    promises.push(
      axios.get(url, { timeout: 500 })
        .then(response => response.data.numbers)
        .catch(error => {
          console.error(`Error fetching ${url}:`, error.message);
          return [];
        })
    );
  }

  try {
    const results = await Promise.all(promises);
    const mergedNumbers = Array.from(new Set(results.flat())).sort((a, b) => a - b);

    res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const port = process.env.PORT || 8008;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
