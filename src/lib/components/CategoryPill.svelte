<script>
  export let text;
</script>

<div class="category-pill">
  <span class="text">{text}</span>
</div>

<style>
  .category-pill {
    cursor: pointer;
    display: flex;
    height: 2rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background-color: #e7edf3;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .text {
    color: #0e141b;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: normal;
    margin: 0;
  }
</style> 