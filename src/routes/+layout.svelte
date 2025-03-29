<script>
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';
  
  // Initialize theme on app mount
  onMount(() => {
    if (browser) {
      // Apply stored theme to document
      document.documentElement.setAttribute('data-theme', $theme);
    }
  });
</script>

<slot />

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(html), :global(body) {
    height: 100%;
    width: 100%;
  }
</style> 