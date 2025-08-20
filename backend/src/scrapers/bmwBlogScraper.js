const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

class BMWBlogScraper extends BaseScraper {
  constructor(source) {
    super(source);
  }

  async scrapeArticleList() {
    try {
      console.log('Scraping BMW Blog article list...');
      
      const html = await this.fetchWithAxios(this.source.baseUrl);
      const $ = cheerio.load(html);
      
      const articles = [];
      
      // BMW Blog article selectors - try different selectors
      const articleSelectors = ['.post', 'article', '.entry', '.content-item', '.article-item'];
      let foundArticles = false;
      
      for (const selector of articleSelectors) {
        const elements = $(selector);
        console.log(`BMW Blog - Trying selector "${selector}": found ${elements.length} elements`);
        
        if (elements.length > 0) {
          foundArticles = true;
          elements.each((index, element) => {
        try {
          const $article = $(element);
          
          // Extract article URL
          let articleUrl = $article.find('h2 a, h3 a, .entry-title a').first().attr('href') || '';
          if (articleUrl && !articleUrl.startsWith('http')) {
            articleUrl = new URL(articleUrl, this.source.baseUrl).href;
          }
          
          // Skip if no URL found
          if (!articleUrl) return;
          
          // Extract title from within this article element
          const title = $article.find('h2, h3, .entry-title').first().text().trim();
          
          // Extract summary/excerpt from within this article element
          const summary = $article.find('.entry-summary, .excerpt, .entry-content p').first().text().trim();
          
          // Extract image from within this article element
          let imageUrl = '';
          const img = $article.find('.wp-post-image, .featured-image img, img').first();
          if (img.length > 0) {
            imageUrl = img.attr('src') || img.attr('data-src') || '';
            if (imageUrl && !imageUrl.startsWith('http')) {
              try {
                imageUrl = new URL(imageUrl, this.source.baseUrl).href;
              } catch (error) {
                imageUrl = '';
              }
            }
          }
          
          // Extract author from within this article element
          const author = $article.find('.author, .byline, .post-author').first().text().trim();
          
          // Use current date for published date (since we're showing today's news)
          const publishedAt = new Date();
          
          if (title && articleUrl) {
            const article = {
              title: this.cleanContent(title),
              summary: this.cleanContent(summary) || title,
              url: articleUrl,
              imageUrl,
              author: this.cleanContent(author),
              publishedAt,
              category: this.categorizeArticle(title, summary)
            };
            console.log(`BMW Blog - Found article: ${title.substring(0, 50)}...`);
            articles.push(article);
          } else {
            console.log(`BMW Blog - Skipped article: title="${title}", url="${articleUrl}"`);
          }
          } catch (error) {
            console.error('Error processing BMW Blog article element:', error);
          }
          });
          
          // Break after finding articles with first working selector
          if (articles.length > 0) break;
        }
      }
      
      console.log(`Found ${articles.length} articles from BMW Blog`);
      return articles;
      
    } catch (error) {
      console.error('Error scraping BMW Blog article list:', error);
      throw error;
    }
  }

  async scrapeArticleContent(url) {
    try {
      console.log(`Scraping full content from: ${url}`);
      
      const html = await this.fetchWithAxios(url);
      const $ = cheerio.load(html);
      
      // Extract full article content
      const contentElements = $('.entry-content, .post-content, .article-content');
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
    
    if (text.includes('bmw') || text.includes('mini') || text.includes('rolls-royce')) {
      if (text.includes('electric') || text.includes('ev') || text.includes('i3') || text.includes('i4') || text.includes('ix')) {
        return 'electric';
      }
      
      if (text.includes('review') || text.includes('test') || text.includes('drive')) {
        return 'reviews';
      }
      
      if (text.includes('m3') || text.includes('m4') || text.includes('m5') || text.includes('motorsport')) {
        return 'motorsport';
      }
      
      if (text.includes('technology') || text.includes('idrive') || text.includes('autonomous')) {
        return 'technology';
      }
    }
    
    return 'news';
  }
}

module.exports = BMWBlogScraper;