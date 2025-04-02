require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./articleSchema');

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

const deleteArticlesWithDefaultImages = async () => {
    try {
        // Find and count matching articles first
        const matchingArticles = await Article.find({
            source: 'The Print',
            image: { $regex: 'default', $options: 'i' }
        });

        console.log(`Found ${matchingArticles.length} articles to delete`);

        // Log the articles that will be deleted
        matchingArticles.forEach(article => {
            console.log(`\nWill delete article:`);
            console.log(`Title: ${article.title}`);
            console.log(`Image URL: ${article.image}`);
            console.log(`Category: ${article.category}`);
            console.log(`Serial Number: ${article.serialNumber}`);
        });

        // Delete the articles
        const result = await Article.deleteMany({
            source: 'The Print',
            image: { $regex: 'default', $options: 'i' }
        });

        console.log(`\nDeleted ${result.deletedCount} articles`);

    } catch (error) {
        console.error('Error deleting articles:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

// Run the script
connectDB()
    .then(() => deleteArticlesWithDefaultImages())
    .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 