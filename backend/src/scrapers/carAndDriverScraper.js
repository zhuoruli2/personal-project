const cheerio = require('cheerio');
const xml2js = require('xml2js');
const BaseScraper = require('./baseScraper');

class CarAndDriverScraper extends BaseScraper {
  constructor(source) {
    super(source);
  }

  async scrapeArticleList() {
    try {
      console.log('Scraping Car and Driver article list via RSS...');
      
      // Use RSS feed instead of HTML scraping due to anti-bot protection
      const rssUrl = `${this.source.baseUrl}/rss/all.xml`;
      console.log(`Fetching RSS feed: ${rssUrl}`);
      
      const rssXml = await this.fetchWithAxios(rssUrl);
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(rssXml);
      
      const articles = [];
      
      if (result.rss && result.rss.channel && result.rss.channel[0].item) {
        const items = result.rss.channel[0].item;
        console.log(`Car and Driver - Found ${items.length} RSS items`);
        
        for (const item of items) {
          try {
            // Extract data from RSS item
            const title = item.title ? item.title[0]._ || item.title[0] : '';
            const url = item.link ? item.link[0] : '';
            const description = item.description ? item.description[0]._ || item.description[0] : '';
            const pubDate = item.pubDate ? new Date(item.pubDate[0]) : new Date();
            
            // Filter to only include articles from the last 2 days
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            
            if (pubDate < twoDaysAgo) {
              console.log(`Car and Driver - Skipping old article: ${title.substring(0, 30)}... (${pubDate.toDateString()})`);
              continue;
            }
            
            // Extract image from media:content if available
            let imageUrl = '';
            if (item['media:content'] && item['media:content'][0] && item['media:content'][0].$.url) {
              imageUrl = item['media:content'][0].$.url;
            }
            
            // Clean up description to get summary
            let summary = description;
            if (summary.includes('<![CDATA[')) {
              summary = summary.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
            }
            // Remove HTML tags from summary
            summary = summary.replace(/<[^>]*>/g, '').trim();
            
            if (title && url && this.isValidUrl(url)) {
              const article = {
                title: this.cleanContent(title),
                summary: this.cleanContent(summary) || title.substring(0, 100) + '...',
                url: url,
                imageUrl: imageUrl,
                author: 'Car and Driver', // RSS doesn't usually include author
                publishedAt: pubDate,
                category: this.categorizeArticle(title, summary)
              };
              
              console.log(`Car and Driver - Found article: ${title.substring(0, 50)}...`);
              articles.push(article);
            }
          } catch (error) {
            console.error('Error processing RSS item:', error);
          }
        }
      }
      
      console.log(`Found ${articles.length} articles from Car and Driver RSS`);
      return articles;
      
    } catch (error) {
      console.error('Error scraping Car and Driver article list:', error);
      throw error;
    }
  }

  async scrapeArticleContent(url) {
    try {
      console.log(`Scraping full content from: ${url}`);
      
      const html = await this.fetchWithAxios(url);
      const $ = cheerio.load(html);
      
      // Extract full article content
      const contentElements = $('.article-body, .content-container, .entry-content');
      let content = '';
      
      contentElements.find('p').each((index, element) => {
        const text = $(element).text().trim();
        if (text) {
          content += text + '\n\n';
        }
      });
      
      return this.cleanContent(content);
      
    } catch (error) {
      console.error(`Error scraping article content from ${url}:`, error);
      return '';
    }
  }

  categorizeArticle(title, summary) {
    const text = `${title} ${summary}`.toLowerCase();
    
    if (text.includes('review') || text.includes('test') || text.includes('driven')) {
      return 'reviews';
    }
    
    if (text.includes('electric') || text.includes('ev') || text.includes('hybrid') || text.includes('tesla')) {
      return 'electric';
    }
    
    if (text.includes('race') || text.includes('racing') || text.includes('motorsport') || text.includes('f1')) {
      return 'motorsport';
    }
    
    if (text.includes('technology') || text.includes('tech') || text.includes('autonomous') || text.includes('ai')) {
      return 'technology';
    }
    
    return 'news';
  }

  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }
}

module.exports = CarAndDriverScraper;