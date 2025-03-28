import mongoose from 'mongoose';

const featuredArticleSchema = new mongoose.Schema({
    keyInsights: {
        type: String,
        required: true
    },
    comprehensiveSummary: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    serialNumbers: [{
        type: Number,
        required: true
    }],
    category: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Create a compound index for deduplication based on category and date
featuredArticleSchema.index(
    { 
        category: 1, 
        timestamp: {
            $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$timestamp" 
            }
        }
    }, 
    { unique: true }
);

export default mongoose.model('FeaturedArticle', featuredArticleSchema); 