const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: ''
  },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source',
    required: true
  },
  category: {
    type: String,
    enum: ['news', 'reviews', 'features', 'motorsport', 'technology', 'electric'],
    default: 'news'
  },
  tags: [{
    type: String,
    trim: true
  }],
  publishedAt: {
    type: Date,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ source: 1, publishedAt: -1 });
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ url: 1 }, { unique: true });

// Text index for search functionality
articleSchema.index({
  title: 'text',
  summary: 'text',
  content: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Article', articleSchema);