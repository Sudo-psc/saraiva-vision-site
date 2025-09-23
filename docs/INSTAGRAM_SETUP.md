# Instagram Feed Integration Setup

This document explains how to set up the Instagram embedded realtime preview feature for the Saraiva Vision website.

## Features

- **Real-time Instagram Feed**: Displays 4 latest posts from @saraivavision
- **Automatic Updates**: Polls Instagram API every 5 minutes for fresh content
- **Responsive Design**: Adapts to mobile (2x2 grid) and desktop (1x4 grid)
- **Fallback Content**: Shows demo posts when API is unavailable
- **Performance Optimized**: Includes caching, lazy loading, and error handling
- **Accessibility**: Full ARIA labels, keyboard navigation, and screen reader support

## Setup Instructions

### 1. Create Instagram Basic Display App

1. Go to [Meta for Developers](https://developers.facebook.com/apps/)
2. Click "Create App" → "Consumer" → "Instagram Basic Display"
3. Fill in app details:
   - **App Name**: "Saraiva Vision Website"
   - **Contact Email**: Your email address
4. Go to "Instagram Basic Display" → "Basic Display"

### 2. Configure Instagram App

1. **Add Instagram Test User**:
   - Click "Add or Remove Instagram Testers"
   - Add your Instagram account (@saraivavision)
   - Accept the invitation in the Instagram app

2. **Configure OAuth Redirect URI**:
   - Add these URLs in "OAuth Redirect URIs":
     - Development: `http://localhost:3000/api/instagram/callback`
     - Production: `https://saraivavision.com.br/api/instagram/callback`

3. **Get App Credentials**:
   - Copy "Instagram App ID" → `INSTAGRAM_CLIENT_ID`
   - Copy "Instagram App Secret" → `INSTAGRAM_CLIENT_SECRET`

### 3. Environment Configuration

1. Copy the environment variables:
   ```bash
   cp .env.example.instagram .env.local
   ```

2. Fill in your Instagram app credentials:
   ```env
   INSTAGRAM_CLIENT_ID=your_instagram_client_id_here
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret_here
   INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
   ```

### 4. Generate Access Token

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Get authorization URL**:
   ```bash
   curl http://localhost:3000/api/instagram/auth
   ```

3. **Open the returned URL** in your browser and authorize the app

4. **Complete OAuth flow**:
   - You'll be redirected to `/api/instagram/callback`
   - The long-lived access token will be generated
   - Copy the token to your `.env.local` file

### 5. Vercel Deployment Setup

1. **Add environment variables in Vercel Dashboard**:
   - Go to your project → Settings → Environment Variables
   - Add all Instagram variables for Production environment

2. **Update redirect URI** for production:
   ```env
   INSTAGRAM_REDIRECT_URI=https://saraivavision.com.br/api/instagram/callback
   ```

3. **Re-generate production access token** using the production callback URL

## API Endpoints

### `GET /api/instagram/posts`
Fetches Instagram posts with caching and fallback.

**Query Parameters**:
- `limit` (number): Number of posts to fetch (1-25, default: 4)
- `fields` (string): Instagram API fields to include

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "post_id",
      "caption": "Post caption...",
      "media_type": "IMAGE",
      "media_url": "https://...",
      "thumbnail_url": "https://...",
      "permalink": "https://instagram.com/p/...",
      "timestamp": "2024-01-01T12:00:00Z",
      "username": "saraivavision"
    }
  ],
  "cached": false,
  "total": 4
}
```

### `GET /api/instagram/auth`
Generates Instagram authorization URL for OAuth flow.

### `POST /api/instagram/auth`
Exchanges authorization code for access token.

## Component Usage

### Basic Usage
```jsx
import InstagramFeed from '@/components/InstagramFeed';

function HomePage() {
  return (
    <div>
      <InstagramFeed />
    </div>
  );
}
```

### Advanced Configuration
```jsx
<InstagramFeed 
  limit={4}
  className="bg-gray-50"
  autoRefresh={true}
  pollingInterval={5 * 60 * 1000} // 5 minutes
  gridCols={{ default: 2, md: 4 }}
  onPostClick={(post) => {
    // Custom post click handler
    window.open(post.permalink, '_blank');
  }}
/>
```

## Props Reference

### InstagramFeed Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | number | 4 | Number of posts to display |
| `className` | string | '' | Additional CSS classes |
| `showHeader` | boolean | true | Show section header |
| `showRefreshButton` | boolean | true | Show manual refresh button |
| `autoRefresh` | boolean | true | Enable automatic polling |
| `pollingInterval` | number | 300000 | Auto-refresh interval (ms) |
| `onPostClick` | function | null | Custom post click handler |
| `gridCols` | object | `{default: 2, md: 4}` | Grid column configuration |
| `animate` | boolean | true | Enable animations |

### InstagramPostCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `post` | object | required | Instagram post data |
| `className` | string | '' | Additional CSS classes |
| `onClick` | function | null | Click handler |
| `showUsername` | boolean | true | Show username |
| `showTimestamp` | boolean | true | Show post timestamp |
| `maxCaptionLength` | number | 120 | Caption truncation length |
| `animate` | boolean | true | Enable animations |

## Troubleshooting

### Common Issues

1. **"Instagram access token not configured"**
   - Check that `INSTAGRAM_ACCESS_TOKEN` is set in environment variables
   - Verify the token hasn't expired (60 days for long-lived tokens)

2. **"Token exchange failed"**
   - Verify `INSTAGRAM_CLIENT_ID` and `INSTAGRAM_CLIENT_SECRET`
   - Check that redirect URI matches your app configuration

3. **"Posts not loading"**
   - Check browser network tab for API errors
   - Verify Instagram app is not in development mode restrictions

4. **"CORS errors in development"**
   - Ensure you're using `npm run dev:vercel` for local development
   - Check that API routes are correctly configured

### Rate Limits

- Instagram Basic Display API: 200 calls per hour per user
- Our caching system reduces API calls to ~12 per hour (5-minute intervals)

### Token Refresh

Long-lived tokens expire after 60 days. To refresh:

1. Use the `/api/instagram/auth` endpoint with `action: 'refresh_token'`
2. Or re-run the OAuth flow to get a new token

## Performance

- **Caching**: 5-minute server-side cache reduces API calls
- **Fallback**: Demo posts shown when API is unavailable
- **Lazy Loading**: Images load only when visible
- **Optimized Images**: Responsive images with WebP support

## Security

- OAuth flow with state parameter for CSRF protection
- Environment variables for sensitive data
- Rate limiting and error handling
- Input validation with Zod schemas