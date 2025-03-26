<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { Search, Home, Database, Sun, Moon } from 'lucide-svelte';
  import { theme, toggleTheme } from '$lib/stores/theme';
  
  const dispatch = createEventDispatcher();
  
  // Initialize theme on mount
  onMount(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  });
</script>

<header class="navbar">
  <div class="navbar-brand">
    <div class="logo">
      <Database size={20} />
    </div>
    <h2>CleanNews</h2>
  </div>
  <div class="navbar-actions">
    <form class="search-container" on:submit|preventDefault>
      <div class="search-input-wrapper">
        <div class="search-icon">
          <Search size={18} />
        </div>
        <input type="text" placeholder="Search articles..." />
      </div>
    </form>
    <a href="/" class="home-button">
      <Home size={18} />
      <span>Home</span>
    </a>
    
    <!-- Theme toggle button -->
    <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
      {#if $theme === 'light'}
        <Moon size={18} />
      {:else}
        <Sun size={18} />
      {/if}
    </button>
  </div>
</header>

<style>
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
    padding: 0.75rem 2.5rem;
    font-family: 'Newsreader', 'Noto Sans', sans-serif;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(231, 237, 243, 0.8);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #0e141b;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0e141b;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.015em;
    margin: 0;
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1.25rem;
  }

  .search-container {
    position: relative;
    width: 16rem;
  }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    background-color: rgba(231, 237, 243, 0.8);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .search-input-wrapper:focus-within {
    background-color: rgba(231, 237, 243, 1);
    box-shadow: 0 0 0 2px rgba(14, 20, 27, 0.1);
  }

  .search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 0.75rem;
    color: #4e7397;
  }

  input {
    flex: 1;
    height: 2.5rem;
    border: none;
    background: transparent;
    padding: 0 0.75rem;
    font-size: 0.95rem;
    color: #0e141b;
    width: 100%;
  }

  input::placeholder {
    color: #4e7397;
  }

  input:focus {
    outline: none;
  }

  .home-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: rgba(231, 237, 243, 0.8);
    color: #0e141b;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.2s ease;
    border: none;
    height: 2.5rem;
  }

  .home-button:hover {
    background-color: rgba(231, 237, 243, 1);
    transform: translateY(-1px);
  }

  .profile-avatar {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .profile-avatar:hover {
    transform: scale(1.05);
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    background-color: rgba(231, 237, 243, 0.8);
    color: #0e141b;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .theme-toggle:hover {
    background-color: rgba(231, 237, 243, 1);
    transform: translateY(-1px);
  }
  
  :global([data-theme="dark"]) {
    --color-background: #0e141b;
    --color-text-dark: #f8fafc;
    --color-text-light: #a3c0dd;
    --color-element: #1d2935;
  }
  
  :global([data-theme="dark"]) .navbar {
    background: rgba(29, 41, 53, 0.65);
    border-bottom: 1px solid rgba(45, 55, 72, 0.8);
  }
  
  :global([data-theme="dark"]) .navbar-brand,
  :global([data-theme="dark"]) .logo,
  :global([data-theme="dark"]) h2 {
    color: #f8fafc;
  }
  
  :global([data-theme="dark"]) .search-input-wrapper,
  :global([data-theme="dark"]) .home-button,
  :global([data-theme="dark"]) .theme-toggle {
    background-color: rgba(45, 55, 72, 0.8);
    color: #f8fafc;
  }
  
  :global([data-theme="dark"]) .search-input-wrapper:focus-within {
    background-color: rgba(45, 55, 72, 1);
    box-shadow: 0 0 0 2px rgba(240, 240, 250, 0.1);
  }
  
  :global([data-theme="dark"]) input {
    color: #f8fafc;
  }
  
  :global([data-theme="dark"]) input::placeholder {
    color: #a3c0dd;
  }
  
  :global([data-theme="dark"]) .home-button:hover,
  :global([data-theme="dark"]) .theme-toggle:hover {
    background-color: rgba(45, 55, 72, 1);
  }
</style> 