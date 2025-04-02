/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  try {
    console.log("Starting data load");
    
    // Fetch categories
    const categoriesResponse = await fetch('/api/categories');
    if (!categoriesResponse.ok) {
      console.error("Failed to fetch categories:", await categoriesResponse.text());
      throw new Error("Failed to fetch categories");
    }
    const categories = await categoriesResponse.json();
    console.log("Categories loaded:", categories);
    
    // Fetch all featured articles with related articles
    const featuredNews = [];
    
    try {
      const featuredResponse = await fetch('/api/featured');
      if (!featuredResponse.ok) {
        console.error("Failed to fetch featured articles:", await featuredResponse.text());
      } else {
        const allFeatured = await featuredResponse.json();
        console.log("All featured articles:", allFeatured);
        
        // If we have featured articles, try to get their related articles
        if (allFeatured && allFeatured.length > 0) {
          for (const featured of allFeatured) {
            try {
              const relatedResponse = await fetch(`/api/featured-with-related/${featured.category}`);
              if (!relatedResponse.ok) {
                console.error(`Failed to fetch related articles for ${featured.category}:`, await relatedResponse.text());
                continue;
              }
              
              const relatedData = await relatedResponse.json();
              console.log(`Related data for ${featured.category}:`, relatedData);
              
              // Only add if we have the related article data
              if (relatedData && relatedData.featuredArticle && relatedData.relatedArticles && relatedData.relatedArticles.length > 0) {
                // Ensure we have the necessary data structure for the carousel
                featuredNews.push({
                  // Preserve markdown formatting in key insights instead of stripping it
                  keyInsights: (featured.keyInsights || "Key Insights Not Available")
                    .replace(/\\n/g, ' ') // Keep line breaks but replace literal \n with spaces
                    .trim(),
                  comprehensiveSummary: featured.comprehensiveSummary || "Summary Not Available",
                  category: featured.category,
                  serialNumbers: featured.serialNumbers || [],
                  timestamp: featured.timestamp,
                  relatedArticles: relatedData.relatedArticles.map(article => ({
                    ...article,
                    // Ensure image is available for the carousel and use maximum quality version
                    image: article.image ? 
                      article.image
                        .replace(/w=800&q=60/, 'w=1920&q=100')
                        .replace(/w=1200&q=80/, 'w=1920&q=100')
                        .replace(/w=1600&q=100/, 'w=1920&q=100') : 
                      '/placeholder.svg'
                  }))
                });
              }
            } catch (error) {
              console.error(`Error processing related articles for ${featured.category}:`, error);
            }
          }
        } else {
          console.log("No featured articles found");
        }
      }
    } catch (error) {
      console.error("Error fetching featured articles:", error);
    }
    
    console.log("Final featuredNews:", featuredNews);
    
    // Fetch top articles by category
    let newsByCategory = {};
    
    try {
      const topArticlesResponse = await fetch('/api/top-articles');
      if (!topArticlesResponse.ok) {
        console.error("Failed to fetch top articles:", await topArticlesResponse.text());
      } else {
        newsByCategory = await topArticlesResponse.json();
        console.log("News by category loaded:", Object.keys(newsByCategory));
      }
    } catch (error) {
      console.error("Error fetching top articles:", error);
    }
    
    return {
      categories,
      featuredNews,
      newsByCategory
    };
  } catch (error) {
    console.error("Error in page load function:", error);
    return {
      categories: [],
      featuredNews: [],
      newsByCategory: {}
    };
  }
} 