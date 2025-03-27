require('dotenv').config();
const mongoose = require('mongoose');
const News9Scraper = require('./scraper');
const NDTVScraper = require('./ndtv_scraper');

// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Initialize scrapers
const news9Scraper = new News9Scraper();
const ndtvScraper = new NDTVScraper();

// Function to scrape and print articles from all sections
async function scrapeAndPrintAllArticles() {
    try {
        console.log('Starting to scrape articles from all sections...\n');
        
        // Scrape from both sources concurrently
        const [news9Articles, ndtvArticles] = await Promise.all([
            news9Scraper.scrapeAllSections(),
            ndtvScraper.scrapeAllSections()
        ]);
        
        
        // Print News9 articles
        console.log('\n=== NEWS9 ARTICLES ===\n');
        for (const [section, articles] of Object.entries(news9Articles)) {
            console.log(`\n=== ${section.toUpperCase()} Section (${articles.length} articles) ===\n`);
            
            articles.forEach((article, index) => {
                console.log(`Article ${index + 1}:`);
                console.log(`Title: ${article.title}`);
                console.log(`Id: ${article.id}`);
                console.log(`Summary: ${article.summary}`);
                console.log(`Category: ${article.category}`);
                if (article.timestamp) {
                    console.log(`Time: ${article.timestamp}`);
                }
                if (article.author) {
                    console.log(`Author: ${article.author}`);
                }
                console.log(`Link: ${article.link}`);
                if (article.additionalInfo) {
                    console.log(`Additional Info: ${article.additionalInfo}`);
                }
                console.log('-------------------\n');
            });
        }
            

        // Print NDTV articles
        console.log('\n=== NDTV ARTICLES ===\n');
        for (const [section, articles] of Object.entries(ndtvArticles)) {
            console.log(`\n=== ${section.toUpperCase()} Section (${articles.length} articles) ===\n`);
            
            articles.forEach((article, index) => {
                console.log(`Article ${index + 1}:`);
                console.log(`Title: ${article.title}`);
                console.log(`Summary: ${article.summary}`);
                console.log(`Category: ${article.category}`);
                if (article.author) {
                    console.log(`Author: ${article.author}`);
                }
                console.log(`Link: ${article.link}`);
                console.log('-------------------\n');
            });
        }

        console.log('Scraping completed successfully!');
    } catch (error) {
        console.error('Error in scraping process:', error.message);
    }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

// Connect to MongoDB and start scraping
connectDB().then(() => {
    scrapeAndPrintAllArticles();
});
