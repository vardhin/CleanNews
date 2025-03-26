<script>
  import Navbar from '$lib/components/Navbar.svelte';
  
  // Sample data for the page
  const articleData = {
    title: "Navigating the Political Landscape: A CleanNews Analysis of Current Affairs",
    introduction: "In a world increasingly divided by ideological lines, it's crucial to understand the nuances of political discourse. At CleanNews, we strive to present news from diverse perspectives, allowing readers to form their own informed opinions. Our analysis of current events considers the spectrum of political thought, recognizing that complex issues rarely have simple solutions. We believe in the power of informed discussion and aim to foster a community where differing viewpoints can coexist and enrich our understanding of the world.",
    publisher: {
      name: "Civic Voice",
      description: "Civic Voice is dedicated to promoting civic engagement and providing comprehensive analysis of political events. They strive to present information in a neutral and balanced manner, allowing readers to form their own informed opinions."
    },
    spectrum: {
      label: "Center-Right",
      percentage: 65
    },
    alignment: {
      left: 5,
      center: 8,
      right: 3
    },
    relatedArticles: [
      {
        title: "The Economic Impact of Policy Changes",
        description: "An analysis of how recent policy shifts affect the economy.",
        image: "https://example.com/economy-image.jpg"
      },
      {
        title: "Healthcare Reform Debates",
        description: "A balanced look at different proposals for healthcare reform.",
        image: "https://example.com/healthcare-image.jpg"
      }
    ],
    moreArticles: [
      {
        title: "Understanding Global Trade Agreements",
        description: "A detailed examination of international trade deals and their implications.",
        image: "https://example.com/trade-image.jpg"
      },
      {
        title: "Environmental Policies Across the Globe",
        description: "A comparative study of environmental initiatives in different countries.",
        image: "https://example.com/environment-image.jpg"
      }
    ]
  };
</script>

<Navbar />

<main class="article-container">
  <article class="article">
    <h1>{articleData.title}</h1>
    
    <p class="introduction">{articleData.introduction}</p>
    
    <section class="publisher-section">
      <h2>Publisher: {articleData.publisher.name}</h2>
      <p>{articleData.publisher.description}</p>
    </section>
    
    <section class="political-spectrum">
      <h2>Political Spectrum Analysis</h2>
      <div class="spectrum-label">{articleData.spectrum.label}</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: {articleData.spectrum.percentage}%"></div>
      </div>
      <div class="percentage">{articleData.spectrum.percentage}%</div>
    </section>
    
    <section class="author-alignment">
      <h2>Author Alignment</h2>
      <div class="alignment-boxes">
        <div class="alignment-box">
          <div class="alignment-label">Left</div>
          <div class="alignment-value">{articleData.alignment.left}</div>
        </div>
        <div class="alignment-box">
          <div class="alignment-label">Center</div>
          <div class="alignment-value">{articleData.alignment.center}</div>
        </div>
        <div class="alignment-box">
          <div class="alignment-label">Right</div>
          <div class="alignment-value">{articleData.alignment.right}</div>
        </div>
      </div>
    </section>
    
    <section class="similar-articles">
      <h2>Similar Articles</h2>
      <div class="articles-grid">
        {#each articleData.relatedArticles as article}
          <div class="article-card">
            <div class="article-content">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <button class="read-more-btn">Read More</button>
            </div>
            <div class="article-image" style="background-image: url('{article.image}')"></div>
          </div>
        {/each}
      </div>
    </section>
    
    <section class="more-articles">
      <h2>More Articles by Authors</h2>
      <div class="articles-grid">
        {#each articleData.moreArticles as article}
          <div class="article-card">
            <div class="article-content">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <button class="read-more-btn">Read More</button>
            </div>
            <div class="article-image" style="background-image: url('{article.image}')"></div>
          </div>
        {/each}
      </div>
    </section>
  </article>
</main>

<style>
  .article-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Newsreader', 'Noto Sans', serif;
    background-color: var(--color-background);
    color: var(--color-text-dark);
  }
  
  .article {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text-dark);
    margin: 0;
  }
  
  .introduction {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--color-text-light);
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-dark);
    margin: 0 0 1rem 0;
  }
  
  section {
    margin-bottom: 2rem;
  }
  
  .publisher-section p {
    color: var(--color-text-light);
    line-height: 1.6;
  }
  
  .political-spectrum {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .spectrum-label {
    font-weight: 500;
    color: var(--color-text-light);
  }
  
  .progress-bar-container {
    height: 10px;
    background-color: var(--color-element);
    border-radius: 999px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #3182ce;
    border-radius: 999px;
  }
  
  .percentage {
    align-self: flex-end;
    font-size: 0.9rem;
    color: var(--color-text-light);
  }
  
  .alignment-boxes {
    display: flex;
    gap: 1rem;
  }
  
  .alignment-box {
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--color-card-bg);
  }
  
  .alignment-label {
    font-size: 1rem;
    color: var(--color-text-light);
    margin-bottom: 0.5rem;
  }
  
  .alignment-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text-dark);
  }
  
  .articles-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .article-card {
    display: flex;
    border-radius: 0.5rem;
    overflow: hidden;
    gap: 1.5rem;
    background-color: var(--color-card-bg);
    padding: 1rem;
    border: 1px solid var(--color-border);
  }
  
  .article-content {
    flex: 3;
  }
  
  .article-content h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--color-text-dark);
  }
  
  .article-content p {
    color: var(--color-text-light);
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .read-more-btn {
    background-color: var(--color-btn-bg);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-dark);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .read-more-btn:hover {
    background-color: var(--color-element);
  }
  
  .article-image {
    flex: 2;
    background-size: cover;
    background-position: center;
    min-height: 150px;
    border-radius: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .article-card {
      flex-direction: column;
    }
    
    .alignment-boxes {
      flex-direction: column;
    }
    
    .article-container {
      padding: 1rem;
    }
  }
</style>
