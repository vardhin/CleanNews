# Clean News Backend API

This is the backend API for the Clean News application, providing endpoints to access news articles and featured content.

## Setup

1. Ensure you have Node.js installed
2. Install dependencies: `npm install`
3. Start the API server: `npm run api`

The server will start on port 5000 by default (or the port specified in your environment variables).

## Available Endpoints

### Get All Categories
- **URL**: `/api/categories`
- **Method**: GET
- **Description**: Returns a list of all unique news categories

### Get Top Articles By Category
- **URL**: `/api/top-articles`
- **Method**: GET
- **Description**: Returns the top 25 articles from each category based on serial number

### Get Specific Article
- **URL**: `/api/article/:category/:serialNumber`
- **Method**: GET
- **Description**: Returns a specific article by category and serial number
- **URL Parameters**:
  - `category`: The article category
  - `serialNumber`: The article's serial number (integer)

### Get Featured Articles By Category
- **URL**: `/api/featured/:category`
- **Method**: GET
- **Description**: Returns featured articles for a specific category
- **URL Parameters**:
  - `category`: The article category

### Get All Featured Articles
- **URL**: `/api/featured`
- **Method**: GET
- **Description**: Returns all featured articles

### Get Latest Featured Article With Related Articles
- **URL**: `/api/featured-with-related/:category`
- **Method**: GET
- **Description**: Returns the latest featured article for a category along with its related articles
- **URL Parameters**:
  - `category`: The article category 