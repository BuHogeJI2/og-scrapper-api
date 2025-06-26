# Link Preview API

A lightweight service that extracts Open Graph metadata from web pages.

## Features

- Extracts title, image, and URL from Open Graph meta tags
- Automatically follows redirects
- Handles relative image URLs
- Fallback to standard meta tags when OG tags are missing
- CORS enabled for web applications

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/link-preview-api.git
cd link-preview-api
```
2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Server
```bash
node server.js
```
Server will start at: `http://localhost:4000`

### API Endpoint
GET /api/link-preview?url={URL}

### Example Request
```bash
curl "http://localhost:4000/api/link-preview?url=https://example.com"
```

### Response Format
```typescript
{
  title: string;        // Page title (og:title or <title> tag)
  image: string | null; // Absolute URL to image (og:image)
  url: string;          // Canonical URL (og:url or final URL after redirects)
  description?: string; // Page description (og:description or meta description)
}
```
