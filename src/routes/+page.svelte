<script>
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import FeaturedArticle from '$lib/components/FeaturedArticle.svelte';
  import CategoryPill from '$lib/components/CategoryPill.svelte';
  import NewsArticle from '$lib/components/NewsArticle.svelte';
  import { featuredArticle, categories, articles } from '$lib/data.js';
</script>

<div class="app-container">
  <div class="layout-container">
    <Navbar />
    
    <div class="content-wrapper">
      <div class="content-container">
        <div class="featured-section">
          <FeaturedArticle 
            title={featuredArticle.title} 
            description={featuredArticle.description}
            imageUrl={featuredArticle.imageUrl}
          />
        </div>
        
        <div class="categories-section">
          {#each categories as category}
            <CategoryPill icon={category.icon} text={category.text} />
          {/each}
        </div>

        <div class="articles-section">
          {#each articles as article}
            <div class="article-wrapper">
              <NewsArticle 
                title={article.title}
                description={article.description}
                imageUrl={article.imageUrl}
              />
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
    background-color: #f8fafc;
    overflow-x: hidden;
  }

  .layout-container {
    display: flex;
    height: 100%;
    flex-grow: 1;
    flex-direction: column;
  }

  .content-wrapper {
    padding: 0 10rem;
    display: flex;
    flex: 1;
    justify-content: center;
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    max-width: 960px;
    flex: 1;
  }

  .featured-section {
    padding: 1rem;
  }

  .categories-section {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem;
    overflow-x: auto;
    scrollbar-width: none; /* For Firefox */
    -ms-overflow-style: none; /* For Internet Explorer and Edge */
  }

  .categories-section::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Opera */
  }

  .articles-section {
    display: flex;
    flex-direction: column;
  }

  .article-wrapper {
    padding: 1rem;
  }

  @media (max-width: 1024px) {
    .content-wrapper {
      padding: 0 2rem;
    }
  }

  @media (max-width: 768px) {
    .content-wrapper {
      padding: 0 1rem;
    }
  }
</style>
