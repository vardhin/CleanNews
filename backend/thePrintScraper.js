const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class ThePrintScraper {
    constructor() {
        this.baseUrl = 'https://theprint.in';
        this.source = 'The Print';
        this.sections = [
            'category/politics',
            'category/governance',
            'category/economy',
            'category/defence',
            'category/india',
            'category/judiciary',
            'category/science',
            'category/tech'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'category/politics': 'Politics',
            'category/governance': 'Politics',
            'category/economy': 'Business',
            'category/defence': 'India',
            'category/india': 'India',
            'category/judiciary': 'India',
            'category/science': 'Technology',
            'category/tech': 'Technology'
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
            $('.td-module-container.td-category-pos-image').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get the title and link
                    const titleElement = $article.find('.entry-title.td-module-title a');
                    const title = titleElement.text().trim();
                    const link = titleElement.attr('href') || '';
                    
                    // Get the article summary
                    const summary = $article.find('.td-excerpt').text().trim();
                    
                    // Get the image URL from the background-image style
                    const imageElement = $article.find('.entry-thumb.td-thumb-css');
                    const backgroundImage = imageElement.attr('style') || '';
                    const image = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || '';
                    
                    // Get the timestamp
                    const timestampElement = $article.find('.entry-date.updated');
                    const timestamp = timestampElement.text().trim();
                    
                    // Get the author
                    const authorElement = $article.find('.td-post-author-name a');
                    const author = authorElement.text().trim();

                    if (title && summary) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary,
                            link: link,
                            category: this.getCategory(section),
                            timestamp: timestamp,
                            author: author,
                            image: image,
                            source: this.source
                        };

                        console.log(`Found valid article: "${title}" (ID: ${article.id})`);
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
                title: $('.td-post-title h1.entry-title').text().trim(),
                content: $('.td-post-content').text().trim(),
                publishDate: $('.td-post-date time').text().trim(),
                author: $('.td-post-author-name a').text().trim(),
                images: [],
                category: this.getCategory(url)
            };

            // Get all images in the article
            $('.td-post-content img').each((i, element) => {
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
            const parts = urlPath.split('/');
            const categoryIndex = parts.indexOf('category');
            return categoryIndex !== -1 && parts[categoryIndex + 1] ? parts[categoryIndex + 1] : 'uncategorized';
        } catch {
            return 'uncategorized';
        }
    }
}

module.exports = ThePrintScraper; 