const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class NYTimesScraper {
    constructor() {
        this.baseUrl = 'https://www.nytimes.com';
        this.source = 'New York Times';
        this.sections = [
            'international/section/world',
            'international/section/business',
            'international/section/arts',
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'international/section/world': 'World',
            'international/section/business': 'Business',
            'international/section/arts': 'Lifestyle',
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
            $('li.css-18yolpw').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get the title
                    const title = $article.find('h3.css-1j88qqx').text().trim();
                    
                    // Get the link
                    const link = $article.find('a.css-8hzhxf').attr('href') || '';
                    const fullLink = link.startsWith('/') ? `${this.baseUrl}${link}` : link;
                    
                    // Get the summary
                    const summary = $article.find('p.css-1pga48a').text().trim();
                    
                    // Get the image URL
                    const imageUrl = $article.find('img.css-rq4mmj').attr('src') || '';

                    if (title && summary) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary,
                            link: fullLink,
                            category: this.getCategory(section),
                            imageUrl: imageUrl,
                            source: this.source
                        };

                        // Debug logging
                        console.log('\nFound article:');
                        console.log(`Title: ${title}`);
                        console.log(`Summary: ${summary}`);
                        console.log(`Link: ${fullLink}`);
                        console.log(`Image URL: ${imageUrl || 'No image found'}`);
                        console.log(`Category: ${article.category}`);
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

module.exports = NYTimesScraper; 