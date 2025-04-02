// Convert exports to CommonJS
const getAllCategories = async (Article) => {
    try {
        const categories = await Article.distinct('category');
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Example usage:
// const categories = await getAllCategories(Article);
// console.log('All categories:', categories);

// MongoDB query to get top 25 articles from each category based on serialNumber
const getTopArticlesByCategory = async (Article) => {
    try {
        const categories = await getAllCategories(Article);
        const result = {};

        for (const category of categories) {
            // Get the highest serialNumber for this category
            const maxSerial = await Article.findOne({ category })
                .sort({ serialNumber: -1 })
                .select('serialNumber');

            if (!maxSerial) continue;

            const startSerial = Math.max(1, maxSerial.serialNumber - 24);
            
            // Fetch articles with serialNumber between startSerial and maxSerial
            const articles = await Article.find({
                category,
                serialNumber: { $gte: startSerial, $lte: maxSerial.serialNumber }
            }).sort({ serialNumber: -1 });

            result[category] = articles;
        }

        return result;
    } catch (error) {
        console.error('Error fetching top articles by category:', error);
        throw error;
    }
};

// MongoDB query to get article by category and serialNumber
const getArticleByCategoryAndSerial = async (Article, category, serialNumber) => {
    try {
        const article = await Article.findOne({
            category,
            serialNumber
        });
        return article;
    } catch (error) {
        console.error('Error fetching article by category and serialNumber:', error);
        throw error;
    }
};

// Example usage:
// const article = await getArticleByCategoryAndSerial(Article, 'Technology', 123);
// console.log('Article:', article); 

// MongoDB query to search articles by title
const searchArticlesByTitle = async (Article, searchTerm) => {
    try {
        const articles = await Article.find({
            title: { $regex: searchTerm, $options: 'i' } // case-insensitive search
        })
        .sort({ createdAt: -1 });
        
        return articles;
    } catch (error) {
        console.error('Error searching articles by title:', error);
        throw error;
    }
};

// Example usage:
// const articles = await searchArticlesByTitle(Article, 'bitcoin');
// console.log('Search results:', articles);

// MongoDB query to get featured articles by category
const getFeaturedArticlesByCategory = async (FeaturedArticle, category) => {
    try {
        const featuredArticles = await FeaturedArticle.find({
            category: category
        }).sort({ timestamp: -1 });

        return featuredArticles;
    } catch (error) {
        console.error('Error fetching featured articles by category:', error);
        throw error;
    }
};

// Example usage:
// const featuredArticles = await getFeaturedArticlesByCategory(FeaturedArticle, 'Technology');
// console.log('Featured Articles:', featuredArticles); 

// MongoDB query to get all featured articles
const getAllFeaturedArticles = async (FeaturedArticle) => {
    try {
        const featuredArticles = await FeaturedArticle.find().sort({ timestamp: -1 });
        return featuredArticles;
    } catch (error) {
        console.error('Error fetching all featured articles:', error);
        throw error;
    }
};

// Example usage:
// const allFeaturedArticles = await getAllFeaturedArticles(FeaturedArticle);
// console.log('All Featured Articles:', allFeaturedArticles);

// MongoDB query to get latest featured article and its related articles by category
const getLatestFeaturedArticleWithRelatedArticles = async (FeaturedArticle, Article, category) => {
    try {
        // Get the latest featured article for the category
        const latestFeaturedArticle = await FeaturedArticle.findOne({
            category: category
        }).sort({ timestamp: -1 });

        if (!latestFeaturedArticle) {
            return {
                featuredArticle: null,
                relatedArticles: []
            };
        }

        // Get all articles whose serial numbers are in the featured article's serialNumbers array
        const relatedArticles = await Article.find({
            category: category,
            serialNumber: { $in: latestFeaturedArticle.serialNumbers }
        }).sort({ serialNumber: -1 });

        return {
            featuredArticle: latestFeaturedArticle,
            relatedArticles: relatedArticles
        };
    } catch (error) {
        console.error('Error fetching latest featured article and related articles:', error);
        throw error;
    }
};

// Example usage:
// const result = await getLatestFeaturedArticleWithRelatedArticles(FeaturedArticle, Article, 'Technology');
// console.log('Latest Featured Article:', result.featuredArticle);
// console.log('Related Articles:', result.relatedArticles); 

module.exports = {
    getAllCategories,
    getTopArticlesByCategory,
    getArticleByCategoryAndSerial,
    searchArticlesByTitle,
    getFeaturedArticlesByCategory,
    getAllFeaturedArticles,
    getLatestFeaturedArticleWithRelatedArticles
}; 