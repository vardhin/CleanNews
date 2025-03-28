const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class AlJazeeraScraper {
    constructor() {
        this.baseUrl = 'https://www.aljazeera.com';
        this.source = 'Al Jazeera';
        this.sections = [
            'sports',
            'economy',
            'tag/human-rights',
            'climate-crisis',
            'investigations',
            'tag/science-and-technology'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'sports': 'Sports',
            'economy': 'Business',
            'tag/human-rights': 'Environment',
            'climate-crisis': 'Climate',
            'investigations': 'Politics',
            'tag/science-and-technology': 'Technology'
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
            $('article.gc.gc--type-post').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get the title
                    const titleElement = $article.find('.gc__title a');
                    const title = titleElement.find('span').text().trim();
                    
                    // Get the link
                    const link = titleElement.attr('href') || '';
                    const fullLink = link.startsWith('/') ? `${this.baseUrl}${link}` : link;
                    
                    // Get the summary
                    const summary = $article.find('.gc__excerpt p').text().trim();
                    
                    // Get the image URL
                    const imgElement = $article.find('.gc__image');
                    let imageUrl = imgElement.attr('src') || '';
                    // Add base URL if the image URL is relative
                    imageUrl = imageUrl.startsWith('/') ? `${this.baseUrl}${imageUrl}` : imageUrl;

                    if (title && summary) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary,
                            link: fullLink,
                            category: this.getCategory(section),
                            image: imageUrl,
                            source: this.source
                        };

                        // Debug logging
                        console.log('\nFound article:');
                        console.log(`Title: ${title}`);
                        console.log(`Summary: ${summary}`);
                        console.log(`Image: ${imageUrl || 'No image found'}`);
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

            // Scrape sections sequentially instead of concurrently
            for (const section of this.sections) {
                const articles = await this.scrapeSection(section);
                allArticles[section] = articles;
                console.log(`Scraped ${articles.length} articles from ${section} section`);
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

module.exports = AlJazeeraScraper; 