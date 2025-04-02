require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./articleSchema');
const FeaturedArticle = require('./featuredArticleSchema');
const { getTopArticlesByCategory } = require('./queries');

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

// Format articles for Gemini API
const formatArticlesForPrompt = (articles) => {
    return articles.map((article, index) => 
        `[Article ${index + 1}]\nTitle: ${article.title}\nSummary: ${article.summary}\n`
    ).join('\n');
};

// Parse AI output into structured format
const parseAIOutput = (output, articles, category) => {
    // Split the output into sections
    const sections = output.split(/\d+\./);
    
    // Extract key insights and summary
    const keyInsights = sections[1]?.trim() || '';
    const comprehensiveSummary = sections[2]?.trim() || '';
    
    // Get all serial numbers from articles
    const serialNumbers = articles.map(article => article.serialNumber);
    
    return {
        keyInsights,
        comprehensiveSummary,
        timestamp: new Date(),
        serialNumbers,
        category
    };
};

// Save analysis to MongoDB
const saveAnalysis = async (analysis) => {
    try {
        // Try to find existing analysis for same category and date
        const existingAnalysis = await FeaturedArticle.findOne({
            category: analysis.category,
            timestamp: {
                $gte: new Date(analysis.timestamp.setHours(0, 0, 0, 0)),
                $lt: new Date(analysis.timestamp.setHours(23, 59, 59, 999))
            }
        });

        if (existingAnalysis) {
            console.log(`Analysis for category "${analysis.category}" already exists for today. Skipping...`);
            return null;
        }

        // Create new featured article
        const featuredArticle = new FeaturedArticle(analysis);
        await featuredArticle.save();
        console.log(`Successfully saved analysis for category "${analysis.category}"`);
        return featuredArticle;
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            console.log(`Analysis for category "${analysis.category}" already exists for today. Skipping...`);
        } else {
            throw error;
        }
        return null;
    }
};

// Get insights from Gemini API
const getGeminiInsights = async (articles, category) => {
    const prompt = `Please analyze these articles and provide:
1. Key insights and trends across all articles
2. A comprehensive summary of the main topics covered

IMPORTANT: For each insight or point you make, please cite the specific article(s) you're referencing using [Article X] format. Only make claims that are directly supported by the provided articles.

Here are the articles:

${formatArticlesForPrompt(articles)}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        const data = await response.json();
        const aiOutput = data.candidates[0].content.parts[0].text;
        return parseAIOutput(aiOutput, articles, category);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
};

// Main function to analyze articles
const analyzeArticles = async () => {
    try {
        await connectDB();
        
        // Get top articles by category
        const topArticles = await getTopArticlesByCategory(Article);
        
        console.log('\nAnalyzing articles by category...');
        for (const [category, articles] of Object.entries(topArticles)) {
            console.log(`\nAnalyzing ${category} articles...`);
            console.log(`Found ${articles.length} articles`);
            
            try {
                const analysis = await getGeminiInsights(articles, category);
                console.log('\nAnalysis Results:');
                console.log(JSON.stringify(analysis, null, 2));
                
                // Save analysis to MongoDB
                await saveAnalysis(analysis);
                
                console.log('\n' + '='.repeat(80) + '\n');
            } catch (error) {
                console.error(`Error analyzing ${category} articles:`, error);
            }
        }
        
        // Close the connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    } catch (error) {
        console.error('Error running analysis:', error);
        process.exit(1);
    }
};

// Run the script
analyzeArticles();

module.exports = {
    connectDB
}; 