const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

class MotorTrendScraper extends BaseScraper {
  constructor(source) {
    super(source);
  }

  async scrapeArticleList() {
    try {
      console.log('Scraping Motor Trend article list with Puppeteer...');
      
      // Motor Trend uses client-side rendering, need Puppeteer
      let html;
      try {
        console.log('Using Puppeteer to render Motor Trend /auto-news...');
        html = await this.fetchWithPuppeteer(`${this.source.baseUrl}/auto-news`);
      } catch (error) {
        console.log('Puppeteer failed, trying homepage as fallback...', error.message);
        try {
          html = await this.fetchWithPuppeteer(this.source.baseUrl);
        } catch (fallbackError) {
          console.log('Puppeteer homepage also failed, using axios...', fallbackError.message);
          html = await this.fetchWithAxios(this.source.baseUrl);
        }
      }
      
      const $ = cheerio.load(html);
      
      const articles = [];
      
      // Motor Trend article selectors for their rendered content
      const articleSelectors = [
        '[data-testid*="article"]',
        '[data-testid*="ArticleCard"]',
        '[data-testid*="card"]',
        'article',
        '[class*="article"]',
        '[class*="card"]',
        '[class*="post"]',
        '.grid > div > a', // Common grid layout
        'a[href*="/news/"]',
        'a[href*="/auto-news/"]'
      ];
      
      let foundArticles = false;
      
      for (const selector of articleSelectors) {
        const elements = $(selector);
        console.log(`Motor Trend - Trying selector "${selector}": found ${elements.length} elements`);
        if (elements.length > 0) {
          foundArticles = true;
          
          elements.each((index, element) => {
            try {
              const $element = $(element);
              
              // For link elements, get URL directly
              let articleUrl = '';
              if ($element.is('a')) {
                articleUrl = $element.attr('href') || '';
              } else {
                // Look for links within the element
                const linkSelectors = ['a[href]', 'h1 a', 'h2 a', 'h3 a', '[href]'];
                for (const linkSelector of linkSelectors) {
                  const link = $element.find(linkSelector).first().attr('href');
                  if (link) {
                    articleUrl = link;
                    break;
                  }
                }
              }
              
              if (articleUrl && !articleUrl.startsWith('http')) {
                try {
                  articleUrl = new URL(articleUrl, this.source.baseUrl).href;
                } catch (error) {
                  console.warn('Invalid URL found:', articleUrl);
                  return;
                }
              }
              
              // Skip if no URL found or invalid URL, or not a news article
              if (!articleUrl || !this.isValidUrl(articleUrl) || !articleUrl.includes('/news/') && !articleUrl.includes('/auto-news/') && !articleUrl.includes('/car-reviews/')) return;
              
              // Extract title from various sources
              let title = '';
              const titleSelectors = ['h1', 'h2', 'h3', '[class*="title"]', '[class*="headline"]', 'img[alt]'];
              for (const titleSelector of titleSelectors) {
                let titleText = '';
                if (titleSelector === 'img[alt]') {
                  titleText = $element.find(titleSelector).first().attr('alt') || '';
                } else {
                  titleText = $element.find(titleSelector).first().text().trim();
                }
                if (titleText && titleText.length > 5) {
                  title = titleText;
                  break;
                }
              }
              
              // If still no title, try getting from href or element text
              if (!title) {
                title = $element.text().trim();
                if (title.length > 100) {
                  title = title.substring(0, 100) + '...';
                }
              }
              
              // Extract summary/description
              let summary = '';
              const summarySelectors = ['[class*="description"]', '[class*="summary"]', '[class*="excerpt"]', 'p'];
              for (const summarySelector of summarySelectors) {
                const summaryText = $element.find(summarySelector).first().text().trim();
                if (summaryText && summaryText.length > 20 && summaryText.length < 500) {
                  summary = summaryText;
                  break;
                }
              }
              
              // Extract image
              let imageUrl = '';
              const img = $element.find('img').first();
              if (img.length > 0) {
                imageUrl = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || '';
                if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
                  try {
                    imageUrl = new URL(imageUrl, this.source.baseUrl).href;
                  } catch (error) {
                    imageUrl = '';
                  }
                }
              }
              
              // Filter to only include recent articles (last 2 days)
              const twoDaysAgo = new Date();
              twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
              const publishedAt = new Date(); // Default to now for Motor Trend
              
              if (title && articleUrl && title.length > 5) {
                const article = {
                  title: this.cleanContent(title),
                  summary: this.cleanContent(summary) || title.substring(0, 100) + '...',
                  url: articleUrl,
                  imageUrl,
                  author: 'Motor Trend',
                  publishedAt,
                  category: this.categorizeArticle(title, summary)
                };
                
                console.log(`Motor Trend - Found article: ${title.substring(0, 50)}...`);
                articles.push(article);
              }
            } catch (error) {
              console.error('Error processing Motor Trend article element:', error);
            }
          });
          
          // Break after finding articles with first working selector that yields results
          if (articles.length > 0) break;
        }
      }
      
      console.log(`Found ${articles.length} articles from Motor Trend`);
      return articles;
      
    } catch (error) {
      console.error('Error scraping Motor Trend article list:', error);
      throw error;
    }
  }

  async scrapeArticleContent(url) {
    try {
      console.log(`Scraping full content from: ${url}`);
      
      const html = await this.fetchWithAxios(url);
      const $ = cheerio.load(html);
      
      // Extract full article content
      const contentElements = $('.article-body, .content-container, .entry-content, .article-content');
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

module.exports = MotorTrendScraper;