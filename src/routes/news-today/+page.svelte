<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Navbar from '$lib/components/Navbar.svelte';
    import CategoryPill from '$lib/components/CategoryPill.svelte';
    import { theme } from '$lib/stores/theme';
    
    let featuredArticle = null;
    let relatedArticles = [];
    let loading = true;
    let error = null;
    let categories = [];
    let selectedCategory = null;
    
    // Parse query parameters from URL to get article ID
    $: articleId = $page.url.searchParams.get('id');
    
    // Function to parse simple markdown syntax
    function parseMarkdown(text) {
        if (!text) return '';
        
        // Format section headers in bold with breaks before and after (case-insensitive matching for flexibility)
        text = text.replace(/([A-Z][A-Za-z\s&]+):\s/g, '<br><br><strong class="section-header">$1:</strong><br>');
        
        // Add proper spacing after article references at the end of sentences
        text = text.replace(/(\[Article \d+(?:,\s*\d+)*\])\.(\s)/g, '$1.<br><br>$2');
        
        // Add break after article references in the middle of text
        text = text.replace(/(\[Article \d+(?:,\s*\d+)*\])(\s)([A-Z])/g, '$1<br>$2$3');
        
        // Add paragraph breaks between sentences that start new topics
        text = text.replace(/\.(\s+)([A-Z][a-z]+\s(?:is|are|has|have|shows|indicates|highlights|demonstrates|reveals|includes|contains|offers|suggests))/g, '.<br><br>$1$2');
        
        // Add paragraph break after main topic statements ending with a colon
        text = text.replace(/(:\s)([A-Z])/g, ':<br><br>$2');
        
        // Bold - replace **text** with <strong>text</strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic - replace *text* with <em>text</em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Links - replace [text](url) with <a href="url">text</a>
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Remove hanging/unpaired asterisks
        text = text.replace(/(?<!\*)\*(?!\*)/g, '');
        
        // Ensure paragraph breaks around articles
        text = text.replace(/(\. )(\[Article)/g, '.<br><br>$2');
        
        return text;
    }
    
    // Get today's date formatted
    function getTodaysFormattedDate() {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
    }
    
    // Fetch all available categories
    async function fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            
            categories = await response.json();
            
            // Set default category if none is selected
            if (!selectedCategory && categories.length > 0) {
                selectedCategory = categories[0];
                fetchFeaturedArticleByCategory(selectedCategory);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            error = err.message || 'Failed to load categories';
        }
    }
    
    // Fetch the featured article by category
    async function fetchFeaturedArticleByCategory(category) {
        loading = true;
        error = null;
        
        try {
            // Fetch featured articles for the selected category
            const response = await fetch(`/api/featured/${category}`);
            if (!response.ok) throw new Error(`Failed to fetch featured articles for ${category}`);
            
            const featuredArticles = await response.json();
            
            if (featuredArticles.length === 0) {
                throw new Error(`No featured articles found for ${category}`);
            }
            
            // Get the most recent featured article
            featuredArticle = featuredArticles[0];
            
            // Now fetch all related articles by their serialNumbers
            if (featuredArticle.serialNumbers && featuredArticle.serialNumbers.length > 0) {
                const articlesPromises = featuredArticle.serialNumbers.map(serialNum => 
                    fetch(`/api/article/${featuredArticle.category}/${serialNum}`)
                        .then(res => {
                            if (!res.ok) throw new Error(`Failed to fetch article with ID ${serialNum}`);
                            return res.json();
                        })
                        .catch(err => {
                            console.error(`Error fetching article ${serialNum}:`, err);
                            return null; // Return null for failed fetches
                        })
                );
                
                const results = await Promise.all(articlesPromises);
                relatedArticles = results.filter(article => article !== null); // Filter out failed fetches
            } else {
                relatedArticles = [];
            }
            
        } catch (err) {
            console.error('Error fetching article data:', err);
            error = err.message || 'Failed to load article data';
            featuredArticle = null;
            relatedArticles = [];
        } finally {
            loading = false;
        }
    }
    
    // Handle category selection
    function selectCategory(category) {
        selectedCategory = category;
        fetchFeaturedArticleByCategory(category);
    }
    
    // Fetch data when component mounts
    onMount(() => {
        fetchCategories();
    });
    
    // Fetch article by ID if provided
    $: if (articleId) {
        fetchArticleData();
    }
    
    // Fetch the featured article and its related articles by ID
    async function fetchArticleData() {
        if (!articleId) return;
        
        loading = true;
        error = null;
        
        try {
            // Fetch all featured articles first
            const response = await fetch('/api/featured');
            if (!response.ok) throw new Error('Failed to fetch featured articles');
            
            const featuredArticles = await response.json();
            
            // Find the featured article that contains the articleId in its serialNumbers
            const found = featuredArticles.find(article => 
                article.serialNumbers && article.serialNumbers.includes(Number(articleId))
            );
            
            if (!found) {
                throw new Error('Featured article not found');
            }
            
            featuredArticle = found;
            selectedCategory = featuredArticle.category;
            
            // Now fetch all related articles by their serialNumbers
            if (featuredArticle.serialNumbers && featuredArticle.serialNumbers.length > 0) {
                const articlesPromises = featuredArticle.serialNumbers.map(serialNum => 
                    fetch(`/api/article/${featuredArticle.category}/${serialNum}`)
                        .then(res => {
                            if (!res.ok) throw new Error(`Failed to fetch article with ID ${serialNum}`);
                            return res.json();
                        })
                        .catch(err => {
                            console.error(`Error fetching article ${serialNum}:`, err);
                            return null; // Return null for failed fetches
                        })
                );
                
                const results = await Promise.all(articlesPromises);
                relatedArticles = results.filter(article => article !== null); // Filter out failed fetches
            } else {
                relatedArticles = [];
            }
            
        } catch (err) {
            console.error('Error fetching article data:', err);
            error = err.message || 'Failed to load article data';
            featuredArticle = null;
            relatedArticles = [];
        } finally {
            loading = false;
        }
    }
</script>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .category-bar {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding: 20px 0;
        margin-bottom: 20px;
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    
    .category-bar::-webkit-scrollbar {
        display: none;
    }
    
    .section-header {
        display: block;
        font-size: 1.2em;
        margin-top: 1.2em;
        margin-bottom: 0.5em;
        color: var(--accent-color);
    }
    
    .featured-article {
        margin: 40px 0;
        animation: fadeIn 0.6s ease-out;
    }
    
    .featured-header {
        margin-bottom: 30px;
        position: relative;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .category-label {
        display: inline-block;
        background-color: var(--accent-color);
        color: white;
        padding: 5px 12px;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 16px;
        clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);
        box-shadow: 0 3px 6px rgba(var(--accent-color-rgb), 0.2);
        letter-spacing: 0.5px;
    }
    
    .featured-title {
        font-size: 2.8rem;
        font-weight: 800;
        margin-bottom: 16px;
        line-height: 1.2;
        background: linear-gradient(to right, var(--text-primary), var(--accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .featured-date {
        font-size: 0.95rem;
        color: var(--text-secondary);
        margin-bottom: 32px;
        font-style: italic;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .featured-date::before {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>');
        background-repeat: no-repeat;
        background-position: center;
    }
    
    .insights-section {
        margin-bottom: 40px;
        background: var(--glass-bg);
        padding: 32px;
        border-radius: 12px;
        border: 1px solid var(--glass-border);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .insights-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    }
    
    .insights-section:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px var(--glass-shadow);
    }
    
    .insights-title {
        font-size: 1.7rem;
        font-weight: 700;
        margin-bottom: 24px;
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 12px;
        display: inline-block;
        position: relative;
    }
    
    .insights-title::after {
        content: '💡';
        margin-left: 10px;
        font-size: 1.3rem;
    }
    
    .insights-content {
        font-size: 1.15rem;
        line-height: 1.8;
    }
    
    .insights-content :global(strong) {
        color: var(--accent-color);
    }
    
    .insights-content :global(a) {
        color: var(--accent-color);
        text-decoration: none;
        position: relative;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .insights-content :global(a)::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        bottom: -2px;
        left: 0;
        background-color: var(--accent-color);
        transform: scaleX(0);
        transform-origin: bottom right;
        transition: transform 0.3s ease;
    }
    
    .insights-content :global(a):hover::after {
        transform: scaleX(1);
        transform-origin: bottom left;
    }
    
    .summary-section {
        margin-bottom: 40px;
        background: var(--glass-bg);
        padding: 32px;
        border-radius: 12px;
        border: 1px solid var(--glass-border);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .summary-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    }
    
    .summary-section:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px var(--glass-shadow);
    }
    
    .summary-title {
        font-size: 1.7rem;
        font-weight: 700;
        margin-bottom: 24px;
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 12px;
        display: inline-block;
        position: relative;
    }
    
    .summary-title::after {
        content: '📝';
        margin-left: 10px;
        font-size: 1.3rem;
    }
    
    .summary-content {
        font-size: 1.15rem;
        line-height: 1.8;
    }
    
    .summary-content :global(strong) {
        color: var(--accent-color);
    }
    
    .summary-content :global(a) {
        color: var(--accent-color);
        text-decoration: none;
        position: relative;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .summary-content :global(a)::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        bottom: -2px;
        left: 0;
        background-color: var(--accent-color);
        transform: scaleX(0);
        transform-origin: bottom right;
        transition: transform 0.3s ease;
    }
    
    .summary-content :global(a):hover::after {
        transform: scaleX(1);
        transform-origin: bottom left;
    }
    
    .related-articles {
        margin: 60px 0;
        animation: fadeIn 0.8s ease-out;
    }
    
    .related-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 32px;
        position: relative;
        text-align: center;
    }
    
    .related-title::after {
        content: "";
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 4px;
        background-color: var(--accent-color);
        border-radius: 2px;
    }
    
    .article-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 30px;
    }
    
    .article-card {
        background: var(--card-bg);
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        position: relative;
        border: 1px solid var(--card-border);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        text-decoration: none;
        color: var(--text-primary);
    }
    
    .article-number {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 30px;
        height: 30px;
        background-color: var(--accent-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        z-index: 2;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .article-card:hover .article-number {
        transform: scale(1.1);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
    }
    
    .article-card:hover {
        transform: perspective(1000px) translateY(-15px) translateZ(30px) rotateX(5deg);
        box-shadow: 0 25px 35px -10px var(--glass-shadow);
    }
    
    .article-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
        transform: scaleX(0);
        transition: transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    
    .article-card:hover::after {
        transform: scaleX(1);
    }
    
    .article-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 12px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        border: 2px solid transparent;
    }
    
    .article-card:hover::before {
        opacity: 1;
        border: 2px solid var(--accent-color);
        box-shadow: 0 0 20px rgba(var(--accent-color-rgb), 0.5);
    }
    
    .article-image {
        width: 100%;
        height: 220px;
        object-fit: cover;
        transition: transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.5s ease;
    }
    
    .article-card:hover .article-image {
        transform: scale(1.1);
        filter: brightness(1.1) contrast(1.05);
    }
    
    .article-content {
        padding: 24px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        transition: all 0.4s ease;
        position: relative;
    }
    
    .article-card:hover .article-content {
        transform: translateY(-5px);
    }
    
    .article-title {
        font-size: 1.3rem;
        font-weight: 700;
        margin-bottom: 16px;
        line-height: 1.4;
        position: relative;
        display: inline-block;
        transition: transform 0.3s ease;
    }
    
    .article-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -3px;
        width: 0;
        height: 2px;
        background-color: var(--accent-color);
        transition: width 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    
    .article-card:hover .article-title::after {
        width: 100%;
    }
    
    .article-excerpt {
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 20px;
    }
    
    .article-meta {
        margin-top: auto;
        font-size: 0.9rem;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .article-meta::before {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h-2v2h2V7zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2zm4-8h-2v2h2V7zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>');
        background-repeat: no-repeat;
        background-position: center;
    }
    
    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        flex-direction: column;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid var(--glass-border);
        border-left-color: var(--accent-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    }
    
    .loading p {
        font-size: 1.1rem;
        color: var(--text-secondary);
    }
    
    @keyframes fadeIn {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes shine {
        0% {
            background-position: -100% 0;
        }
        100% {
            background-position: 250% 0;
        }
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .error-container {
        background: rgba(255, 0, 0, 0.1);
        border-left: 4px solid #ff3e3e;
        padding: 24px;
        margin: 40px 0;
        color: var(--text-primary);
        border-radius: 8px;
        animation: fadeIn 0.6s ease-out;
    }
    
    .error-container h2 {
        color: #ff3e3e;
        margin-bottom: 12px;
        font-size: 1.5rem;
    }
    
    .article-content::after {
        content: '→';
        position: absolute;
        right: 15px;
        bottom: 15px;
        font-size: 1.4rem;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
        color: var(--accent-color);
    }
    
    .article-card:hover .article-content::after {
        opacity: 0.9;
        transform: translateX(0);
    }
    
    :global([data-theme="dark"]) {
        --bg-primary: #000000;
        --bg-secondary: #0a0a0a;
        --text-primary: #ffffff;
        --text-secondary: #b0b0b0;
        --accent-color: #4d94ff;
        --accent-color-rgb: 77, 148, 255;
        --card-bg: rgba(10, 10, 10, 0.7);
        --card-bg-hover: rgba(15, 15, 15, 0.8);
        --card-border: rgba(255, 255, 255, 0.05);
        --glass-bg: rgba(10, 10, 10, 0.7);
        --glass-dark-bg: rgba(0, 0, 0, 0.85);
        --glass-border: rgba(255, 255, 255, 0.05);
        --glass-shadow: rgba(0, 0, 0, 0.3);
        --pill-active-bg: rgba(255, 255, 255, 0.1);
        --pill-active-shadow: rgba(255, 255, 255, 0.1);
        --gradient-overlay: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        --about-gradient: linear-gradient(45deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
    }
    
    :global([data-theme="light"]) {
        --bg-primary: #f5f5f5;
        --bg-secondary: #ffffff;
        --text-primary: #121212;
        --text-secondary: #555555;
        --accent-color: #0066cc;
        --accent-color-rgb: 0, 102, 204;
        --card-bg: rgba(255, 255, 255, 0.7);
        --card-bg-hover: rgba(255, 255, 255, 0.9);
        --card-border: rgba(0, 0, 0, 0.05);
        --glass-bg: rgba(255, 255, 255, 0.7);
        --glass-dark-bg: rgba(245, 245, 245, 0.85);
        --glass-border: rgba(0, 0, 0, 0.05);
        --glass-shadow: rgba(0, 0, 0, 0.1);
        --pill-active-bg: rgba(0, 0, 0, 0.05);
        --pill-active-shadow: rgba(0, 0, 0, 0.1);
        --gradient-overlay: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
        --about-gradient: linear-gradient(45deg, rgba(240, 240, 240, 0.7), rgba(225, 225, 225, 0.7));
    }
    
    .app {
        min-height: 100vh;
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }
    
    @media (max-width: 768px) {
        .featured-title {
            font-size: 2.2rem;
        }
        
        .article-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .insights-section, .summary-section {
            padding: 24px;
        }
        
        .insights-title, .summary-title {
            font-size: 1.5rem;
        }
        
        .insights-content, .summary-content {
            font-size: 1.05rem;
            line-height: 1.7;
        }
        
        .related-title {
            font-size: 1.8rem;
        }
    }
    
    @media (max-width: 480px) {
        .article-grid {
            grid-template-columns: 1fr;
        }
        
        .featured-title {
            font-size: 1.8rem;
        }
        
        .featured-date {
            font-size: 0.85rem;
        }
        
        .category-label {
            font-size: 0.8rem;
            padding: 4px 10px;
        }
        
        .insights-section, .summary-section {
            padding: 20px;
        }
        
        .article-image {
            height: 200px;
        }
    }
</style>

<div class="app" data-theme={$theme}>
    <Navbar />
    
    <main class="container">
        <!-- Category Pills Bar -->
        <div class="category-bar">
            {#each categories as category}
                <div on:click={() => selectCategory(category)}>
                    <CategoryPill text={category} active={selectedCategory === category} />
                </div>
            {/each}
        </div>
        
        {#if loading}
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading article data...</p>
            </div>
        {:else if error}
            <div class="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <p>Please try again later or return to the homepage.</p>
            </div>
        {:else if featuredArticle}
            <article class="featured-article">
                <header class="featured-header">
                    <span class="category-label">{featuredArticle.category}</span>
                    <h1 class="featured-title">Today's {featuredArticle.category} News</h1>
                    <p class="featured-date">
                        {getTodaysFormattedDate()}
                    </p>
                </header>
                
                <section class="insights-section glass glow">
                    <h2 class="insights-title">Key Insights</h2>
                    <div class="insights-content">
                        {@html parseMarkdown(featuredArticle.keyInsights)}
                    </div>
                </section>
                
                <section class="summary-section glass glow">
                    <h2 class="summary-title">Comprehensive Summary</h2>
                    <div class="summary-content">
                        {@html parseMarkdown(featuredArticle.comprehensiveSummary)}
                    </div>
                </section>
                
                <section class="related-articles">
                    <h2 class="related-title">Related Articles</h2>
                    
                    <div class="article-grid">
                        {#each relatedArticles as article, index}
                            <a href={article.link} target="_blank" rel="noopener noreferrer" class="article-card glass glow">
                                <div class="article-number">{index + 1}</div>
                                <img src={article.image || '/placeholder.svg'} alt={article.title} class="article-image">
                                <div class="article-content">
                                    <h3 class="article-title">{article.title}</h3>
                                    <p class="article-excerpt">{article.summary?.substring(0, 100)}...</p>
                                    <div class="article-meta">
                                        <span>Source: {article.source || 'Unknown'}</span>
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                </section>
            </article>
        {:else}
            <div class="error-container">
                <h2>No Featured Article</h2>
                <p>There are no featured articles available for the selected category. Please try another category or check back later.</p>
            </div>
        {/if}
    </main>
</div>