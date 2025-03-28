import 'dotenv/config';
import mongoose from 'mongoose';
import Article from './articleSchema.js';
import { getAllCategories, getTopArticlesByCategory } from './queries.js';

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

// Run the query
const runQuery = async () => {
    try {
        await connectDB();
        
        // Get top articles by category
        const topArticles = await getTopArticlesByCategory(Article);
        
        console.log('\nTop articles by category:');
        for (const [category, articles] of Object.entries(topArticles)) {
            console.log(`\n${category}:`);
            console.log(`Found ${articles.length} articles`);
            articles.forEach(article => {
                console.log(`- ${article.title} (Serial: ${article.serialNumber})`);
            });
        }
        
        // Close the connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    } catch (error) {
        console.error('Error running query:', error);
        process.exit(1);
    }
};

// Run the script
runQuery(); 