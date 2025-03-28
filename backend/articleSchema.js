const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Only keep the compound index
articleSchema.index({ category: 1, serialNumber: 1 }, { unique: true });

module.exports = mongoose.model('Article', articleSchema); 