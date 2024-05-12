require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Body parsing middleware

// In-memory database to store original and short URLs
const urlDatabase = {};
let nextShortUrlId = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST endpoint for creating short URLs
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate URL format
  const urlRegex = /^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]+(\/[\w-./?=&#%+]*)?$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract hostname from the URL
  const urlObj = new URL(originalUrl);
  const host = urlObj.hostname;

  // Verify if the URL is valid
  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: 'sinvalid url' });
    } else {
      // Generate short URL
      const shortUrl = nextShortUrlId++;
      urlDatabase[shortUrl] = originalUrl;
      return res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// Redirect endpoint for short URLs
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'invalid short url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
