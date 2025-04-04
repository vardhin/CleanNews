const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class News9Scraper {
    constructor() {
        this.baseUrl = 'https://www.news9live.com';
        this.source = 'News 9 Live';
        this.sections = [
            'india',
            'lifestyle',
            'sports',
            'entertainment',
            'city',
            'technology',
            'business'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'india': 'India',
            'lifestyle': 'Lifestyle',
            'sports': 'Sports',
            'entertainment': 'Entertainment',
            'city': 'India',
            'technology': 'Technology',
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

            // Find all article elements (they are wrapped in figure tags)
            $('figure').each((i, element) => {
                const $figure = $(element);
                
                // Get the image from img_wrap - look for both src and data-src attributes
                const imageElement = $figure.find('.img_wrap img');
                const imageUrl = imageElement.attr('data-src') || imageElement.attr('src') || '';
                
                // Get the article summary from p tag
                const summary = $figure.find('p').text().trim();
                
                // Get title and link from span.h3 a tag in cardInfo_Wrapper
                const titleLink = $figure.find('.cardInfo_Wrapper span.h3 a');
                const title = titleLink.text().trim();
                const link = titleLink.attr('href') || '';
                
                // Only proceed if we have a summary
                if (summary) {
                    const article = {
                        id: generateHash(title),
                        title: title,
                        summary: summary,
                        link: link,
                        category: this.getCategory(section),
                        imageUrl: imageUrl.startsWith('http') ? imageUrl : `${this.baseUrl}${imageUrl}`,  // Ensure full URL
                        source: this.source
                    };

                    // Get additional info from cardInfo_Wrapper if it exists
                    const cardInfo = $figure.find('.cardInfo_Wrapper');
                    if (cardInfo.length) {
                        // Extract timestamp if available
                        const timeElement = cardInfo.find('time');
                        if (timeElement.length) {
                            article.timestamp = timeElement.text().trim();
                            // If time has a datetime attribute, include it
                            const datetime = timeElement.attr('datetime');
                            if (datetime) {
                                article.datetime = datetime;
                            }
                        }

                        // Extract author if available
                        const authorElement = cardInfo.find('.author-name');
                        if (authorElement.length) {
                            article.author = authorElement.text().trim();
                        }
                    }

                    // Only add articles with valid links, titles, and summary
                    if (article.link && article.title) {
                        console.log(`Found valid article: "${title}" (ID: ${article.id}) with summary`);
                        articles.push(article);
                    }
                }
            });

            console.log(`Found ${articles.length} valid articles with summaries in ${section} section`);
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
                title: $('h1').first().text().trim(),
                content: $('.article-body, .story-element').text().trim(),
                publishDate: $('time').first().text().trim(),
                images: [],
                category: this.getCategory(this.getCategoryFromUrl(url))
            };

            // Get all images in the article
            $('img.lazy').each((i, element) => {
                const imgUrl = $(element).attr('data-src') || $(element).attr('src');
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
            const authorElement = $('.author-name, .article-author').first();
            if (authorElement.length) {
                article.author = authorElement.text().trim();
            }

            return article;
        } catch (error) {
            console.error('Error scraping article details:', error.message);
            throw error;
        }
    }

    getCategoryFromUrl(url) {
        try {
            const urlPath = new URL(url).pathname;
            const category = urlPath.split('/')[1]; // Get the first part of the path
            return this.sections.includes(category) ? category : 'uncategorized';
        } catch {
            return 'uncategorized';
        }
    }
}

module.exports = News9Scraper; 