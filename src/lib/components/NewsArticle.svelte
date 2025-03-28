<script>
  import { ArrowRight } from 'lucide-svelte';
  export let title = '';
  export let description = '';
  export let imageUrl = '';
  export let stats = { leftAuthors: 0, centerAuthors: 0, rightAuthors: 0 };
  export let category = '';
  
  // Calculate total coverage
  $: totalCoverage = stats.leftAuthors + stats.centerAuthors + stats.rightAuthors;
  
  // Calculate percentages
  $: leftPercentage = totalCoverage ? Math.round((stats.leftAuthors / totalCoverage) * 100) : 0;
  $: centerPercentage = totalCoverage ? Math.round((stats.centerAuthors / totalCoverage) * 100) : 0;
  $: rightPercentage = totalCoverage ? Math.round((stats.rightAuthors / totalCoverage) * 100) : 0;
</script>

<div class="news-article">
  <div class="article-image" style="background-image: url('{imageUrl}')"></div>
  
  <div class="article-content">
    {#if category}
      <div class="article-category">{category}</div>
    {/if}
    
    <h3 class="article-title">{title}</h3>
    
    {#if description}
      <p class="article-description">{description}</p>
    {/if}
    
    <div class="article-metrics">
      <div class="bias-meter">
        <div class="bias-bar left" style="width: {leftPercentage}%"></div>
        <div class="bias-bar center" style="width: {centerPercentage}%"></div>
        <div class="bias-bar right" style="width: {rightPercentage}%"></div>
      </div>
      
      <div class="stats-container">
        <div class="stat-item left">L: {leftPercentage}%</div>
        <div class="stat-item center">C: {centerPercentage}%</div>
        <div class="stat-item right">R: {rightPercentage}%</div>
      </div>
      
      <div class="coverage-count">
        {#if totalCoverage === 1}
          {totalCoverage} source
        {:else}
          {totalCoverage} sources
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .news-article {
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    transition: transform 0.2s;
  }
  
  .news-article:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
  
  .article-image {
    width: 100%;
    height: 140px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .article-content {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .article-category {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #666;
  }
  
  .article-title {
    font-size: 0.9rem;
    line-height: 1.3;
    font-weight: 600;
    margin: 0;
    color: #000;
  }
  
  .article-description {
    font-size: 0.8rem;
    line-height: 1.3;
    color: #444;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .article-metrics {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .bias-meter {
    display: flex;
    height: 4px;
    width: 100%;
    background-color: #eee;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .bias-bar {
    height: 100%;
  }
  
  .bias-bar.left {
    background-color: #d32f2f;
  }
  
  .bias-bar.center {
    background-color: #757575;
  }
  
  .bias-bar.right {
    background-color: #1976d2;
  }
  
  .stats-container {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
  }
  
  .stat-item {
    font-weight: 600;
  }
  
  .stat-item.left {
    color: #d32f2f;
  }
  
  .stat-item.center {
    color: #757575;
  }
  
  .stat-item.right {
    color: #1976d2;
  }
  
  .coverage-count {
    font-size: 0.7rem;
    color: #777;
    text-align: right;
  }
  
  @media (min-width: 768px) {
    .news-article {
      flex-direction: row;
      height: 120px;
    }
    
    .article-image {
      width: 180px;
      height: 100%;
      flex-shrink: 0;
    }
    
    .article-content {
      flex: 1;
    }
  }
</style> 