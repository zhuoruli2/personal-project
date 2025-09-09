const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting CarNews Hub Backend...');

// Initialize scraping service and seed data
const scrapeService = require('./utils/scrapeService');
const { seedSources } = require('./utils/seedData');

// Seed default sources and initialize scraping
(async () => {
  console.log('Initializing data sources...');
  await seedSources();
  console.log('Starting news scraping service...');
  await scrapeService.initialize();
})();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/articles', require('./routes/articles'));
app.use('/api/sources', require('./routes/sources'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
