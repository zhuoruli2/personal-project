const CarAndDriverScraper = require('./carAndDriverScraper');
const BMWBlogScraper = require('./bmwBlogScraper');
const MotorTrendScraper = require('./motorTrendScraper');
const BaseScraper = require('./baseScraper');

class ScraperFactory {
  static createScraper(source) {
    const sourceName = source.name.toLowerCase();
    
    switch (sourceName) {
      case 'car-and-driver':
      case 'caranddriver':
        return new CarAndDriverScraper(source);
        
      case 'bmw-blog':
      case 'bmwblog':
        return new BMWBlogScraper(source);
        
      // Add more scrapers as needed
      case 'motor-trend':
      case 'motortrend':
        return new MotorTrendScraper(source);
        
      case 'autoblog':
        return new BaseScraper(source); // Generic scraper for now
        
      case 'the-drive':
      case 'thedrive':
        return new BaseScraper(source); // Generic scraper for now
        
      default:
        console.warn(`No specific scraper found for source: ${source.name}, using base scraper`);
        return new BaseScraper(source);
    }
  }
  
  static getSupportedSources() {
    return [
      'car-and-driver',
      'bmw-blog',
      'motor-trend',
      'autoblog',
      'the-drive'
    ];
  }
  
  static isSourceSupported(sourceName) {
    return this.getSupportedSources().includes(sourceName.toLowerCase());
  }
}

module.exports = ScraperFactory;