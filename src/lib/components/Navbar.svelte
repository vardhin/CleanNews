<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { Search } from 'lucide-svelte';
  
  const dispatch = createEventDispatcher();
  
  // Menu items
  const mainMenu = [
    { name: 'Home', url: '/' },
    { name: 'For You', url: '/for-you' },
    { name: 'Local', url: '/local' },
    { name: 'Blindspot', url: '/blindspot' }
  ];
  
  // Categories menu
  const categories = [
    { name: 'Israel-Hamas Conflict', url: '/category/israel-hamas' },
    { name: 'EU', url: '/category/eu' },
    { name: 'Natural Disasters', url: '/category/natural-disasters' },
    { name: 'Social Media', url: '/category/social-media' },
    { name: 'Artificial Intelligence', url: '/category/ai' },
    { name: 'IT', url: '/category/it' },
    { name: 'European Union', url: '/category/european-union' },
    { name: 'Donald Trump', url: '/category/donald-trump' },
    { name: 'Taxes', url: '/category/taxes' },
    { name: 'Amazon', url: '/category/amazon' },
    { name: 'Baseball', url: '/category/baseball' }
  ];
</script>

<header class="navbar">
  <div class="container">
    <!-- Main navigation -->
    <div class="main-nav">
      <div class="logo">
        <a href="/">GROUND</a>
      </div>
      
      <nav class="primary-nav">
        {#each mainMenu as item}
          <a href={item.url} class="nav-item">{item.name}</a>
        {/each}
      </nav>
      
      <div class="search-container">
        <div class="search-input-wrapper">
          <input type="text" placeholder="Search" />
          <div class="search-icon">
            <Search size={16} />
          </div>
        </div>
      </div>
      
      <div class="auth-buttons">
        <button class="subscribe-btn">Subscribe</button>
        <button class="login-btn">Login</button>
      </div>
    </div>
    
    <!-- Category navigation -->
    <div class="category-nav">
      {#each categories as category}
        <a href={category.url} class="category-item">{category.name}</a>
      {/each}
    </div>
  </div>
</header>

<style>
  .navbar {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #1a1a1a;
    font-family: sans-serif;
    color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .main-nav {
    display: flex;
    align-items: center;
    padding: 0.8rem 0;
    justify-content: space-between;
    border-bottom: 1px solid #333;
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 1px;
  }
  
  .logo a {
    color: white;
    text-decoration: none;
  }
  
  .primary-nav {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-item {
    color: white;
    text-decoration: none;
    font-size: 0.9rem;
  }
  
  .nav-item:hover {
    text-decoration: underline;
  }
  
  .search-container {
    position: relative;
    width: 220px;
  }
  
  .search-input-wrapper {
    display: flex;
    align-items: center;
    background-color: #333;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
  }
  
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    font-size: 0.9rem;
    padding: 0.25rem;
    width: 100%;
  }
  
  input::placeholder {
    color: #aaa;
  }
  
  input:focus {
    outline: none;
  }
  
  .search-icon {
    display: flex;
    align-items: center;
    color: #aaa;
    margin-left: 0.25rem;
  }
  
  .auth-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .subscribe-btn, .login-btn {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .subscribe-btn {
    background-color: white;
    color: #1a1a1a;
  }
  
  .login-btn {
    background-color: transparent;
    color: white;
    border: 1px solid #555;
  }
  
  .category-nav {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .category-nav::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  .category-item {
    color: #ccc;
    text-decoration: none;
    font-size: 0.8rem;
    padding: 0.2rem 0;
    position: relative;
  }
  
  .category-item:hover {
    color: white;
  }
  
  /* Add a small dot after each category item except the last one */
  .category-item:not(:last-child)::after {
    content: "•";
    position: absolute;
    right: -0.6rem;
    color: #555;
  }
</style> 