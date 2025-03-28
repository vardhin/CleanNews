const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class ZeeNewsScraper {
    constructor() {
        this.baseUrl = 'https://zeenews.india.com';
        this.source = 'Zee News';
        this.sections = [
            'india',
            'cricket',
            'entertainment',
            'lifestyle',
            'business',
            'world',
            'auto',
            'mobility',
            'technology'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'india': 'India',
            'cricket': 'Sports',
            'entertainment': 'Entertainment',
            'lifestyle': 'Lifestyle',
            'business': 'Business',
            'world': 'World',
            'auto': 'Technology',
            'mobility': 'Technology',
            'technology': 'Technology'
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
            $('.row.no-gutters.morenews-block').each((i, element) => {
                const $article = $(element);
                
                try {
                    // Get image URL directly from the img element
                    const imageElement = $article.find('.section-tumbnail-top-post img');
                    const imageUrl = imageElement.length ? (imageElement.attr('data-src') || imageElement.attr('src') || '') : '';
                    
                    // Get article details from the second column
                    const tagElement = $article.find('.article-tag a');
                    const titleElement = $article.find('.news_description.desc-title.morenews-title a').last();
                    const timestampElement = $article.find('.updated-timestamp');
                    const summaryElement = $article.find('.more-news-desc a');
                    
                    const title = titleElement.text().trim();
                    const link = titleElement.attr('href') || '';
                    const fullLink = link.startsWith('/') ? `${this.baseUrl}${link}` : link;
                    const summary = summaryElement.text().trim();
                    
                    if (title && summary) {
                        const article = {
                            id: generateHash(title),
                            title: title,
                            summary: summary,
                            link: fullLink,
                            category: this.getCategory(section),
                            timestamp: timestampElement.text().trim(),
                            tag: tagElement.text().trim(),
                            image: imageUrl,
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
                title: $('h1').first().text().trim(),
                content: $('.article-body').text().trim(),
                publishDate: $('.article-publish-date').text().trim(),
                images: [],
                category: this.getCategory(this.getCategoryFromUrl(url))
            };

            // Get all images in the article
            $('.article-body img').each((i, element) => {
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
            const authorElement = $('.article-author');
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
            const category = urlPath.split('/')[1];
            return this.sections.includes(category) ? category : 'uncategorized';
        } catch {
            return 'uncategorized';
        }
    }
}

module.exports = ZeeNewsScraper; 