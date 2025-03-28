const axios = require('axios');
const cheerio = require('cheerio');
const { generateHash } = require('./hash');

class IndiatodayScraper {
    constructor() {
        this.baseUrl = 'https://www.indiatoday.in';
        this.source = 'India Today';
        this.sections = [
            'lifestyle',
            'india',
            'south',
            'world',
            'business',
            'sports',
            'technology',
            'entertainment'
        ];
    }

    getCategory(section) {
        const categoryMap = {
            'lifestyle': 'Lifestyle',
            'india': 'India',
            'south': 'India',
            'world': 'World',
            'business': 'Business',
            'sports': 'Sports',
            'technology': 'Technology',
            'entertainment': 'Entertainment'
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
            $('article.B1S3_story__card__A_fhi').each((i, element) => {
                const $article = $(element);
                
                // Get the title and link from h2 a tag
                const titleLink = $article.find('h2 a');
                const title = titleLink.text().trim();
                const link = titleLink.attr('href') || '';
                const fullLink = link.startsWith('/') ? `${this.baseUrl}${link}` : link;
                
                // Get the article summary from p tag
                const summary = $article.find('.B1S3_story__shortcont__inicf p').text().trim();
                
                // Get the image
                const imageElement = $article.find('.thumb img');
                const image = imageElement.attr('src') || '';

                if (summary) {
                    const article = {
                        id: generateHash(title),
                        title: title,
                        summary: summary,
                        link: fullLink,
                        category: this.getCategory(section),
                        image: image,
                        source: this.source
                    };

                    // Only add articles with valid links and titles
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
                content: $('.Story_description__full___WDe5').text().trim(),
                publishDate: $('.Story_date__publish___5SpEx').text().trim(),
                images: [],
                category: this.getCategoryFromUrl(url)
            };

            // Get all images in the article
            $('.Story_description__full___WDe5 img').each((i, element) => {
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

            // Try to get author information
            const authorElement = $('.Story_author__name___PZKJe');
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

module.exports = IndiatodayScraper; 