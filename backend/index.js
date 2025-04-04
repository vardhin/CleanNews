require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Article = require('./articleSchema');

// Import all scrapers
const AlJazeeraScraper = require('./alJazeeraScraper');
const DeccanChronicleScraper = require('./deccanChronicleScraper');
const IndianExpressScraper = require('./indianExpressScraper');
const IndiatodayScraper = require('./indiatodayScraper');
const News9Scraper = require('./news9livescraper');
const NYTimesScraper = require('./nyTimesScraper');
const ThePrintScraper = require('./thePrintScraper');
const TimeComScraper = require('./timeComScraper');

// Create a new results.txt file (overwrite if exists)
const resultsFile = fs.createWriteStream('results.txt', { flags: 'w' });
    
// Function to log to both console and file
const log = (message) => {
    console.log(message);
    resultsFile.write(message + '\n');
};

// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Function to clear the database
const clearDatabase = async () => {
    try {
        log('\nClearing existing articles from database...');
        await Article.deleteMany({});
        log('Database cleared successfully\n');
    } catch (error) {
        console.error('Error clearing database:', error.message);
        throw error;
    }
};

// Function to get next serial number for a category
async function getNextSerialNumber(category) {
    const lastArticle = await Article.findOne({ category })
        .sort({ serialNumber: -1 })
        .limit(1);
    return lastArticle ? lastArticle.serialNumber + 1 : 1;
}

// Function to save article to MongoDB with duplicate check
async function saveArticle(article) {
    try {
        // Check if article with same ID already exists
        const existingArticle = await Article.findOne({ id: article.id });
        
        if (existingArticle) {
            console.log(`Article with ID ${article.id} already exists in database. Skipping...`);
            return existingArticle.serialNumber; // Return existing serial number
        }

        // If article doesn't exist, get next serial number and save
        const serialNumber = await getNextSerialNumber(article.category);
        const newArticle = new Article({
            ...article,
            serialNumber,
            image: article.image || article.imageUrl || 'No image'
        });
        await newArticle.save();
        console.log(`Saved new article with ID ${article.id} and serial number ${serialNumber}`);
        return serialNumber;
    } catch (error) {
        console.error(`Error saving article to MongoDB: ${error.message}`);
        return null;
    }
}

// Function to print article in consistent format
const printArticle = async (article) => {
    const serialNumber = await saveArticle(article);
    if (serialNumber) {  // Only log if article was saved or already exists
        log(`Serial Number: ${serialNumber}`);
        log(`ID: ${article.id}`);
        log(`Title: ${article.title}`);
        log(`Summary: ${article.summary}`);
        log(`Link: ${article.link}`);
        log(`Image: ${article.image || article.imageUrl || 'No image'}`);
        log(`Category: ${article.category}`);
        log(`Source: ${article.source}`);
        log('-------------------');
    }
};

// Function to scrape articles from a single source
const scrapeSource = async (Scraper, sourceName) => {
    try {
        console.log(`\nStarting to scrape ${sourceName}...`);
        const scraper = new Scraper();
        const articles = await scraper.scrapeAllSections();
        
        log(`\nArticles from ${sourceName}:`);
        for (const section in articles) {
            for (const article of articles[section]) {
                await printArticle(article);
            }
        }
    } catch (error) {
        console.error(`Error scraping ${sourceName}: ${error.message}`);
    }
};

// Main function to scrape all sources
const scrapeAllSources = async () => {
    const sources = [
        { scraper: AlJazeeraScraper, name: 'Al Jazeera' },
        { scraper: DeccanChronicleScraper, name: 'Deccan Chronicle' },
        { scraper: IndianExpressScraper, name: 'Indian Express' },
        { scraper: IndiatodayScraper, name: 'India Today' },
        { scraper: News9Scraper, name: 'News 9' },
        { scraper: NYTimesScraper, name: 'New York Times' },
        { scraper: ThePrintScraper, name: 'The Print' },
        { scraper: TimeComScraper, name: 'Time' }
    ];

    for (const source of sources) {
        await scrapeSource(source.scraper, source.name);
        // Add a delay between sources to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};

// Function to delete articles with default images
const deleteArticlesWithDefaultImages = async () => {
    try {
        log('\nChecking for articles with default images...');
        
        // Find and count matching articles first
        const matchingArticles = await Article.find({
            source: 'The Print',
            image: { $regex: 'default', $options: 'i' }
        });

        log(`Found ${matchingArticles.length} articles with default images`);

        // Log the articles that will be deleted
        matchingArticles.forEach(article => {
            log(`\nDeleting article:`);
            log(`Title: ${article.title}`);
            log(`Image URL: ${article.image}`);
            log(`Category: ${article.category}`);
            log(`Serial Number: ${article.serialNumber}`);
        });

        // Delete the articles
        const result = await Article.deleteMany({
            source: 'The Print',
            image: { $regex: 'default', $options: 'i' }
        });

        log(`\nDeleted ${result.deletedCount} articles with default images`);

    } catch (error) {
        console.error('Error deleting articles with default images:', error);
        log('Error deleting articles with default images: ' + error.message);
    }
};

// Connect to MongoDB and start scraping
connectDB().then(async () => {
    try {
        log(`\nScraping started at: ${new Date().toISOString()}\n`);
        
        // Clear the database before scraping
        await clearDatabase();
        
        // Start scraping
        await scrapeAllSources();
        
        // Delete articles with default images after scraping
        await deleteArticlesWithDefaultImages();
        
        log(`\nScraping completed at: ${new Date().toISOString()}\n`);
    } catch (error) {
        console.error('Error during scraping process:', error);
    } finally {
        resultsFile.end();
        // Don't disconnect from MongoDB immediately to allow saves to complete
        setTimeout(() => {
            mongoose.connection.close();
            process.exit(0);
        }, 5000);
    }
});

// Handle application termination
process.on('SIGINT', async () => {
    resultsFile.end();
    await mongoose.connection.close();
    process.exit(0);
});