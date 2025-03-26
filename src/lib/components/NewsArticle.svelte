<script>
  export let title = '';
  export let description = '';
  export let imageUrl = '';
</script>

<div class="news-article">
  <div class="content">
    <div class="text-content">
      <p class="title">{title}</p>
      <p class="description">{description}</p>
    </div>
    <button class="read-more-btn">
      <span>Read more</span>
    </button>
  </div>
  <div class="image" style="background-image: url('{imageUrl}');"></div>
</div>

<style>
  .news-article {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 1rem;
    border-radius: 0.5rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .news-article:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  }

  .content {
    display: flex;
    flex: 2 2 0px;
    flex-direction: column;
    gap: 1rem;
  }

  .text-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .title {
    color: #0e141b;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
  }

  .description {
    color: #4e7397;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: normal;
    margin: 0;
  }

  .read-more-btn {
    display: flex;
    min-width: 5.25rem;
    max-width: 30rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 0.5rem;
    height: 2rem;
    padding: 0 1rem;
    flex-direction: row-reverse;
    background-color: #e7edf3;
    color: #0e141b;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: normal;
    width: fit-content;
    border: none;
    transition: background-color 0.2s ease;
  }

  .read-more-btn:hover {
    background-color: #d8e0ea;
  }

  .image {
    width: 100%;
    background-position: center;
    background-repeat: no-repeat;
    aspect-ratio: 16/9;
    background-size: cover;
    border-radius: 0.5rem;
    flex: 1;
  }
</style> 