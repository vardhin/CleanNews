<script>
  export let icon = null;
  export let text = '';
</script>

<div class="category-pill">
  {#if icon}
    <div class="icon">
      <svelte:component this={icon} size={16} />
    </div>
  {/if}
  <p>{text}</p>
</div>

<style>
  .category-pill {
    display: flex;
    height: 2rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    background-color: #e7edf3;
    padding-left: 0.5rem;
    padding-right: 1rem;
  }

  .icon {
    color: #0e141b;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  p {
    color: #0e141b;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: normal;
    margin: 0;
  }
</style> 