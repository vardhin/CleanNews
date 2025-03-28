import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getLatestFeaturedArticleWithRelatedArticles } from './queries.js';
import Article from './articleSchema.js';
import FeaturedArticle from './featuredArticleSchema.js';

// Load environment variables from .env file
dotenv.config();

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

async function runSampleQuery() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Run the query for Technology category
        const result = await getLatestFeaturedArticleWithRelatedArticles(
            FeaturedArticle,
            Article,
            'Technology'
        );

        // Log the results
        console.log('\n=== Latest Featured Article ===');
        if (result.featuredArticle) {
            console.log('Key Insights:', result.featuredArticle.keyInsights);
            console.log('Comprehensive Summary:', result.featuredArticle.comprehensiveSummary);
            console.log('Timestamp:', result.featuredArticle.timestamp);
            console.log('Serial Numbers:', result.featuredArticle.serialNumbers);
            console.log('Category:', result.featuredArticle.category);
        } else {
            console.log('No featured article found for Technology category');
        }

        console.log('\n=== Related Articles ===');
        if (result.relatedArticles.length > 0) {
            result.relatedArticles.forEach((article, index) => {
                console.log(`\nArticle ${index + 1}:`);
                console.log('Title:', article.title);
                console.log('Summary:', article.summary);
                console.log('Serial Number:', article.serialNumber);
                console.log('Source:', article.source);
                console.log('Link:', article.link);
            });
        } else {
            console.log('No related articles found');
        }

    } catch (error) {
        console.error('Error running sample query:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the sample query
runSampleQuery(); 