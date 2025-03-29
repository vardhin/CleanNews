<script>
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import Carousel from '$lib/components/carousel.svelte';
    import { theme } from '$lib/stores/theme';
    
    // Get data from the page load function
    /** @type {import('./$types').PageData} */
    export let data;
    
    // Use API data instead of hardcoded
    const categories = data.categories || [];
    const newsByCategory = data.newsByCategory || {};
    const featuredNews = data.featuredNews || [];
    
    // Debug
    console.log("Featured News:", featuredNews);
    
    let activeCategory = categories.length > 0 ? categories[0] : "";
    let showNavbar = true;
    let lastScrollY = 0;
    let ticking = false;
    let hasScrolled = false;
    let isAtHero = true;  // Track if we're at hero section
    
    // Search state
    let isSearching = false;
    let searchQuery = '';
    let searchResults = [];
    let isSearchLoading = false;
    let searchError = null;
    
    // Handle search from navbar
    async function handleSearch(event) {
      searchQuery = event.detail.query;
      if (!searchQuery) return;
      
      isSearching = true;
      isSearchLoading = true;
      searchError = null;
      
      try {
        // Use a timeout to prevent hanging in case the server is down
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&limit=10`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Search request failed:', response.status, errorText);
          
          if (response.status === 404) {
            throw new Error('Search endpoint not found. Make sure the backend server is running.');
          } else {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        }
        
        searchResults = await response.json();
        isSearchLoading = false;
      } catch (error) {
        console.error('Search error:', error);
        
        if (error.name === 'AbortError') {
          searchError = 'Search request timed out. Backend server might not be running.';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          searchError = 'Cannot connect to the backend server. Please make sure it is running.';
        } else {
          searchError = error.message || 'Unknown error occurred';
        }
        
        isSearchLoading = false;
      }
    }
    
    // Clear search and return to normal view
    function clearSearch() {
      isSearching = false;
      searchQuery = '';
      searchResults = [];
      searchError = null;
    }
    
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
    
    function scrollToCategory(category) {
      activeCategory = category;
      const element = document.getElementById(category);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    // Function to find the current section in view
    function getCurrentSection() {
      const sections = categories.map(category => {
        const element = document.getElementById(category);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          category,
          top: rect.top,
          bottom: rect.bottom
        };
      }).filter(Boolean);

      // Find the first section that is currently in view
      const currentSection = sections.find(section => 
        section.top <= 150 && section.bottom > 150
      );

      return currentSection?.category || categories[0];
    }
    
    function handleScroll() {
      const currentScrollY = window.scrollY;
      hasScrolled = true;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Check if we're at the hero section (allowing some buffer)
          isAtHero = currentScrollY < 100;
          
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            // Scrolling down and not at the top
            showNavbar = false;
          } else {
            // Scrolling up or at the top
            showNavbar = true;
          }
          
          // Update active category based on scroll position
          activeCategory = getCurrentSection();
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    }
    
    // Setup scroll listener
    onMount(() => {
      window.addEventListener('scroll', handleScroll);
      return () => {
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
      gap: 1rem;
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 5;
      background: var(--glass-dark-bg);
      transition: all 0.3s ease;
      transform: translateY(0);
      opacity: 1;
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      justify-content: center;
      border-bottom: 1px solid var(--glass-border);
      box-shadow: 0 4px 12px var(--glass-shadow);
    }
    
    /* Hide pill container when navbar is showing AND user has scrolled AND not at hero */
    :global(.has-scrolled:not(.at-hero) .navbar-container:not(.navbar-hidden) + * + .pill-container) {
      transform: translateY(-100%);
      opacity: 0;
    }
    
    .pill {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.8rem;
      font-weight: 600;
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--text-primary);
      position: relative;
      overflow: hidden;
    }
    
    .pill::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--accent-color);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .pill:hover {
      background: var(--glass-bg);
      transform: translateY(-1px);
    }
    
    .pill.active {
      background: var(--glass-bg);
      border-color: var(--accent-color);
      color: var(--accent-color);
    }
    
    .pill.active::after {
      transform: scaleX(1);
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
    
    /* Search results styles */
    .search-section {
      padding: 40px 0;
    }
    
    .search-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .search-results-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .search-result-card {
      display: flex;
      padding: 16px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--card-bg);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .search-result-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
    
    .search-result-image {
      width: 180px;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 16px;
      flex-shrink: 0;
    }
    
    .search-result-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .search-result-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .search-result-summary {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    .search-result-meta {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    
    .btn-back {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--accent-color);
      color: var(--accent-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-back:hover {
      background: var(--accent-color);
      color: white;
    }
    
    .search-loading, .search-error {
      padding: 40px;
      text-align: center;
    }
    
    .search-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    
    .loader {
      width: 48px;
      height: 48px;
      border: 5px solid var(--glass-border);
      border-bottom-color: var(--accent-color);
      border-radius: 50%;
      animation: rotation 1s linear infinite;
    }
    
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
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
      
      .search-result-card {
        flex-direction: column;
      }
      
      .search-result-image {
        width: 100%;
        height: 200px;
        margin-right: 0;
        margin-bottom: 16px;
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
      
      .search-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
    
    @media (max-width: 400px) {
      .news-grid {
        column-count: 1;
      }
    }
    
    @media (max-width: 768px) {
      /* Mobile styles for other components */
    }
  </style>
  
  {#if categories.length > 0}
  <div class="app" class:has-scrolled={hasScrolled} class:at-hero={isAtHero}>
    <!-- Navbar -->
    <div class="navbar-container" class:navbar-hidden={!showNavbar}>
      <Navbar on:search={handleSearch} />
    </div>
    
    {#if isSearching}
      <!-- Search Results -->
      <section class="container search-section">
        <div class="search-info">
          <h2 class="text-2xl font-bold">Search Results for "{searchQuery}"</h2>
          <button class="btn-back" on:click={clearSearch}>
            Back to Home
          </button>
        </div>
        
        {#if isSearchLoading}
          <div class="search-loading">
            <div class="loader"></div>
            <p>Searching for articles...</p>
          </div>
        {:else if searchError}
          <div class="search-error glass-dark p-8 rounded-lg">
            <h3 class="text-xl font-semibold mb-4">Unable to complete search</h3>
            <p class="mb-4">{searchError}</p>
            <div class="search-troubleshoot">
              <h4 class="font-medium mb-2">Troubleshooting steps:</h4>
              <ul class="list-disc pl-5 space-y-1">
                <li>Check if the backend server is running</li>
                <li>Verify your internet connection</li>
                <li>Try searching for a different term</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>
          </div>
        {:else if searchResults.length === 0}
          <div class="search-error glass-dark p-6">
            <p class="mb-4">No articles found matching your search query "{searchQuery}".</p>
            <p class="text-sm text-gray-400">Note: Make sure the backend server is running with <code class="bg-black bg-opacity-30 px-1 py-0.5 rounded">npm run api</code> in the backend directory.</p>
          </div>
        {:else}
          <div class="search-results-list">
            {#each searchResults as article}
              <a href={article.link} class="search-result-card glass glow" target="_blank" rel="noopener noreferrer">
                <img 
                  src={article.image || "/placeholder.svg"} 
                  alt={article.title} 
                  class="search-result-image" 
                />
                <div class="search-result-content">
                  <h3 class="search-result-title">{article.title}</h3>
                  <p class="search-result-summary">{article.summary}</p>
                  <div class="search-result-meta">
                    <span>{article.category}</span>
                    <span>Source: {article.source}</span>
                  </div>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </section>
    {:else}
      <!-- Hero Section with Carousel -->
      <Carousel {featuredNews} />
      
      <!-- Category Pills (Sticky Navigation) -->
      <div class="pill-container glass-dark">
        {#each categories as category}
          <button 
            class="pill {activeCategory === category ? 'active' : ''}" 
            on:click={() => scrollToCategory(category)}
            aria-label="Navigate to {category} section">
            {category}
          </button>
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
    {/if}
  </div>
  {/if}