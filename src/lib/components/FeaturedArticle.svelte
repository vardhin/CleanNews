<script>
  export let title = '';
  export let description = '';
  export let imageUrl = '';
</script>

<div class="featured-container">
  <div class="featured-article">
    <div class="featured-image" style="background-image: url('{imageUrl}');"></div>
    <div class="featured-content">
      <div class="text-content">
        <h1>{title}</h1>
        <h2>{description}</h2>
      </div>
      <button class="read-button">
        <span>Read Now</span>
      </button>
    </div>
  </div>
</div>

<style>
  .featured-container {
    width: 100%;
  }

  .featured-article {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2.5rem 1rem;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 0.75rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }

  .featured-image {
    width: 100%;
    background-position: center;
    background-repeat: no-repeat;
    aspect-ratio: 16/9;
    background-size: cover;
    border-radius: 0.5rem;
  }

  .featured-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .text-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  h1 {
    color: #0e141b;
    font-size: 2.25rem;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.033em;
    margin: 0;
  }

  h2 {
    color: #0e141b;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: normal;
    margin: 0;
  }

  .read-button {
    display: flex;
    min-width: 5.25rem;
    max-width: 30rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 0.5rem;
    height: 2.5rem;
    padding: 0 1rem;
    background-color: #1980e6;
    color: #f8fafc;
    font-size: 0.875rem;
    font-weight: 700;
    line-height: normal;
    letter-spacing: 0.015em;
    border: none;
    transition: background-color 0.2s ease;
  }

  .read-button:hover {
    background-color: #1670cc;
  }

  @media (min-width: 480px) {
    .featured-article {
      gap: 2rem;
    }

    h1 {
      font-size: 3rem;
    }

    h2 {
      font-size: 1rem;
    }

    .read-button {
      height: 3rem;
      padding: 0 1.25rem;
      font-size: 1rem;
    }
  }

  @media (min-width: 864px) {
    .featured-article {
      flex-direction: row;
    }

    .featured-image {
      width: 100%;
      min-width: 400px;
    }

    .featured-content {
      justify-content: center;
      min-width: 400px;
    }
  }
</style> 