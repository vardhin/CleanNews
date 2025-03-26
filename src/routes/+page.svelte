<script>
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import FeaturedArticle from '$lib/components/FeaturedArticle.svelte';
  import CategoryPill from '$lib/components/CategoryPill.svelte';
  import NewsArticle from '$lib/components/NewsArticle.svelte';
  import { featuredArticle, categories, articles } from '$lib/data.js';
  
  // Import Lucide icons
  import { 
    Home, 
    TrendingUp, 
    Briefcase, 
    Activity,
    Globe, 
    PenTool, 
    Film,
    Book 
  } from 'lucide-svelte';
  
  // Map of icon names to actual icon components
  const iconMap = {
    'home': Home,
    'trending-up': TrendingUp,
    'briefcase': Briefcase,
    'heartbeat': Activity,
    'globe': Globe,
    'pen-tool': PenTool,
    'film-strip': Film,
    'book': Book
  };
  
  // Group articles by category
  const groupedArticles = {};
  
  // Initialize categories with empty arrays
  categories.forEach(category => {
    groupedArticles[category.text] = [];
  });
  
  // Populate articles into their respective categories
  articles.forEach(article => {
    // Log each article to debug
    console.log('Processing article:', article.title, 'Category:', article.category);
    
    if (article.category && groupedArticles[article.category]) {
      groupedArticles[article.category].push(article);
    } else {
      // If no category or category doesn't exist, add to the first category as fallback
      const firstCategory = categories[0]?.text || 'Other';
      console.log('Article has invalid category, adding to:', firstCategory);
      if (!groupedArticles[firstCategory]) groupedArticles[firstCategory] = [];
      groupedArticles[firstCategory].push(article);
    }
  });
  
  // Debug: Log the grouped articles to check distribution
  console.log('Grouped articles:', groupedArticles);
  
  // Smooth scroll function
  function scrollToSection(categoryId) {
    console.log('Attempting to scroll to:', categoryId);
    const element = document.getElementById(categoryId);
    console.log('Found element:', element);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
</script>

<div class="app-container">
  <div class="layout-container">
    <Navbar />
    
    <div class="content-wrapper">
      <!-- Featured article container with 80% width -->
      <div class="featured-wrapper">
        <FeaturedArticle 
          articles={[
            {
              title: featuredArticle.title,
              description: featuredArticle.description,
              imageUrl: featuredArticle.imageUrl,
              stats: { leftAuthors: 12, rightAuthors: 8, centerAuthors: 15 }
            }
          ]} 
        />
      </div>
      
      <div class="content-container">
        <div class="categories-section">
          {#each categories as category}
            <div class="category-pill-container">
              <!-- Debug: Log the category to see what icon is being used -->
              {console.log('Category:', category.text, 'Icon:', category.icon, 'Mapped icon:', iconMap[category.icon])}
              <button 
                on:click={() => {
                  const targetId = category.text.toLowerCase().replace(/\s+/g, '-');
                  console.log('Clicked on category:', category.text, 'Target ID:', targetId);
                  scrollToSection(targetId);
                }}
                class="category-button"
              >
                <span class="button-icon">
                  <svelte:component this={iconMap[category.icon] || Home} size={18} />
                </span>
                <CategoryPill text={category.text} />
              </button>
            </div>
          {/each}
        </div>

        <div class="articles-section">
          {#each Object.entries(groupedArticles) as [category, categoryArticles]}
            <div id={category.toLowerCase().replace(/\s+/g, '-')} class="category-section">
              <h2 class="category-title">{category}</h2>
              {#each categoryArticles as article}
                <div class="article-wrapper">
                  <NewsArticle 
                    title={article.title}
                    description={article.description}
                    imageUrl={article.imageUrl}
                  />
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .app-container {
    position: relative;
    display: flex;
    width: 100%;
    min-height: 100vh;
    flex-direction: column;
    background-color: var(--color-background);
    overflow-x: hidden;
  }

  .layout-container {
    display: flex;
    height: 100%;
    flex-grow: 1;
    flex-direction: column;
  }

  .content-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
  }
  
  /* New featured wrapper with 85% width */
  .featured-wrapper {
    width: 95%;
    margin-bottom: 2rem;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    max-width: 960px;
    width: 100%;
    padding: 0 1rem;
  }

  .categories-section {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .categories-section::-webkit-scrollbar {
    display: none;
  }

  .articles-section {
    display: flex;
    flex-direction: column;
  }

  .article-wrapper {
    padding: 1rem;
  }

  @media (max-width: 1024px) {
    .featured-wrapper {
      width: 90%;
    }
  }

  @media (max-width: 768px) {
    .featured-wrapper {
      width: 95%;
    }
  }

  .category-section {
    margin-bottom: 2rem;
    scroll-margin-top: 80px; /* Adjust based on your navbar height */
  }
  
  .category-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-left: 1rem;
    color: var(--color-text-dark);
    border-left: 4px solid var(--color-primary);
  }

  .category-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dark);
  }
</style>
