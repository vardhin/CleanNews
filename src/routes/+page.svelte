<script>
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import { theme } from '$lib/stores/theme';
    
    // Get data from the page load function
    /** @type {import('./$types').PageData} */
    export let data;
    
    // Use API data instead of hardcoded
    const categories = data.categories || [];
    const newsByCategory = data.newsByCategory || {};
    const featuredNews = data.featuredNews || [];
    
    // Create a flat array of featured articles for the carousel
    $: featuredNewsByCategory = categories
      .map(category => featuredNews.find(item => item.category === category))
      .filter(item => item);
    
    let currentSlide = 0;
    let activeCategory = categories.length > 0 ? categories[0] : "";
    let showNavbar = true;
    let lastScrollY = 0;
    let ticking = false;
    
    // Simplified card sizes for better balance
    const cardSizes = [
      { name: 'standard', cols: 4, rows: 2 },    // Standard 4:3 article card
      { name: 'wide', cols: 6, rows: 2 },        // Wide format for landscape images
      { name: 'square', cols: 4, rows: 3 },      // Square format for social media style images
    ];
    
    // Get optimal size based on image resolution
    async function getOptimalCardSize(imageUrl) {
      try {
        // Create a hidden image to check dimensions
        const img = new Image();
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = () => reject(new Error('Failed to load image'));
        });
        img.src = imageUrl;
        
        const { width, height } = await loadPromise;
        const aspectRatio = width / height;
        
        // Choose size based on aspect ratio
        if (aspectRatio > 1.5) return 'wide';          // Landscape images
        if (aspectRatio >= 0.9 && aspectRatio <= 1.1) return 'square';  // Square-ish images
        return 'standard';                             // Default to standard
      } catch (error) {
        console.error('Error determining image size:', error);
        return 'standard';  // Default size on error
      }
    }
    
    // Cache for image sizes to avoid recalculating
    const imageSizeCache = new Map();
    
    // Advanced placement algorithm - distributes sizes to minimize gaps
    function getOptimalLayout(itemCount, categoryName) {
      const totalColumns = 24;
      let result = [];
      let rowSum = 0;
      
      for (let i = 0; i < itemCount; i++) {
        // Default to standard size if we don't have image info yet
        let size = cardSizes.find(s => s.name === 'standard');
        
        // If we can't fit this size in current row, start new row
        if (rowSum + size.cols > totalColumns) {
          rowSum = 0;
        }
        
        result.push(size.name);
        rowSum += size.cols;
        
        // Reset row if it's full
        if (rowSum >= totalColumns - 3) {
          rowSum = 0;
        }
      }
      
      return result;
    }
    
    // Cache layouts for categories
    const categoryLayouts = {};
    
    // Get size for a news item based on the optimal layout
    function getCardSize(index, category) {
      // Lazily compute layouts for each category
      if (!categoryLayouts[category]) {
        const count = newsByCategory[category]?.length || 10;
        categoryLayouts[category] = getOptimalLayout(count, category);
      }
      
      return categoryLayouts[category][index % categoryLayouts[category].length];
    }
    
    function nextSlide() {
      currentSlide = (currentSlide + 1) % featuredNews.length;
    }
    
    function prevSlide() {
      currentSlide = (currentSlide - 1 + featuredNews.length) % featuredNews.length;
    }
    
    function scrollToCategory(category) {
      activeCategory = category;
      const element = document.getElementById(category);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    function handleScroll() {
      const currentScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            // Scrolling down and not at the top
            showNavbar = false;
          } else {
            // Scrolling up or at the top
            showNavbar = true;
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    }
    
    // Auto-advance carousel and setup scroll listener
    onMount(() => {
      const carouselInterval = setInterval(nextSlide, 5000);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        clearInterval(carouselInterval);
        window.removeEventListener('scroll', handleScroll);
      };
    });
  </script>
  
  <style>
    :global(body) {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      overflow-x: hidden;
      scroll-behavior: smooth;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    :global([data-theme="dark"]) {
      --bg-primary: #121212;
      --bg-secondary: #1e1e1e;
      --text-primary: #ffffff;
      --text-secondary: #b0b0b0;
      --accent-color: #64ffda;
      --card-bg: rgba(15, 15, 15, 0.7);
      --card-bg-hover: rgba(25, 25, 25, 0.8);
      --card-border: rgba(255, 255, 255, 0.05);
      --glass-bg: rgba(15, 15, 15, 0.7);
      --glass-dark-bg: rgba(5, 5, 5, 0.85);
      --glass-border: rgba(255, 255, 255, 0.05);
      --glass-shadow: rgba(0, 0, 0, 0.3);
      --pill-active-bg: rgba(255, 255, 255, 0.1);
      --pill-active-shadow: rgba(255, 255, 255, 0.1);
      --gradient-overlay: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
      --about-gradient: linear-gradient(45deg, rgba(20, 20, 20, 0.7), rgba(5, 5, 5, 0.7));
    }
    
    :global([data-theme="light"]) {
      --bg-primary: #f5f5f5;
      --bg-secondary: #ffffff;
      --text-primary: #121212;
      --text-secondary: #555555;
      --accent-color: #0066cc;
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
    
    :global(body) {
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }
    
    .container {
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* Glassmorphism styles */
    .glass {
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px var(--glass-shadow);
      transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .glass-dark {
      background: var(--glass-dark-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px var(--glass-shadow);
      transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    /* Sharp edges and cuts */
    .sharp-edge {
      clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);
    }
    
    .sharp-edge-reverse {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 85%);
    }
    
    .sharp-card {
      border-radius: 4px;
      overflow: hidden;
    }
    
    /* Glow effects */
    .glow {
      box-shadow: 0 0 15px var(--glass-shadow);
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }
    
    .glow:hover {
      box-shadow: 0 0 25px var(--glass-shadow);
    }
    
    /* Hero carousel */
    .carousel {
      position: relative;
      height: 70vh;
      min-height: 500px;
      overflow: hidden;
    }
    
    .carousel-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .carousel-slide.active {
      opacity: 1;
    }
    
    .carousel-content {
      padding: 4rem;
      z-index: 2;
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .carousel-image {
      position: relative;
      height: 100%;
      overflow: hidden;
    }
    
    .carousel-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .carousel-fade {
      position: absolute;
      top: 0;
      left: -50%;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, var(--bg-primary) 0%, transparent 100%);
      z-index: 1;
    }
    
    .carousel-title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      background: linear-gradient(120deg, var(--accent-color), var(--text-primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .carousel-excerpt {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .carousel-nav {
      position: absolute;
      bottom: 30px;
      right: 40px;
      z-index: 3;
      display: flex;
      gap: 15px;
    }
    
    .nav-button {
      width: 50px;
      height: 50px;
      background: var(--glass-dark-bg);
      border: 1px solid var(--glass-border);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.3s ease;
    }
    
    .nav-button:hover {
      background: var(--glass-bg);
    }
    
    /* Navbar transition */
    .navbar-container {
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: transform 0.3s ease;
    }
    
    .navbar-hidden {
      transform: translateY(-100%);
    }
    
    /* Category pills */
    .pill-container {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 20px 0;
      scrollbar-width: none;
      position: sticky;
      top: 0;
      z-index: 5;
      background: var(--glass-dark-bg);
      transition: top 0.3s ease, background-color 0.3s ease;
    }
    
    /* When navbar is hidden, adjust pill container top position */
    :global(.navbar-hidden) + .pill-container {
      top: 0;
    }
    
    .pill-container::-webkit-scrollbar {
      display: none;
    }
    
    .pill {
      padding: 10px 25px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .pill.active {
      background: var(--pill-active-bg);
      box-shadow: 0 0 15px var(--pill-active-shadow);
    }
    
    /* Pinterest-style masonry layout */
    .news-grid {
      column-count: 6;
      column-gap: 8px;
      margin: 10px 0;
      width: 100%;
    }
    
    /* Base news card styles */
    .news-card {
      break-inside: avoid;
      margin-bottom: 8px;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-radius: 4px;
      cursor: pointer;
      display: inline-block;
      width: 100%;
    }
    
    .news-card:hover {
      transform: translateY(-3px);
    }
    
    /* Card variations */
    .news-card.standard {
      min-height: 280px;
    }
    
    .news-card.wide {
      min-height: 220px;
    }
    
    .news-card.square {
      min-height: 340px;
    }
    
    .news-card-image {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }
    
    .news-card-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%);
      z-index: 1;
    }
    
    .news-card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 12px 10px;
      z-index: 2;
      color: #fff;
    }
    
    .news-card-content h3 {
      font-size: 0.85rem;
      margin-bottom: 4px;
      font-weight: 600;
      line-height: 1.2;
    }
    
    .news-card-content p {
      font-size: 0.75rem;
      opacity: 0.9;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.3;
    }
    
    /* News section */
    .news-section {
      padding: 40px 0;
      scroll-margin-top: 120px; /* Adjusted to account for navbar + pills */
    }
    
    /* About section */
    .about-section {
      padding: 100px 0;
      position: relative;
    }
    
    .about-content {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }
    
    .about-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--about-gradient);
      z-index: 1;
    }
    
    /* Button styling */
    .btn-primary {
      background-color: var(--accent-color);
      color: #ffffff;
      padding: 10px 20px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .btn-secondary {
      background-color: transparent;
      color: var(--text-primary);
      border: 1px solid;
      padding: 10px 20px;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    :global([data-theme="light"]) .btn-secondary {
      border-color: var(--text-primary);
    }

    :global([data-theme="dark"]) .btn-secondary {
      border-color: #ffffff;
      color: #ffffff;
    }
    
    /* Responsive adjustments */
    @media (max-width: 1400px) {
      .news-grid {
        column-count: 5;
      }
    }
    
    @media (max-width: 1200px) {
      .news-grid {
        column-count: 4;
      }
    }
    
    @media (max-width: 900px) {
      .news-grid {
        column-count: 3;
      }
    }
    
    @media (max-width: 600px) {
      .news-grid {
        column-count: 2;
        column-gap: 6px;
      }
      
      .news-card {
        margin-bottom: 6px;
      }
    }
    
    @media (max-width: 400px) {
      .news-grid {
        column-count: 1;
      }
    }
    
    @media (max-width: 768px) {
      .carousel-slide {
        grid-template-columns: 1fr;
      }
      
      .carousel-image {
        display: none;
      }
      
      .carousel-content {
        padding: 2rem;
      }
      
      .carousel-title {
        font-size: 2rem;
      }
      
      .carousel-excerpt {
        font-size: 1rem;
      }
    }

    .carousel-category {
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--accent-color);
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }
  </style>
  
  <div class="app">
    <!-- Navbar -->
    <div class="navbar-container" class:navbar-hidden={!showNavbar}>
      <Navbar />
    </div>
    
    <!-- Hero Section with Carousel -->
    <section class="carousel">
      {#each featuredNews as item, index}
        <div class="carousel-slide {index === currentSlide ? 'active' : ''}">
          <div class="carousel-content glass-dark sharp-edge">
            <div class="carousel-category">{item.category}</div>
            <h1 class="carousel-title">{item.keyInsights}</h1>
            <p class="carousel-excerpt">{item.comprehensiveSummary}</p>
            <a href={`/article/${item.category}/${item.serialNumbers[0]}`} class="btn-primary sharp-edge-reverse">
              Read More
            </a>
          </div>
          <div class="carousel-image">
            <img src={item.imageUrl} alt={item.keyInsights} />
            <div class="carousel-fade"></div>
          </div>
        </div>
      {/each}
      <div class="carousel-nav">
        <button class="nav-button" on:click={prevSlide}>←</button>
        <button class="nav-button" on:click={nextSlide}>→</button>
      </div>
    </section>
    
    <!-- Category Pills (Sticky Navigation) -->
    <div class="pill-container">
      {#each categories as category}
        <div 
          class="pill glass {activeCategory === category ? 'active' : ''}" 
          on:click={() => scrollToCategory(category)}>
          {category}
        </div>
      {/each}
    </div>
    
    <!-- All News Sections -->
    {#each categories as category}
      <section id={category} class="container news-section">
        <h2 class="text-3xl font-bold mb-8 capitalize">{category}</h2>
        
        <!-- News Grid -->
        <div class="news-grid">
          {#if newsByCategory[category]}
            {#each newsByCategory[category] as item, i}
              {@const sizeName = item.size || getCardSize(i, category)}
              <a href={item.link} 
                 class="news-card glass glow {sizeName}"
                 target="_blank"
                 rel="noopener noreferrer">
                <img src={item.image || item.imageUrl || "/placeholder.svg"} 
                     alt={item.title} 
                     class="news-card-image"
                     on:load={async (e) => {
                       if (!item.size && (item.image || item.imageUrl)) {
                         // Set natural image dimensions
                         const img = e.target;
                         const ratio = img.naturalWidth / img.naturalHeight;
                         img.style.height = ratio < 1 ? '340px' : ratio > 1.5 ? '220px' : '280px';
                         item.size = await getOptimalCardSize(item.image || item.imageUrl);
                       }
                     }} />
                <div class="news-card-overlay"></div>
                <div class="news-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.excerpt || item.summary}</p>
                </div>
              </a>
            {/each}
          {:else}
            <p>No articles available for this category.</p>
          {/if}
        </div>
      </section>
    {/each}
    
    <!-- About Us Section -->
    <section class="about-section">
      <div class="about-bg"></div>
      <div class="container about-content">
        <div class="glass-dark p-12 sharp-edge glow">
          <h2 class="text-3xl font-bold mb-6">About GROUND News</h2>
          <p class="text-lg mb-6">
            GROUND News leverages cutting-edge artificial intelligence to curate and deliver the most relevant news tailored to your interests. Our proprietary algorithms analyze thousands of sources in real-time, ensuring you stay informed with high-quality, verified information.
          </p>
          <p class="text-lg mb-6">
            Founded in 2025 by a team of AI researchers and journalism experts, we're committed to combating misinformation while providing personalized news experiences that expand your perspective rather than limiting it.
          </p>
          <div class="flex gap-4 mt-8">
            <button class="btn-primary sharp-edge-reverse">
              Our Technology
            </button>
            <button class="btn-secondary">
              Meet The Team
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>