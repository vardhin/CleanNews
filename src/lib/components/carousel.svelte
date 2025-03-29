<script>
    export let featuredNews = [];
    let currentSlide = 0;
    
    // Test data if no featured news is available
    const mockFeaturedNews = [
        {
            keyInsights: "Global Tech Companies Face New Regulations",
            comprehensiveSummary: "Major technology companies are preparing for significant regulatory changes as new legislation is introduced across multiple countries to address concerns about data privacy, market competition, and content moderation.",
            category: "Technology",
            serialNumbers: [1],
            timestamp: new Date().toISOString(),
            relatedArticles: [
                {
                    title: "Tech Regulation Impact on Industry Growth",
                    summary: "Analysis of how upcoming regulations might affect the technology sector's expansion and innovation.",
                    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVjaG5vbG9neXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1920&q=100"
                }
            ]
        },
        {
            keyInsights: "Climate Summit Produces Historic Agreement",
            comprehensiveSummary: "World leaders have reached a landmark agreement at the latest climate summit, committing to more aggressive carbon reduction targets and establishing a framework for financial support to developing nations.",
            category: "Environment",
            serialNumbers: [2],
            timestamp: new Date().toISOString(),
            relatedArticles: [
                {
                    title: "Implications of New Climate Accord",
                    summary: "Experts evaluate the potential impact of the newly signed climate agreement on global emissions and economic policies.",
                    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bmF0dXJlfGVufDB8fDB8fHww&auto=format&fit=crop&w=1920&q=100"
                }
            ]
        }
    ];
    
    // Function to extract key points from article text
    function extractKeyPoints(article) {
        // If we have a comprehensive summary, extract sentences from it
        if (article.comprehensiveSummary) {
            // Split summary into sentences
            const sentences = article.comprehensiveSummary
                .split(/(?<=[.!?])\s+/)
                .filter(s => s.trim().length > 20); // Filter out short sentences
            
            // Return first sentence if available
            if (sentences.length >= 1) {
                return sentences[0];
            }
        }
        
        // If no comprehensive summary, use key insight
        if (article.keyInsights) {
            return article.keyInsights;
        }
        
        // Fallback: Use related article summary or generic based on category
        if (article.relatedArticles?.[0]?.summary) {
            return article.relatedArticles[0].summary;
        }
        
        // Final fallback based on category
        if (article.category === "Technology") {
            return "Technology sector faces significant regulatory changes and market transitions";
        } else if (article.category === "Environment") {
            return "Climate policies set to reshape energy markets and environmental protection standards";
        } else {
            return "Important developments reported with significant industry implications";
        }
    }
    
    // Use mock data if no real data available
    if (featuredNews.length === 0) {
        featuredNews = mockFeaturedNews;
        console.log("Using mock featured news data");
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % (featuredNews.length || 1);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + (featuredNews.length || 1)) % (featuredNews.length || 1);
    }

    // Auto-advance carousel
    import { onMount } from 'svelte';
    onMount(() => {
        if (featuredNews.length > 0) {
            const carouselInterval = setInterval(nextSlide, 5000);
            return () => clearInterval(carouselInterval);
        }
    });
</script>

<style>
    /* Hero carousel */
    .carousel {
        position: relative;
        height: 70vh;
        min-height: 500px;
        max-height: 600px;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }

    .carousel-slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
        display: grid;
        grid-template-columns: 45% 55%;
        gap: 0;
    }

    .carousel-slide.active {
        opacity: 1;
        visibility: visible;
    }

    .carousel-content {
        padding: 2.5rem;
        z-index: 2;
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: var(--glass-dark-bg);
        max-height: 100%;
        overflow-y: auto;
    }

    .carousel-image-container {
        position: relative;
        height: 100%;
        width: 100%;
    }

    .carousel-image {
        position: absolute;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    .carousel-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }

    .carousel-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, 
            var(--glass-dark-bg) 0%, 
            rgba(0,0,0,0.6) 50%, 
            rgba(0,0,0,0.4) 100%);
        z-index: 1;
        pointer-events: none;
    }

    .carousel-category-title {
        font-size: 2.2rem;
        font-weight: 700;
        text-transform: capitalize;
        margin-bottom: 1.5rem;
        color: var(--text-primary);
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 0.5rem;
        display: inline-block;
    }

    .carousel-subtitle {
        font-size: 1.4rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--accent-color);
    }

    .carousel-insights-list {
        margin-bottom: 2rem;
        line-height: 1.6;
        font-size: 1.1rem;
        color: var(--text-primary);
        max-width: 95%;
        padding-left: 1.5rem;
        list-style-type: disc;
    }

    .carousel-insights-list li {
        margin-bottom: 0.8rem;
        padding-left: 0.5rem;
    }

    .carousel-category {
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--accent-color);
        margin-bottom: 1rem;
        letter-spacing: 0.05em;
        display: inline-block;
        background: rgba(0, 0, 0, 0.2);
        padding: 0.3rem 0.8rem;
        border-radius: 2px;
    }

    .carousel-title {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.4;
        margin-bottom: 1.5rem;
        color: var(--text-primary);
        word-wrap: break-word;
        max-width: 95%;
    }

    .btn-read-more {
        align-self: flex-start;
        padding: 0.5rem 1.25rem;
        background-color: var(--accent-color);
        color: #000;
        font-size: 0.85rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-read-more:hover {
        background-color: var(--accent-color);
        opacity: 0.9;
        transform: translateY(-2px);
    }

    .carousel-nav {
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 10;
        display: flex;
        gap: 8px;
    }

    .nav-button {
        width: 36px;
        height: 36px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s ease;
        border: none;
        border-radius: 2px;
    }

    .nav-button:hover {
        background: rgba(0, 0, 0, 0.7);
    }

    .carousel-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-primary);
        background: var(--glass-dark-bg);
        padding: 2rem;
    }

    .carousel-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--accent-color);
        z-index: 10;
        transition: width 0.3s linear;
    }

    .carousel-single-insight {
        margin-bottom: 2rem;
        line-height: 1.6;
        font-size: 1.2rem;
        color: var(--text-primary);
        max-width: 95%;
        padding-left: 0.5rem;
    }

    @media (max-width: 992px) {
        .carousel-slide {
            grid-template-columns: 55% 45%;
        }
        
        .carousel-title {
            font-size: 1.3rem;
        }
    }

    @media (max-width: 768px) {
        .carousel {
            max-height: none;
        }
        
        .carousel-slide {
            grid-template-columns: 1fr;
        }

        .carousel-image-container {
            display: none;
        }

        .carousel-content {
            padding: 1.5rem;
        }

        .carousel-title {
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        
        .carousel-category {
            font-size: 0.8rem;
        }
    }
</style>

<section class="carousel">
    {#if featuredNews.length === 0}
        <div class="carousel-empty">
            <h2>No featured articles available</h2>
            <p>Check your backend connection or add some featured articles.</p>
        </div>
    {:else}
        {#each featuredNews as item, index}
            <div 
                class="carousel-slide {index === currentSlide ? 'active' : ''}"
                style="transform: translateX({(index - currentSlide) * 100}%)"
            >
                <div class="carousel-content">
                    <h2 class="carousel-category-title">{item.category}</h2>
                    <div class="carousel-subtitle">Key Insights:</div>
                    <p class="carousel-single-insight">{extractKeyPoints(item)}</p>
                    <a href={`/article/${item.category}/${item.serialNumbers[0]}`} class="btn-read-more">
                        Read More
                    </a>
                </div>
                
                <div class="carousel-image-container">
                    <div class="carousel-gradient"></div>
                    {#if item.relatedArticles?.[0]?.image}
                        <div class="carousel-image">
                            <img 
                                src={item.relatedArticles[0].image} 
                                alt={item.keyInsights}
                                loading="eager"
                                fetchpriority="high"
                            />
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
        
        <div class="carousel-progress" style="width: {((currentSlide + 1) / featuredNews.length) * 100}%"></div>
        
        <div class="carousel-nav">
            <button class="nav-button" on:click={prevSlide} aria-label="Previous slide">←</button>
            <button class="nav-button" on:click={nextSlide} aria-label="Next slide">→</button>
        </div>
    {/if}
</section>
