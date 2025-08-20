const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  baseUrl: {
    type: String,
    required: true
  },
  rssUrl: {
    type: String,
    default: ''
  },
  logoUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  scrapeConfig: {
    selectors: {
      title: String,
      summary: String,
      content: String,
      author: String,
      publishedAt: String,
      imageUrl: String
    },
    dateFormat: {
      type: String,
      default: 'ISO'
    },
    updateFrequency: {
      type: Number,
      default: 3600000 // 1 hour in milliseconds
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastScraped: {
    type: Date,
    default: null
  },
  scrapeCount: {
    type: Number,
    default: 0
  },
  errorCount: {
    type: Number,
    default: 0
  },
  lastError: {
    message: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Indexes
sourceSchema.index({ name: 1 }, { unique: true });
sourceSchema.index({ isActive: 1 });
sourceSchema.index({ lastScraped: 1 });

module.exports = mongoose.model('Source', sourceSchema);