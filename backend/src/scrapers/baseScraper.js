const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

class BaseScraper {
  constructor(source) {
    this.source = source;
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async fetchWithAxios(url) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      throw error;
    }
  }

  async fetchWithPuppeteer(url) {
    try {
      await this.initBrowser();
      const page = await this.browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      const content = await page.content();
      await page.close();
      
      return content;
    } catch (error) {
      console.error(`Error fetching ${url} with Puppeteer:`, error.message);
      throw error;
    }
  }

  parseDate(dateString, format = 'ISO') {
    try {
      if (!dateString) return new Date();

      // Clean up the date string
      dateString = dateString.trim();

      // Handle different date formats
      switch (format) {
        case 'ISO':
          return new Date(dateString);
        case 'relative':
          return this.parseRelativeDate(dateString);
        default:
          return new Date(dateString);
      }
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date();
    }
  }

  parseRelativeDate(dateString) {
    const now = new Date();
    const lowerStr = dateString.toLowerCase();

    if (lowerStr.includes('just now') || lowerStr.includes('a moment ago')) {
      return now;
    }

    const timeUnits = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };

    for (const [unit, milliseconds] of Object.entries(timeUnits)) {
      const match = lowerStr.match(new RegExp(`(\\d+)\\s*${unit}s?\\s*ago`));
      if (match) {
        const value = parseInt(match[1]);
        return new Date(now.getTime() - (value * milliseconds));
      }
    }

    return now;
  }

  extractText($, selector) {
    try {
      const element = $(selector);
      if (element.length === 0) return '';
      
      return element.text().trim();
    } catch (error) {
      console.error(`Error extracting text with selector ${selector}:`, error);
      return '';
    }
  }

  extractAttribute($, selector, attribute) {
    try {
      const element = $(selector);
      if (element.length === 0) return '';
      
      return element.attr(attribute) || '';
    } catch (error) {
      console.error(`Error extracting attribute ${attribute} with selector ${selector}:`, error);
      return '';
    }
  }

  extractImageUrl($, selector) {
    try {
      const element = $(selector);
      if (element.length === 0) return '';
      
      let imageUrl = element.attr('src') || element.attr('data-src') || element.attr('data-lazy-src') || '';
      
      // Convert relative URLs to absolute
      if (imageUrl && !imageUrl.startsWith('http')) {
        const baseUrl = new URL(this.source.baseUrl);
        imageUrl = new URL(imageUrl, baseUrl.origin).href;
      }
      
      return imageUrl;
    } catch (error) {
      console.error(`Error extracting image URL with selector ${selector}:`, error);
      return '';
    }
  }

  cleanContent(content) {
    if (!content) return '';
    
    // Remove extra whitespace and normalize
    content = content.replace(/\s+/g, ' ').trim();
    
    // Remove common unwanted phrases
    const unwantedPhrases = [
      'Read more',
      'Continue reading',
      'Click here',
      'Advertisement',
      'Subscribe now'
    ];
    
    unwantedPhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      content = content.replace(regex, '');
    });
    
    return content.trim();
  }

  async scrapeArticleList() {
    throw new Error('scrapeArticleList must be implemented by subclass');
  }

  async scrapeArticleContent(url) {
    throw new Error('scrapeArticleContent must be implemented by subclass');
  }
}

module.exports = BaseScraper;