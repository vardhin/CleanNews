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
</style>
