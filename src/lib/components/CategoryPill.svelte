<script>
  export let text;
  export let active = false;
</script>

<div class="category-pill" class:active>
  <span class="text">{text}</span>
</div>

<style>
  .category-pill {
    cursor: pointer;
    display: flex;
    height: 2.5rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background-color: #e7edf3;
    padding: 0 1.25rem;
    transition: all 0.2s ease;
    position: relative;
    border: 1px solid transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .category-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #f0f5fa;
  }
  
  .category-pill.active {
    background-color: #f0f5fa;
    border-color: var(--accent-color, #0066cc);
  }
  
  .category-pill.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--accent-color, #0066cc);
  }

  .text {
    color: #0e141b;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  
  :global([data-theme="dark"]) .category-pill {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  :global([data-theme="dark"]) .category-pill:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  :global([data-theme="dark"]) .text {
    color: #ffffff;
  }
</style> 