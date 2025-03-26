<script>
  import { ArrowRight } from 'lucide-svelte';
  export let title = '';
  export let description = '';
  export let imageUrl = '';
</script>

<div class="news-article">
  <div class="content">
    <div class="text-content">
      <h3 class="title">{title}</h3>
      <p class="description">{description}</p>
    </div>
    <button class="read-more-btn">
      <span>Read more</span>
      <ArrowRight size={16} />
    </button>
  </div>
  <div class="image" style="background-image: url('{imageUrl}');"></div>
</div>

<style>
  .news-article {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 1.5rem;
    border-radius: 1rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.18);
    transition: all 0.3s ease;
  }

  .news-article:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.2);
  }

  .content {
    display: flex;
    flex: 2 2 0px;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.25rem;
  }

  .text-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title {
    color: #0e141b;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }

  .description {
    color: #4e7397;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    margin: 0;
    opacity: 0.9;
  }

  .read-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 2.25rem;
    padding: 0 1.25rem;
    border-radius: 0.5rem;
    background-color: rgba(231, 237, 243, 0.6);
    color: #0e141b;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    width: fit-content;
  }

  .read-more-btn:hover {
    background-color: rgba(216, 224, 234, 0.8);
    transform: translateY(-1px);
  }

  .image {
    flex: 1;
    max-width: 40%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }

  @media (max-width: 640px) {
    .news-article {
      flex-direction: column-reverse;
      padding: 1rem;
    }
    
    .image {
      max-width: 100%;
      aspect-ratio: 16/9;
    }
  }
</style> 