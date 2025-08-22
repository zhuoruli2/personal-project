// In-memory storage for articles and sources
class MemoryStorage {
  constructor() {
    this.articles = [];
    this.sources = [];
    this.nextArticleId = 1;
    this.nextSourceId = 1;
  }

  // Article methods
  addArticle(articleData) {
    // Check for duplicates by URL first
    const existingArticle = this.articles.find(a => a.url === articleData.url);
    if (existingArticle) {
      // Allow refresh if article is more than 2 hours old
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (new Date(existingArticle.scrapedAt) < twoHoursAgo) {
        // Update existing article with new data
        Object.assign(existingArticle, {
          ...articleData,
          id: existingArticle.id, // Keep original ID
          createdAt: existingArticle.createdAt, // Keep original creation time
          scrapedAt: new Date() // Update scrape time
        });
        return { article: existingArticle, isNew: false, wasUpdated: true };
      }
      return { article: existingArticle, isNew: false, wasUpdated: false };
    }
    
    // Create new article
    const article = {
      id: this.nextArticleId++,
      ...articleData,
      createdAt: new Date(),
      scrapedAt: new Date()
    };
    
    this.articles.push(article);
    this.cleanOldArticles();
    return { article, isNew: true, wasUpdated: false };
  }

  getArticles(options = {}) {
    const { page = 1, limit = 20, category, source, search } = options;
    
    let filteredArticles = [...this.articles];
    
    // Filter by category
    if (category) {
      filteredArticles = filteredArticles.filter(a => a.category === category);
    }
    
    // Filter by source
    if (source) {
      filteredArticles = filteredArticles.filter(a => a.sourceId === parseInt(source));
    }
    
    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.summary.toLowerCase().includes(searchLower) ||
        (a.content && a.content.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by published date (newest first)
    filteredArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
    
    return {
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total: filteredArticles.length,
        pages: Math.ceil(filteredArticles.length / limit)
      }
    };
  }

  getArticleById(id) {
    return this.articles.find(a => a.id === parseInt(id));
  }

  // Source methods
  addSource(sourceData) {
    const source = {
      id: this.nextSourceId++,
      ...sourceData,
      createdAt: new Date(),
      lastScraped: null,
      scrapeCount: 0,
      errorCount: 0
    };
    
    this.sources.push(source);
    return source;
  }

  getSources() {
    return this.sources.filter(s => s.isActive);
  }

  getSourceById(id) {
    return this.sources.find(s => s.id === parseInt(id));
  }

  updateSource(id, updates) {
    const source = this.getSourceById(id);
    if (source) {
      Object.assign(source, updates);
      return source;
    }
    return null;
  }

  // Utility methods
  cleanOldArticles() {
    const beforeCount = this.articles.length;
    
    // Keep articles from the last 3 days for now to filter out old content
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    this.articles = this.articles.filter(article => {
      const publishedDate = new Date(article.publishedAt);
      const isRecent = publishedDate >= threeDaysAgo;
      
      // Log articles that are being filtered out for debugging
      if (!isRecent) {
        console.log(`Filtering out old article: "${article.title}" (${publishedDate.toDateString()}) from ${article.source?.displayName}`);
      }
      
      return isRecent;
    });
    
    const afterCount = this.articles.length;
    const removedCount = beforeCount - afterCount;
    
    if (removedCount > 0) {
      console.log(`Cleaned ${removedCount} old articles. Current articles count: ${afterCount}`);
    } else {
      console.log(`Current articles count: ${afterCount}`);
    }
  }

  getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayArticles = this.articles.filter(a => {
      const publishedDate = new Date(a.publishedAt);
      return publishedDate >= today;
    }).length;

    const yesterdayArticles = this.articles.filter(a => {
      const publishedDate = new Date(a.publishedAt);
      return publishedDate >= yesterday && publishedDate < today;
    }).length;

    return {
      totalArticles: this.articles.length,
      todayArticles,
      yesterdayArticles,
      totalSources: this.sources.length,
      activeSources: this.sources.filter(s => s.isActive).length
    };
  }

  clearAll() {
    this.articles = [];
    // Don't clear sources as they're needed for scraping
    this.nextArticleId = 1;
  }
  
  clearArticles() {
    this.articles = [];
    this.nextArticleId = 1;
  }
}

// Create singleton instance
const memoryStorage = new MemoryStorage();

module.exports = memoryStorage;