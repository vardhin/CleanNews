<script>
  import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  // Add default empty array to prevent undefined errors
  export let articles = [];
  
  // Add a check to ensure we have at least one article
  $: if (articles.length === 0) {
    articles = [
      {
        title: 'Default Article Title',
        description: 'This is a placeholder for when no articles are provided.',
        imageUrl: '',
        stats: { leftAuthors: 0, rightAuthors: 0, centerAuthors: 0 }
      }
    ];
  }
  
  // Current article index
  let currentIndex = 0;
  let interval;
  
  // Enhanced navigation functions
  function previousArticle() {
    currentIndex = (currentIndex - 1 + articles.length) % articles.length;
    resetInterval();
  }
  
  function nextArticle() {
    currentIndex = (currentIndex + 1) % articles.length;
    resetInterval();
  }
  
  function goToArticle(index) {
    currentIndex = index;
    resetInterval();
  }
  
  // Reset interval helper
  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextArticle, 5000);
  }
  
  // Set up automatic rotation
  onMount(() => {
    interval = setInterval(nextArticle, 5000);
  });
  
  // Clean up interval on component destruction
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="featured-container">
  <!-- Add a condition to prevent error when articles[currentIndex] is undefined -->
  {#if articles && articles[currentIndex]}
    <div class="featured-article" style="background-image: url('{articles[currentIndex].imageUrl}');">
      <div class="overlay"></div>
      
      <!-- Navigation arrows -->
      <button class="nav-arrow left" on:click={previousArticle} aria-label="Previous article">
        <ChevronLeft size={28} />
      </button>
      
      <button class="nav-arrow right" on:click={nextArticle} aria-label="Next article">
        <ChevronRight size={28} />
      </button>
      
      <div class="featured-content" in:fade={{ duration: 400, easing: cubicOut }}>
        <!-- Left half: Article summary -->
        <div class="summary-section" in:slide={{ delay: 200, duration: 400, axis: 'x', easing: cubicOut }}>
          <div class="text-content">
            <h1>{articles[currentIndex].title}</h1>
            <h2>{articles[currentIndex].description}</h2>
          </div>
          <button class="read-button">
            <span>Read Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
        
        <!-- Right half: Statistics -->
        <div class="stats-section" in:slide={{ delay: 300, duration: 400, axis: 'x', easing: cubicOut }}>
          <h3>Author Distribution</h3>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-number">{articles[currentIndex].stats.leftAuthors}</span>
              <span class="stat-label">Left-Leaning<br>Authors</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">{articles[currentIndex].stats.centerAuthors}</span>
              <span class="stat-label">Centrist<br>Authors</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">{articles[currentIndex].stats.rightAuthors}</span>
              <span class="stat-label">Right-Leaning<br>Authors</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation dots -->
      <div class="navigation-dots">
        {#each articles as _, i}
          <button 
            class="dot {i === currentIndex ? 'active' : ''}" 
            on:click={() => goToArticle(i)}
            aria-label="Go to article {i + 1}"
          ></button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .featured-container {
    width: 80%;
    margin: 3rem auto;
  }

  .featured-article {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 650px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    transition: all 0.5s ease;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%);
    z-index: 1;
  }

  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.7;
  }
  
  .nav-arrow:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  
  .nav-arrow.left {
    left: 20px;
  }
  
  .nav-arrow.right {
    right: 20px;
  }

  .featured-content {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    z-index: 2;
    padding: 3.5rem;
  }

  .summary-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .text-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
  }

  h1 {
    color: #ffffff;
    font-size: 3rem;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.033em;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  h2 {
    color: #f0f0f0;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.6;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
  
  h3 {
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  .read-button {
    display: flex;
    width: fit-content;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    height: 3.25rem;
    padding: 0 1.75rem;
    background-color: #1980e6;
    color: #f8fafc;
    font-size: 1rem;
    font-weight: 700;
    line-height: normal;
    letter-spacing: 0.015em;
    border: none;
    transition: all 0.3s ease;
    gap: 0.5rem;
  }

  .read-button:hover {
    background-color: #1670cc;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  
  .stats-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 2.5rem;
    max-width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 0.75rem;
    padding: 1.75rem 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .stat-box:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  .stat-number {
    font-size: 2.75rem;
    font-weight: 900;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 0.75rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #f0f0f0;
    font-weight: 500;
  }
  
  .navigation-dots {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.75rem;
    z-index: 3;
    padding: 0.75rem 1.25rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 2rem;
  }
  
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .dot.active {
    background: #ffffff;
    transform: scale(1.2);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  @media (min-width: 864px) {
    .featured-article {
      height: 750px;
    }
    
    .featured-content {
      flex-direction: row;
      gap: 3.5rem;
    }
    
    .summary-section {
      flex: 1;
      margin-bottom: 0;
    }
    
    .stats-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      max-width: 450px;
    }
    
    h1 {
      font-size: 3.75rem;
    }
    
    h2 {
      font-size: 1.35rem;
    }
  }
  
  @media (max-width: 768px) {
    .featured-content {
      padding: 2rem;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    h1 {
      font-size: 2.5rem;
    }
    
    h2 {
      font-size: 1.1rem;
    }
    
    .nav-arrow {
      width: 40px;
      height: 40px;
    }
  }
</style> 