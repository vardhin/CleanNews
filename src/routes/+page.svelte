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
    
    // Function to parse simple markdown syntax
    function parseMarkdown(text) {
        if (!text) return '';
        
        // Bold - replace **text** with <strong>text</strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic - replace *text* with <em>text</em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Links - replace [text](url) with <a href="url">text</a>
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        return text;
    }
    
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
      --bg-secondary: #000000;
      --bg-primary: #090909;
      --text-primary: #ffffff;
      --text-secondary: #b0b0b0;
      --accent-color: #0066cc;
      --accent-color-rgb: 100, 255, 218;
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
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px var(--glass-shadow);
      transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .glass-dark {
      background: var(--glass-dark-bg);
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
      gap: 0.75rem;
      padding: 1rem 1.2rem;
      position: sticky;
      top: 0;
      z-index: 50000;
      background: var(--glass-dark-bg);
      transition: all 0.3s ease;
      transform: translateY(0);
      opacity: 1;
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      justify-content: flex-start;
      border-bottom: 1px solid var(--glass-border);
      box-shadow: 0 4px 12px var(--glass-shadow);
      overflow-x: auto;
      scrollbar-width: none; /* Hide scrollbar for Firefox */
    }
    
    .pill-container::-webkit-scrollbar {
      display: none; /* Hide scrollbar for Chrome/Safari/Edge */
    }
    
    /* Hide pill container when navbar is showing AND user has scrolled AND not at hero */
    :global(.has-scrolled:not(.at-hero) .navbar-container:not(.navbar-hidden) + * + .pill-container) {
      transform: translateY(-100%);
      opacity: 0;
    }
    
    .pill {
      padding: 0.65rem 1.25rem;
      border-radius: 1.2rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.8rem;
      font-weight: 500;
      background: var(--bg-secondary);
      color: var(--text-primary);
      position: relative;
      white-space: nowrap;
      border: none;
    }
    
    .pill::after {
      content: none;
    }
    
    .pill:hover {
      background: var(--accent-color);
      color: white;
      transform: translateY(-1px);
    }
    
    .pill.active {
      background: var(--accent-color);
      color: white;
    }
    
    .pill.active::after {
      transform: none;
    }
    
    /* Pinterest-style masonry layout */
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      grid-gap: 16px;
      grid-auto-rows: 5px; /* Smaller grid rows for finer granularity */
      margin: 20px 0 30px;
      width: 100%;
      padding: 5px; /* Add slight padding to avoid edge alignment issues */
    }
    
    /* Container for the grid to add subtle visual framing */
    .grid-container {
      position: relative;
      padding: 8px;
      border-radius: 10px;
      background-color: var(--bg-secondary);
      box-shadow: inset 0 0 20px var(--glass-shadow);
    }
    
    /* Base news card styles */
    .news-card {
      grid-row-end: span 20; /* Default span, will be adjusted dynamically */
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      height: 100%;
      display: block;
      backface-visibility: hidden;
      transform: perspective(1000px) translateZ(0);
      z-index: 1;
    }
    
    /* Clean up pseudo elements for more reliable effect */
    .news-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      border: 2px solid transparent;
    }
    
    .news-card:hover::before {
      opacity: 1;
      border: 2px solid var(--accent-color);
      box-shadow: 0 0 20px rgba(var(--accent-color-rgb), 0.5);
    }
    
    /* Clean simple 3D transform on hover */
    .news-card:hover {
      transform: perspective(1000px) translateY(-15px) translateZ(30px) rotateX(5deg);
      box-shadow: 
        0 20px 30px -10px rgba(0, 0, 0, 0.3),
        0 0 10px rgba(var(--accent-color-rgb), 0.2);
      z-index: 10;
    }
    
    /* Maintain the linear gradient underline */
    .news-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(
        90deg, 
        transparent 0%, 
        var(--accent-color) 50%, 
        transparent 100%
      );
      transform: scaleX(0);
      transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      z-index: 3;
    }
    
    .news-card:hover::after {
      transform: scaleX(1);
    }
    
    /* Improve image transition */
    .news-card-image {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: block;
      object-fit: cover;
      object-position: center center;
      z-index: 0;
      transition: transform 0.5s ease, filter 0.5s ease;
    }
    
    .news-card:hover .news-card-image {
      transform: scale(1.1);
      filter: brightness(1.1) contrast(1.05);
    }
    
    /* Improve overlay effect */
    .news-card-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 70%;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%);
      z-index: 1;
      transition: all 0.4s ease;
    }
    
    .news-card:hover .news-card-overlay {
      height: 85%;
      opacity: 0.95;
      background: linear-gradient(to bottom, 
        rgba(0,0,0,0) 0%, 
        rgba(0,0,0,0.6) 40%,
        rgba(0,0,0,0.9) 100%);
    }
    
    /* Enhance content transition */
    .news-card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 12px 10px;
      z-index: 2;
      color: #fff;
      transition: all 0.4s ease;
    }
    
    .news-card:hover .news-card-content {
      transform: translateY(-5px);
      padding: 15px 12px;
    }
    
    /* News section */
    .news-section {
      padding: 60px 0;
      margin-bottom: 20px;
      scroll-margin-top: 120px; /* Adjusted to account for navbar + pills */
      position: relative;
      border-bottom: 1px solid var(--glass-border);
    }
    
    /* Add subtle background pattern to each section */
    .news-section::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(var(--glass-border) 1px, transparent 1px);
      background-size: 25px 25px;
      opacity: 0.1;
      pointer-events: none;
      z-index: -1;
    }
    
    /* Last section doesn't need bottom border */
    .news-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
    }
    
    /* Add more space to section headings */
    .news-section h2 {
      position: relative;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    
    /* Add decorative underline to section headings */
    .news-section h2::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background-color: var(--accent-color);
    }
    
    /* Search results styles with enhanced hover effects */
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
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                  box-shadow 0.4s ease, 
                  background 0.3s ease;
      position: relative;
      clip-path: polygon(
        0% 0%,          /* Top left */
        100% 0%,        /* Top right */
        100% 95%,       /* Bottom right with cut */
        95% 100%,       /* Cut corner */
        0% 100%         /* Bottom left */
      );
    }
    
    /* Animated gradient border */
    .search-result-card::before {
      content: '';
      position: absolute;
      inset: 0;
      padding: 2px; /* Border width */
      border-radius: 7px; /* Slightly less than the card's 8px radius */
      background: linear-gradient(
        135deg, 
        transparent 0%,
        transparent 80%,
        var(--accent-color) 100%
      );
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    
    .search-result-card:hover::before {
      opacity: 1;
    }
    
    .search-result-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        var(--accent-color) 50%, 
        transparent 100%);
      transform: scaleX(0);
      transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      z-index: 2;
    }
    
    .search-result-card:hover {
      transform: translateY(-5px) scale(1.01);
      box-shadow: 
        0 15px 30px rgba(var(--accent-color-rgb), 0.2),
        0 5px 15px rgba(0, 0, 0, 0.15);
      background: var(--card-bg-hover);
    }
    
    .search-result-card:hover::after {
      transform: scaleX(1);
    }
    
    .search-result-image {
      width: 180px;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 16px;
      flex-shrink: 0;
      transition: transform 0.6s ease, filter 0.4s ease;
      position: relative;
      clip-path: polygon(
        0% 0%,          /* Top left */
        100% 0%,        /* Top right */
        100% 90%,       /* Bottom right with cut */
        90% 100%,       /* Cut corner */
        0% 100%         /* Bottom left */
      );
    }
    
    .search-result-card:hover .search-result-image {
      transform: scale(1.05);
      filter: saturate(1.1) contrast(1.05);
    }
    
    .search-result-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
    }
    
    .search-result-card:hover .search-result-content {
      transform: translateX(5px);
    }
    
    .search-result-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
      position: relative;
      display: inline-block;
      transition: transform 0.3s ease;
    }
    
    .search-result-title::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -3px;
      width: 0;
      height: 2px;
      background-color: var(--accent-color);
      transition: width 0.3s ease;
    }
    
    .search-result-card:hover .search-result-title::after {
      width: 100%;
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
      border-radius: 0;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      z-index: 1;
      clip-path: polygon(
        0 0,           /* Top left */
        calc(100% - 10px) 0,  /* Top right with cut */
        100% 10px,     /* Top right corner cut */
        100% 100%,     /* Bottom right */
        10px 100%,     /* Bottom left with cut */
        0 calc(100% - 10px)   /* Bottom left corner cut */
      );
    }
    
    .btn-back::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--accent-color);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: -1;
    }
    
    .btn-back:hover {
      color: white;
      border-color: var(--accent-color);
    }
    
    .btn-back:hover::before {
      transform: translateX(0);
    }
    
    .btn-back:active {
      transform: translateY(2px);
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
      padding: 80px 0 100px;
      position: relative;
      margin-top: 60px;
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
      clip-path: polygon(0 5%, 100% 0, 100% 100%, 0 100%);
    }
    
    /* Add divider between last news section and about section */
    .about-section::before {
      content: "";
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--glass-border), transparent);
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
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    @media (max-width: 1200px) {
      .news-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (max-width: 900px) {
      .news-grid {
        grid-template-columns: repeat(2, 1fr);
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
    
    @media (max-width: 768px) {
      /* Mobile styles for other components */
      .pill-container {
        padding: 0.85rem 1rem;
        gap: 0.6rem;
      }
      
      .pill {
        padding: 0.55rem 1rem;
        font-size: 0.75rem;
      }
    }
    
    @media (max-width: 600px) {
      .news-grid {
        grid-template-columns: repeat(1, 1fr);
        grid-gap: 12px;
      }
      
      .news-card {
        margin-bottom: 0;
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
      /* Mobile styles for sections and spacing */
      .pill-container {
        padding: 0.85rem 1rem;
        gap: 0.6rem;
      }
      
      .pill {
        padding: 0.55rem 1rem;
        font-size: 0.75rem;
      }
      
      .news-section {
        padding: 40px 0;
      }
      
      .news-section h2 {
        font-size: 1.5rem;
      }
      
      .about-section {
        padding: 60px 0 80px;
        margin-top: 40px;
      }
    }
    
    @media (max-width: 600px) {
      .news-grid {
        grid-template-columns: repeat(1, 1fr);
        grid-gap: 14px;
      }
      
      .grid-container {
        padding: 6px;
      }
      
      .news-card {
        margin-bottom: 0;
      }
      
      .search-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .news-section h2::after {
        width: 40px;
      }
    }
    
    @media (max-width: 400px) {
      .news-grid {
        column-count: 1;
        grid-gap: 12px;
        margin: 15px 0 20px;
      }
      
      .news-section {
        padding: 30px 0;
      }
    }

    /* Add highlight shine effect for card hover */
    @keyframes shine {
      0% {
        background-position: -100% 0;
      }
      100% {
        background-position: 250% 0;
      }
    }

    /* Add indicator icon for card links */
    .news-card-content::after {
      content: '→';
      position: absolute;
      right: 15px;
      bottom: 15px;
      font-size: 1.2rem;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    
    .news-card:hover .news-card-content::after {
      opacity: 0.8;
      transform: translateX(0);
    }
    
    /* Card variations - more random heights */
    .news-card.standard {
      min-height: 90px;
    }
    
    .news-card.wide {
      min-height: 70px;
    }
    
    .news-card.square {
      min-height: 110px;
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
                  <p class="search-result-summary">
                    {@html parseMarkdown(article.summary)}
                  </p>
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
          
          <!-- News Grid with container -->
          <div class="grid-container">
            <div class="news-grid">
              {#if newsByCategory[category]}
                {#each newsByCategory[category] as item, i}
                  {@const sizeName = item.size || getCardSize(i, category)}
                  {@const randomFactor = 0.7 + Math.random() * 0.6} 
                  <a href={item.link} 
                     class="news-card glass glow {sizeName}"
                     target="_blank"
                     rel="noopener noreferrer"
                     style="grid-row-end: span {Math.floor(15 + Math.random() * 15)}; --animation-order: {i};">
                    <img src={item.image || item.imageUrl || "/placeholder.svg"} 
                         alt={item.title} 
                         class="news-card-image"
                         on:load={(e) => {
                           // Calculate and set the grid row span based on image height with random variation
                           const img = e.target;
                           const cardElement = e.target.closest('.news-card');
                           if (cardElement) {
                             // Set fixed height based on random factor but maintain minimum
                             const baseHeight = 80 + Math.random() * 60;
                             const height = baseHeight * randomFactor;
                             
                             // Convert to grid rows and set
                             const rowSpan = Math.ceil(height / 5);
                             const finalSpan = Math.max(rowSpan, 15);
                             cardElement.style.gridRowEnd = `span ${finalSpan}`;
                             
                             // Apply slight random crop positioning
                             img.style.objectPosition = `center ${Math.random() * 30 + 35}%`;
                             
                             // Still keep optimal size calculation for styling purposes
                             if (!item.size && (item.image || item.imageUrl)) {
                               const ratio = img.naturalWidth / img.naturalHeight;
                               getOptimalCardSize(item.image || item.imageUrl).then(size => {
                                 item.size = size;
                               });
                             }
                           }
                         }} />
                    <div class="news-card-overlay"></div>
                    <div class="news-card-content">
                      <h3>{item.title}</h3>
                    </div>
                  </a>
                {/each}
              {:else}
                <p>No articles available for this category.</p>
              {/if}
            </div>
          </div>
        </section>
      {/each}
    {/if}
  </div>
  {/if}