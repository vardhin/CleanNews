/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  // Fetch categories
  const categoriesResponse = await fetch('/api/categories');
  const categories = await categoriesResponse.json();
  
  // Fetch all featured articles
  const featuredResponse = await fetch('/api/featured');
  const featuredNews = await featuredResponse.json();
  
  // Fetch top articles by category
  const topArticlesResponse = await fetch('/api/top-articles');
  const newsByCategory = await topArticlesResponse.json();
  
  return {
    categories,
    featuredNews,
    newsByCategory
  };
} 