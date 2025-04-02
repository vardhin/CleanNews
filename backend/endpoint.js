require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Article = require('./articleSchema');
const FeaturedArticle = require('./featuredArticleSchema');
const {
    getAllCategories,
    getTopArticlesByCategory,
    getArticleByCategoryAndSerial,
    getFeaturedArticlesByCategory,
    getAllFeaturedArticles,
    getLatestFeaturedArticleWithRelatedArticles,
    searchArticlesByTitle
} = require('./queries');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Only start listening after successful DB connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await getAllCategories(Article);
        res.json(categories);
    } catch (error) {
        console.error('Error in /api/categories endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get top 25 articles from each category
app.get('/api/top-articles', async (req, res) => {
    try {
        const articles = await getTopArticlesByCategory(Article);
        res.json(articles);
    } catch (error) {
        console.error('Error in /api/top-articles endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch top articles' });
    }
});

// Get article by category and serialNumber
app.get('/api/article/:category/:serialNumber', async (req, res) => {
    try {
        const { category, serialNumber } = req.params;
        const article = await getArticleByCategoryAndSerial(Article, category, parseInt(serialNumber));
        
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        
        res.json(article);
    } catch (error) {
        console.error('Error in /api/article/:category/:serialNumber endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// Search articles by title
app.get('/api/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const articles = await searchArticlesByTitle(Article, query);
        res.json(articles);
    } catch (error) {
        console.error('Error in /api/search endpoint:', error);
        res.status(500).json({ error: 'Failed to search articles' });
    }
});

// Get featured articles by category
app.get('/api/featured/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const featuredArticles = await getFeaturedArticlesByCategory(FeaturedArticle, category);
        res.json(featuredArticles);
    } catch (error) {
        console.error('Error in /api/featured/:category endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch featured articles' });
    }
});

// Get all featured articles
app.get('/api/featured', async (req, res) => {
    try {
        const featuredArticles = await getAllFeaturedArticles(FeaturedArticle);
        res.json(featuredArticles);
    } catch (error) {
        console.error('Error in /api/featured endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch featured articles' });
    }
});

// Get latest featured article and related articles by category
app.get('/api/featured-with-related/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const result = await getLatestFeaturedArticleWithRelatedArticles(FeaturedArticle, Article, category);
        res.json(result);
    } catch (error) {
        console.error('Error in /api/featured-with-related/:category endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch featured article with related articles' });
    }
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});
