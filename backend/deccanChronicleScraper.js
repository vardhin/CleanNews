const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class DeccanChronicleScraper {
    constructor() {
        this.baseUrl = 'https://www.deccanchronicle.com';
        this.source = 'Deccan Chronicle';
        this.sections = [
            'rest-of-india',
            'world',
            'sports',
            'entertainment',
            'business',
            'technology',
            'education'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'rest-of-india': 'India',
            'world': 'World',
            'sports': 'Sports',
            'entertainment': 'Entertainment',
            'business': 'Business',
            'technology': 'Technology',
            'education': 'Environment'
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

            // Find all article elements using the exact HTML structure
            $('.col-lg-3.col-sm-6.grid-margin').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get the title and link
                    const titleElement = $article.find('h5.font-weight-bold.grid-heading a');
                    const title = titleElement.text().trim();
                    const link = titleElement.attr('href') || '';
                    const fullLink = link.startsWith('http') ? link : `${this.baseUrl}${link}`;
                    
                    // Get the article summary
                    const summary = $article.find('p.grid-desc a').text().trim();
                    
                    // Get the image URL
                    const imageElement = $article.find('.position-relative.image-hover a img');
                    const image = imageElement.attr('data-src') || imageElement.attr('src') || '';

                    // Only create article if we have at least a title
                    if (title) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary || 'No summary available',
                            link: fullLink,
                            category: this.getCategory(section),
                            image: image,
                            source: this.source
                        };

                        // Debug logging
                        console.log('\nFound article:');
                        console.log(`Title: ${title}`);
                        console.log(`Summary: ${summary || 'No summary available'}`);
                        console.log(`Link: ${fullLink}`);
                        console.log(`Category: ${this.getCategory(section)}`);
                        console.log(`Image: ${image || 'No image found'}`);
                        console.log(`Source: ${this.source}`);
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

module.exports = DeccanChronicleScraper; 