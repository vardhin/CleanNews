const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class NDTVScraper {
    constructor() {
        this.baseUrl = 'https://www.ndtv.com';
        this.sections = [
            'opinion',
            'world/us',
            'world/uk',
            'middle-east',
            'india-global',
            'asia',
            'europe',
            'australia',
            'americas',
            'africa'
        ];
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async scrapeSection(section) {
        try {
            const url = `${this.baseUrl}/${section}`;
            console.log(`Fetching ${url}...`);
            
            const response = await axios.get(url, { 
                headers: this.headers,
                timeout: 10000 // 10 second timeout
            });
            
            const $ = cheerio.load(response.data);
            const articles = [];

            // Updated selectors for NDTV's current structure
            $('div.story_list').each((i, element) => {
                const $article = $(element);
                
                // Get the article link and image
                const articleLink = $article.find('a.story_list__heading');
                const href = articleLink.attr('href') || '';
                
                // Get the image details
                const imageElement = $article.find('img.story_list__img');
                const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
                const imageAlt = imageElement.attr('alt') || '';
                
                // Get the article text content
                const title = articleLink.text().trim();
                const summary = $article.find('p.story_list__description').text().trim();
                
                // Only add articles with valid title and link
                if (title && href) {
                    const article = {
                        id: generateHash(title),
                        title: title,
                        summary: summary,
                        link: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                        category: section,
                        image: {
                            src: imageUrl,
                            alt: imageAlt
                        }
                    };

                    console.log(`Found valid article: "${title}" (ID: ${article.id})`);
                    articles.push(article);
                }
            });

            console.log(`Found ${articles.length} valid articles in ${section} section`);
            return articles;
        } catch (error) {
            console.error(`Error scraping ${section} section:`, error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
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

            // Scrape sections sequentially with delay to avoid rate limiting
            for (const section of this.sections) {
                const articles = await this.scrapeSection(section);
                allArticles[section] = articles;
                console.log(`Scraped ${articles.length} articles from ${section} section`);
                await this.delay(2000); // 2 second delay between sections
            }

            return allArticles;
        } catch (error) {
            console.error('Error scraping all sections:', error.message);
            throw error;
        }
    }

    async scrapeArticleDetails(url) {
        try {
            const response = await axios.get(url, { 
                headers: this.headers,
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            
            const article = {
                title: $('h1.story__title').first().text().trim(),
                content: $('div.story__content').text().trim(),
                publishDate: $('span.story__date').first().text().trim(),
                images: [],
                category: this.getCategoryFromUrl(url)
            };

            // Get all images in the article
            $('div.story__content img').each((i, element) => {
                const imgUrl = $(element).attr('src') || $(element).attr('data-src');
                if (imgUrl) {
                    article.images.push({
                        url: imgUrl,
                        alt: $(element).attr('alt'),
                        width: $(element).attr('width'),
                        height: $(element).attr('height')
                    });
                }
            });

            // Try to get author information
            const authorElement = $('span.story__author').first();
            if (authorElement.length) {
                article.author = authorElement.text().trim();
            }

            return article;
        } catch (error) {
            console.error('Error scraping article details:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    }

    getCategoryFromUrl(url) {
        try {
            const urlPath = new URL(url).pathname;
            const pathParts = urlPath.split('/').filter(Boolean);
            if (pathParts.length >= 2) {
                const possibleCategory = `${pathParts[0]}/${pathParts[1]}`;
                if (this.sections.includes(possibleCategory)) {
                    return possibleCategory;
                }
            }
            return pathParts[0] || 'uncategorized';
        } catch {
            return 'uncategorized';
        }
    }
}

module.exports = NDTVScraper; 