<script>
  export let articles = [];
  
  // Calculate stats for the first article (featured)
  $: article = articles[0] || {};
  $: stats = article.stats || { leftAuthors: 0, centerAuthors: 0, rightAuthors: 0 };
  $: totalCoverage = stats.leftAuthors + stats.centerAuthors + stats.rightAuthors;
  
  // Calculate percentages for bias indicators
  $: leftPercentage = totalCoverage ? Math.round((stats.leftAuthors / totalCoverage) * 100) : 0;
  $: centerPercentage = totalCoverage ? Math.round((stats.centerAuthors / totalCoverage) * 100) : 0;
  $: rightPercentage = totalCoverage ? Math.round((stats.rightAuthors / totalCoverage) * 100) : 0;
</script>

<div class="featured-article">
  <div class="featured-content" style="background-image: url('{article.imageUrl}')">
    <div class="overlay">
      <div class="article-info">
        <h2 class="title">{article.title}</h2>
        <p class="description">{article.description}</p>
        
        <div class="article-metrics">
          <div class="bias-wrapper">
            <div class="bias-meter">
              <div class="bias-label left">LEFT</div>
              <div class="bias-label center">CENTER</div>
              <div class="bias-label right">RIGHT</div>
            </div>
            
            <div class="bias-bars">
              <div class="bias-bar left" style="width: {leftPercentage}%"></div>
              <div class="bias-bar center" style="width: {centerPercentage}%"></div>
              <div class="bias-bar right" style="width: {rightPercentage}%"></div>
            </div>
            
            <div class="bias-stats">
              <div class="stat-item">{leftPercentage}%</div>
              <div class="stat-item">{centerPercentage}%</div>
              <div class="stat-item">{rightPercentage}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .featured-article {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    height: 400px;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .featured-content {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8) 100%);
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
  }
  
  .article-info {
    color: white;
    max-width: 700px;
  }
  
  .title {
    font-size: 1.8rem;
    line-height: 1.2;
    font-weight: 700;
    margin: 0 0 0.8rem 0;
  }
  
  .description {
    font-size: 1rem;
    line-height: 1.4;
    margin: 0 0 1.5rem 0;
    opacity: 0.9;
  }
  
  .article-metrics {
    margin-top: 1.5rem;
  }
  
  .bias-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-width: 400px;
  }
  
  .bias-meter {
    display: flex;
    justify-content: space-between;
  }
  
  .bias-label {
    font-size: 0.7rem;
    font-weight: 600;
  }
  
  .bias-label.left {
    text-align: left;
  }
  
  .bias-label.center {
    text-align: center;
  }
  
  .bias-label.right {
    text-align: right;
  }
  
  .bias-bars {
    display: flex;
    height: 8px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
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
  
  .bias-stats {
    display: flex;
    justify-content: space-between;
  }
  
  .stat-item {
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    .featured-article {
      height: 300px;
    }
    
    .title {
      font-size: 1.4rem;
    }
    
    .description {
      font-size: 0.9rem;
    }
  }
</style> 