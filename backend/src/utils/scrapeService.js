const cron = require('node-cron');
const memoryStorage = require('../storage/memoryStorage');
const ScraperFactory = require('../scrapers/scraperFactory');

class ScrapeService {
  constructor() {
    this.isRunning = false;
    this.scheduledJobs = new Map();
  }

  // Initialize scraping service
  async initialize() {
    console.log('Initializing scrape service...');
    
    try {
      // Load all active sources
      const sources = memoryStorage.getSources();
      console.log(`Found ${sources.length} active sources`);

      // Schedule scraping for each source
      for (const source of sources) {
        this.scheduleSourceScraping(source);
      }

      // Start immediate scraping for all sources
      await this.scrapeAllSources();
      
      console.log('Scrape service initialized successfully');
    } catch (error) {
      console.error('Error initializing scrape service:', error);
    }
  }

  // Schedule scraping for a specific source
  scheduleSourceScraping(source) {
    try {
      // Cancel existing job if any
      if (this.scheduledJobs.has(source.id.toString())) {
        this.scheduledJobs.get(source.id.toString()).destroy();
      }

      // Create new cron job (every 30 minutes for demo)
      const cronExpression = '*/30 * * * *'; // Every 30 minutes
      const job = cron.schedule(cronExpression, async () => {
        await this.scrapeSource(source);
      }, {
        scheduled: false
      });

      // Start the job
      job.start();
      this.scheduledJobs.set(source.id.toString(), job);
      
      console.log(`Scheduled scraping for ${source.displayName} - every 30 minutes`);
    } catch (error) {
      console.error(`Error scheduling scraping for ${source.displayName}:`, error);
    }
  }

  // Scrape all active sources
  async scrapeAllSources() {
    if (this.isRunning) {
      console.log('Scraping already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting scraping for all sources...');

    try {
      const sources = memoryStorage.getSources();
      
      const scrapePromises = sources.map(source => 
        this.scrapeSource(source).catch(error => {
          console.error(`Error scraping ${source.displayName}:`, error);
          return null;
        })
      );

      await Promise.allSettled(scrapePromises);
      console.log('Completed scraping for all sources');
    } catch (error) {
      console.error('Error in scrapeAllSources:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Scrape a specific source
  async scrapeSource(source) {
    console.log(`Starting scrape for ${source.displayName}...`);
    
    try {
      // Update scrape count and last scraped time
      memoryStorage.updateSource(source.id, {
        scrapeCount: (source.scrapeCount || 0) + 1,
        lastScraped: new Date()
      });

      // Create scraper instance
      const scraper = ScraperFactory.createScraper(source);
      
      // Scrape article list
      const articles = await scraper.scrapeArticleList();
      
      if (!articles || articles.length === 0) {
        console.log(`No articles found for ${source.displayName}`);
        return;
      }

      // Process and save articles
      let savedCount = 0;
      let duplicateCount = 0;

      for (const articleData of articles) {
        try {
          // Add source reference
          articleData.sourceId = source.id;
          articleData.source = {
            id: source.id,
            name: source.name,
            displayName: source.displayName,
            logoUrl: source.logoUrl
          };

          // Scrape full content if needed
          if (!articleData.content) {
            try {
              articleData.content = await scraper.scrapeArticleContent(articleData.url);
            } catch (contentError) {
              console.warn(`Could not scrape full content for ${articleData.url}:`, contentError.message);
              articleData.content = articleData.summary || articleData.title;
            }
          }

          // Add article to memory storage
          console.log(`Adding article: ${articleData.title} - URL: ${articleData.url}`);
          const result = memoryStorage.addArticle(articleData);
          console.log(`Result: isNew=${result.isNew}, wasUpdated=${result.wasUpdated}`);
          
          if (result.isNew) {
            savedCount++;
          } else {
            duplicateCount++;
          }
          
        } catch (articleError) {
          console.error(`Error saving article ${articleData.url}:`, articleError.message);
        }
      }

      // Close browser if using puppeteer
      await scraper.closeBrowser();

      console.log(`Scraping completed for ${source.displayName}: ${savedCount} new articles, ${duplicateCount} duplicates`);

      // Reset error count on successful scrape
      memoryStorage.updateSource(source.id, {
        errorCount: 0,
        lastError: null
      });

    } catch (error) {
      console.error(`Error scraping ${source.displayName}:`, error);
      
      // Update error count and last error
      memoryStorage.updateSource(source.id, {
        errorCount: (source.errorCount || 0) + 1,
        lastError: {
          message: error.message,
          timestamp: new Date()
        }
      });
    }
  }

  // Force refresh all articles (for manual refresh)
  async forceRefresh() {
    console.log('Force refreshing all articles...');
    // Clear existing articles to get fresh content
    memoryStorage.clearArticles();
    
    await this.scrapeAllSources();
  }

  // Stop all scheduled jobs
  stopAll() {
    console.log('Stopping all scraping jobs...');
    
    for (const [sourceId, job] of this.scheduledJobs) {
      job.destroy();
    }
    
    this.scheduledJobs.clear();
    console.log('All scraping jobs stopped');
  }

  // Get scraping status
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledJobs: this.scheduledJobs.size,
      supportedSources: ScraperFactory.getSupportedSources(),
      stats: memoryStorage.getStats()
    };
  }
}

// Create singleton instance
const scrapeService = new ScrapeService();

module.exports = scrapeService;