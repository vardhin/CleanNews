// MongoDB query to get all unique categories
export const getAllCategories = async (Article) => {
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
export const getTopArticlesByCategory = async (Article) => {
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
export const getArticleByCategoryAndSerial = async (Article, category, serialNumber) => {
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