import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs-node';
import { kmeans } from 'ml-kmeans';
import natural from 'natural';
import express from 'express';
import cors from 'cors';

class NewsProcessor {
    constructor() {
        this.encoder = null;
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();
    }

    async initialize() {
        // Load the Universal Sentence Encoder model
        this.encoder = await use.load();
    }

    async getEmbeddings(texts) {
        // Convert texts to embeddings using Universal Sentence Encoder
        const embeddings = await this.encoder.embed(texts);
        return embeddings.arraySync();
    }

    async clusterArticles(articles, numClusters = 3) {
        // Extract titles and content for embedding
        const texts = articles.map(article => 
            `${article.title} ${article.content}`
        );

        // Get embeddings for all texts
        const embeddings = await this.getEmbeddings(texts);

        // Perform k-means clustering
        const result = kmeans(embeddings, numClusters);

        // Group articles by cluster
        const clusters = Array(numClusters).fill().map(() => []);
        result.clusters.forEach((clusterIndex, articleIndex) => {
            clusters[clusterIndex].push(articles[articleIndex]);
        });

        return clusters;
    }

    generateStandardTitle(articles) {
        // Combine all titles and content
        const allText = articles.map(article => 
            `${article.title} ${article.content}`
        ).join(' ');

        // Clean and tokenize the text
        const tokens = this.tokenizer.tokenize(allText.toLowerCase());
        
        // Calculate TF-IDF scores
        this.tfidf.addDocument(allText);
        
        // Get the top terms
        const terms = this.tfidf.listTerms(0);
        const topTerms = terms.slice(0, 3).map(term => term.term);

        // Create title from top terms
        const title = topTerms
            .map(term => term.charAt(0).toUpperCase() + term.slice(1))
            .join(' ');

        return title;
    }

    async processArticles(articles) {
        // Cluster similar articles
        const clusters = await this.clusterArticles(articles);

        // Process each cluster
        const processedClusters = clusters.map(cluster => {
            if (cluster.length === 0) return null;

            const standardTitle = this.generateStandardTitle(cluster);
            
            return {
                articles: cluster,
                standard_title: standardTitle
            };
        }).filter(cluster => cluster !== null);

        return processedClusters;
    }
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize the news processor
const processor = new NewsProcessor();
await processor.initialize();

// API endpoint
app.post('/process', async (req, res) => {
    try {
        const { articles } = req.body;
        
        if (!Array.isArray(articles)) {
            return res.status(400).json({ 
                error: 'Articles must be an array' 
            });
        }

        const processedClusters = await processor.processArticles(articles);
        
        res.json({ clusters: processedClusters });
    } catch (error) {
        console.error('Error processing articles:', error);
        res.status(500).json({ 
            error: 'Error processing articles' 
        });
    }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 