const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class HindustanTimesScraper {
    constructor() {
        this.baseUrl = 'https://www.hindustantimes.com';
        this.source = 'Hindustan Times';
        this.sections = [
            'india-news',
            'world-news',
            'real-estate',
            'entertainment',
            'lifestyle',
            'education',
            'business'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'india-news': 'India',
            'world-news': 'World',
            'real-estate': 'Lifestyle',
            'entertainment': 'Entertainment',
            'lifestyle': 'Lifestyle',
            'education': 'Education',
            'business': 'Business'
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
            $('.cartHolder.listView').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get the title and link
                    const titleElement = $article.find('h3.hdg3 a');
                    const title = titleElement.text().trim();
                    const link = titleElement.attr('href') || '';
                    const fullLink = link.startsWith('/') ? `${this.baseUrl}${link}` : link;
                    
                    // Get the article summary
                    const summary = $article.find('h2.sortDec').text().trim();
                    
                    // Get the image URL
                    const imageElement = $article.find('figure img');
                    const image = imageElement.attr('src') || imageElement.attr('data-src') || '';

                    if (title && summary) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary,
                            link: fullLink,
                            category: this.getCategory(section),
                            image: image,
                            source: this.source
                        };

                        // Debug logging
                        console.log('\nFound article:');
                        console.log(`Title: ${title}`);
                        console.log(`Summary: ${summary}`);
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

    async scrapeArticleDetails(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            
            const article = {
                title: $('h1.hdg1').text().trim(),
                content: $('.articleBody').text().trim(),
                publishDate: $('.dateTime').text().trim(),
                author: $('.byLineAuthor a').text().trim(),
                images: [],
                category: this.getCategoryFromUrl(url)
            };

            // Get all images in the article
            $('.articleBody img').each((i, element) => {
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

module.exports = HindustanTimesScraper; 