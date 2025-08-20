const memoryStorage = require('../storage/memoryStorage');

const defaultSources = [
  {
    name: 'car-and-driver',
    displayName: 'Car and Driver',
    baseUrl: 'https://www.caranddriver.com',
    logoUrl: 'https://www.caranddriver.com/static/img/logo.svg',
    description: 'Car and Driver is a trusted automotive news source featuring reviews, news, and car buying guides.',
    scrapeConfig: {
      selectors: {
        title: 'h2, h3, .headline',
        summary: '.dek, .summary, p',
        content: '.article-body p',
        author: '.byline, .author',
        publishedAt: 'time, .publish-date',
        imageUrl: 'img'
      },
      dateFormat: 'ISO',
      updateFrequency: 1800000 // 30 minutes
    },
    isActive: true
  },
  {
    name: 'bmw-blog',
    displayName: 'BMW Blog',
    baseUrl: 'https://www.bmwblog.com',
    logoUrl: 'https://www.bmwblog.com/wp-content/themes/bmwblog/images/bmwblog-logo.png',
    description: 'The latest BMW news, reviews, and automotive insights.',
    scrapeConfig: {
      selectors: {
        title: 'h2, h3, .entry-title',
        summary: '.entry-summary, .excerpt, .entry-content p',
        content: '.entry-content p',
        author: '.author, .byline, .post-author',
        publishedAt: 'time, .published, .post-date',
        imageUrl: '.wp-post-image, .featured-image img, img'
      },
      dateFormat: 'ISO',
      updateFrequency: 1800000 // 30 minutes
    },
    isActive: true
  },
  {
    name: 'motor-trend',
    displayName: 'Motor Trend',
    baseUrl: 'https://www.motortrend.com',
    logoUrl: 'https://www.motortrend.com/static/img/motortrend-logo.svg',
    description: 'Motor Trend provides comprehensive automotive news, reviews, and car comparisons.',
    scrapeConfig: {
      selectors: {
        title: 'h2, h3, .headline',
        summary: '.dek, .summary, p',
        content: '.article-body p',
        author: '.byline, .author',
        publishedAt: 'time, .publish-date',
        imageUrl: 'img'
      },
      dateFormat: 'ISO',
      updateFrequency: 1800000 // 30 minutes
    },
    isActive: true
  }
];

async function seedSources() {
  try {
    console.log('Seeding default news sources...');
    
    for (const sourceData of defaultSources) {
      const existingSource = memoryStorage.getSources().find(s => s.name === sourceData.name);
      
      if (!existingSource) {
        const source = memoryStorage.addSource(sourceData);
        console.log(`Added source: ${sourceData.displayName}`);
      } else {
        console.log(`Source already exists: ${sourceData.displayName}`);
      }
    }
    
    console.log('Source seeding completed');
  } catch (error) {
    console.error('Error seeding sources:', error);
  }
}

module.exports = { seedSources, defaultSources };