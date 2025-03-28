const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class TimeComScraper {
    constructor() {
        this.baseUrl = 'https://time.com';
        this.source = 'Time Magazine';
        this.sections = [
            'section/politics',
            'section/world',
            'section/health',
            'section/climate',
            'section/business',
            'section/tech',
            'section/entertainment',
            'section/science',
            'section/sports'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'section/politics': 'Politics',
            'section/world': 'World',
            'section/health': 'Health',
            'section/climate': 'Climate',
            'section/business': 'Business',
            'section/tech': 'Technology',
            'section/entertainment': 'Entertainment',
            'section/science': 'Technology',
            'section/sports': 'Sports'
        };
        return categoryMap[section] || 'Uncategorized';
    }

    async scrapeSection(section) {
        try {
            const url = `${this.baseUrl}/${section}`;
            console.log(`Fetching ${url}...`);
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const articles = [];

            // Find all article elements
            $('.taxonomy-tout').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get the title
                    const title = $article.find('.headline').text().trim();
                    
                    // Get the link
                    const link = $article.find('a').attr('href') || '';
                    const fullLink = link.startsWith('/') ? `${this.baseUrl}${link}` : link;
                    
                    // Get the summary
                    const summary = $article.find('.summary').text().trim();
                    
                    // Get the image URL
                    const imageUrl = $article.find('.image-container').attr('data-src') || '';

                    // Get the timestamp and author
                    const timestamp = $article.find('time').attr('datetime') || '';
                    const author = $article.find('.byline span').first().text().trim();

                    if (title && summary) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary,
                            link: fullLink,
                            category: this.getCategory(section),
                            timestamp: timestamp,
                            author: author,
                            imageUrl: imageUrl,
                            source: this.source
                        };

                        // Debug logging
                        console.log('\nFound article:');
                        console.log(`Title: ${title}`);
                        console.log(`Summary: ${summary}`);
                        console.log(`Image URL: ${imageUrl || 'No image found'}`);
                        console.log(`Author: ${author}`);
                        console.log(`Timestamp: ${timestamp}`);
                        console.log('-------------------');

                        articles.push(article);
                    }
                } catch (articleError) {
                    console.error('Error processing article:', articleError.message);
                }
            });

            console.log(`Found ${articles.length} valid articles in ${section} section`);
            return articles;
        } catch (error) {
            console.error(`Error scraping ${section} section:`, error.message);
            return [];
        }
    }

    async scrapeAllSections() {
        try {
            const allArticles = {};
            
            // Initialize categories
            for (const section of this.sections) {
                allArticles[section] = [];
            }

            // Scrape all sections sequentially to avoid rate limiting
            for (const section of this.sections) {
                const articles = await this.scrapeSection(section);
                allArticles[section] = articles;
                console.log(`Completed scraping ${section} section: ${articles.length} articles`);
                // Add a small delay between sections
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return allArticles;
        } catch (error) {
            console.error('Error scraping all sections:', error.message);
            throw error;
        }
    }
}

module.exports = TimeComScraper;