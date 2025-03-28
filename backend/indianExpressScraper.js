const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class IndianExpressScraper {
    constructor() {
        this.baseUrl = 'https://indianexpress.com';
        this.source = 'Indian Express';
        this.sections = [
            'india',
            'politics',
            'business',
            'sports',
            'cities',
            'lifestyle'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'india': 'India',
            'politics': 'Politics',
            'business': 'Business',
            'sports': 'Sports',
            'cities': 'India',
            'lifestyle': 'Lifestyle'
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
            $('.articles').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get the title and link
                    const titleElement = $article.find('.title a');
                    const title = titleElement.text().trim();
                    const link = titleElement.attr('href') || '';
                    const fullLink = link.startsWith('/') ? `${this.baseUrl}${link}` : link;
                    
                    // Get the article summary
                    const summary = $article.find('p').text().trim();
                    
                    // Get the image URL
                    const imageElement = $article.find('.snaps img');
                    const imageUrl = imageElement.attr('src') || '';
                    
                    // Get the timestamp
                    const timestampElement = $article.find('.date');
                    const timestamp = timestampElement.text().trim();

                    if (title && summary) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary,
                            link: fullLink,
                            category: this.getCategory(section),
                            timestamp: timestamp,
                            imageUrl: imageUrl,
                            source: this.source
                        };

                        console.log('\nFound article:');
                        console.log(`Title: ${title}`);
                        console.log(`Summary: ${summary}`);
                        console.log(`Link: ${fullLink}`);
                        console.log(`Image URL: ${imageUrl || 'No image found'}`);
                        console.log(`Category: ${article.category}`);
                        console.log(`Source: ${article.source}`);
                        console.log('-------------------');

                        articles.push(article);
                    }
                } catch (articleError) {
                    console.error('Error processing article:', articleError.message);
                    // Continue with next article
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

            // Scrape all sections concurrently
            const scrapePromises = this.sections.map(async (section) => {
                const articles = await this.scrapeSection(section);
                allArticles[section] = articles;
                console.log(`Scraped ${articles.length} articles from ${section} section`);
            });

            await Promise.all(scrapePromises);
            return allArticles;
        } catch (error) {
            console.error('Error scraping all sections:', error.message);
            throw error;
        }
    }

    async scrapeArticleDetails(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            
            const article = {
                title: $('h1').text().trim(),
                content: $('.article-content').text().trim(),
                publishDate: $('.date').text().trim(),
                images: [],
                category: this.getCategoryFromUrl(url),
                source: this.source
            };

            // Get all images in the article
            $('.article-content img').each((i, element) => {
                const imgUrl = $(element).attr('src');
                if (imgUrl) {
                    article.images.push({
                        url: imgUrl,
                        alt: $(element).attr('alt'),
                        width: $(element).attr('width'),
                        height: $(element).attr('height')
                    });
                }
            });

            return article;
        } catch (error) {
            console.error('Error scraping article details:', error.message);
            throw error;
        }
    }

    getCategoryFromUrl(url) {
        try {
            const urlPath = new URL(url).pathname;
            const category = urlPath.split('/')[1];
            return this.sections.includes(category) ? category : 'uncategorized';
        } catch {
            return 'uncategorized';
        }
    }
}

module.exports = IndianExpressScraper; 