<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { setTheme } from '$lib/stores/theme';
  
  onMount(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  });
</script>

<slot /> 