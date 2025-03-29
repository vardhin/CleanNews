<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { Search, Sun, Moon } from 'lucide-svelte';
  import { theme, toggleTheme } from '$lib/stores/theme';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  
  const dispatch = createEventDispatcher();
  
  // Menu items
  const mainMenu = [
    { name: 'Home', url: '/' },
    { name: 'For You', url: '/for-you' },
    { name: 'Local', url: '/local' },
    { name: 'Blindspot', url: '/blindspot' }
  ];

  let searchQuery = '';
  
  // Handle search submission
  function handleSearch(event) {
    if (event.type === 'keyup' && event.key !== 'Enter') return;
    
    if (searchQuery.trim()) {
      // Dispatch search event up to parent component
      dispatch('search', { query: searchQuery.trim() });
    }
  }

  // Apply theme on component mount
  onMount(() => {
    // Set data-theme attribute on document element
    if (browser) {
      document.documentElement.setAttribute('data-theme', $theme);
    }
  });
</script>

<header class="navbar">
  <div class="container">
    <!-- Main navigation -->
    <div class="main-nav">
      <div class="logo">
        <a href="/">CLEAN NEWS</a>
      </div>
      
      <nav class="primary-nav">
        {#each mainMenu as item}
          <a href={item.url} class="nav-item">{item.name}</a>
        {/each}
      </nav>
      
      <div class="actions">
        <div class="search-container">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search" 
              bind:value={searchQuery}
              on:keyup={handleSearch}
            />
            <button class="search-icon" on:click={handleSearch} aria-label="Search">
              <Search size={16} />
            </button>
          </div>
        </div>
        
        <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
          {#if $theme === 'light'}
            <Moon size={18} />
          {:else}
            <Sun size={18} />
          {/if}
        </button>
      </div>
    </div>
  </div>
</header>

<style>
  .navbar {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-family: sans-serif;
    color: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease;
  }
  
  :global([data-theme="light"]) .navbar {
    background-color: rgba(255, 255, 255, 0.8);
    color: #1a1a1a;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 1px;
  }
  
  .logo a {
    color: inherit;
    text-decoration: none;
  }
  
  .primary-nav {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-item {
    color: inherit;
    text-decoration: none;
    font-size: 0.9rem;
    position: relative;
  }
  
  .nav-item:hover {
    text-decoration: none;
  }
  
  .nav-item:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -5px;
    left: 0;
    background-color: currentColor;
    transition: width 0.3s ease;
  }
  
  .nav-item:hover:after {
    width: 100%;
  }
  
  .actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .search-container {
    position: relative;
    width: 220px;
  }
  
  .search-input-wrapper {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    transition: all 0.3s ease;
  }
  
  :global([data-theme="light"]) .search-input-wrapper {
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .search-input-wrapper:focus-within {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  }
  
  :global([data-theme="light"]) .search-input-wrapper:focus-within {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
  
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: inherit;
    font-size: 0.9rem;
    padding: 0.25rem;
    width: 100%;
  }
  
  input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  :global([data-theme="light"]) input::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
  
  input:focus {
    outline: none;
  }
  
  .search-icon {
    display: flex;
    align-items: center;
    color: inherit;
    opacity: 0.6;
    margin-left: 0.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  
  .search-icon:hover {
    opacity: 1;
  }
  
  .theme-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: inherit;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  :global([data-theme="light"]) .theme-toggle {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  :global([data-theme="light"]) .theme-toggle:hover {
    background: rgba(0, 0, 0, 0.1);
  }
</style> 