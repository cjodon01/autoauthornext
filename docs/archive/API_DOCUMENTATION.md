# AutoAuthor API Documentation

This document provides comprehensive API documentation for AutoAuthor's posting and media generation functions that can be called from external applications.

## Base URL

```
https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/functions/v1/
```

## Authentication

All API calls require authentication using your Supabase project's anon key or service role key in the Authorization header:

```
Authorization: Bearer [YOUR_SUPABASE_ANON_KEY_OR_SERVICE_ROLE_KEY]
```

---

## 1. Media Generation API

### Endpoint: `generate-media-content`

Generates AI-powered media content including images and memes using OpenAI's GPT-4 and DALL-E 3.

#### Request

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [YOUR_SUPABASE_ANON_KEY_OR_SERVICE_ROLE_KEY]
```

**Body:**
```json
{
  "prompt": "string (required)",
  "brand_id": "string (required, UUID)",
  "type": "string (optional, 'meme' | 'image', default: 'image')"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | The text prompt describing what content to generate |
| `brand_id` | string (UUID) | Yes | The UUID of the brand profile to use for context |
| `type` | string | No | Content type: `'meme'` or `'image'` (default: `'image'`) |

#### Example Request

```bash
curl -X POST https://[YOUR_PROJECT_REF].supabase.co/functions/v1/generate-media-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -d '{
    "prompt": "A professional logo design for a tech startup",
    "brand_id": "87e05ae7-8f83-4c89-afcc-450fc1572e2c",
    "type": "image"
  }'
```

#### Response

**Success Response (200):**
```json
{
  "message": "Media content generation process completed.",
  "brand_id": "87e05ae7-8f83-4c89-afcc-450fc1572e2c",
  "content_type": "image",
  "generated_content": {
    "imageUrl": "https://[PROJECT_REF].supabase.co/storage/v1/object/public/generated-images/brand_id/image_timestamp.png",
    "image_description": "A modern, minimalist logo design featuring clean lines and professional typography...",
    "overlay_text": null,
    "overlay_options": null
  },
  "sources_used": {
    "brand_profile": "Brand Name"
  }
}
```

**For Meme Type:**
```json
{
  "message": "Media content generation process completed.",
  "brand_id": "87e05ae7-8f83-4c89-afcc-450fc1572e2c",
  "content_type": "meme",
  "generated_content": {
    "imageUrl": "https://[PROJECT_REF].supabase.co/storage/v1/object/public/generated-images/brand_id/meme_timestamp.png",
    "image_description": "A humorous office scene with...",
    "overlay_text": "When the code finally works",
    "overlay_options": {
      "font_family": "Impact",
      "font_size": 60,
      "text_color": "white",
      "placement": "top",
      "text_shadow": true,
      "show_text_background": false
    }
  },
  "sources_used": {
    "brand_profile": "Brand Name"
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `brand_id` | string | The brand ID used for generation |
| `content_type` | string | The type of content generated (`'meme'` or `'image'`) |
| `generated_content.imageUrl` | string | Public URL to the generated image |
| `generated_content.image_description` | string | AI-generated description of the image |
| `generated_content.overlay_text` | string | Text overlay for memes (null for images) |
| `generated_content.overlay_options` | object | Styling options for meme text (null for images) |
| `sources_used.brand_profile` | string | Name of the brand profile used |

---

## 2. Social Media Posting API

### Endpoint: `single-post`

Handles social media content generation and posting to multiple platforms.

#### Request

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [YOUR_SUPABASE_ANON_KEY_OR_SERVICE_ROLE_KEY]
```

#### Available Actions

The API supports three main actions:

### Action 1: Generate Content (`action: "generate"`)

Generates multiple variations of social media posts using AI.

**Body:**
```json
{
  "user_id": "string (required)",
  "action": "generate",
  "prompt": "string (required)",
  "platforms": ["string"] (optional),
  "ai_model_name": "string (optional)"
}
```

**Example Request:**
```bash
curl -X POST https://[YOUR_PROJECT_REF].supabase.co/functions/v1/single-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -d '{
    "user_id": "76029ff0-fc1d-42c3-abe0-9b84e4e5514c",
    "action": "generate",
    "prompt": "Announcing our new product launch",
    "platforms": ["facebook", "twitter", "linkedin"],
    "ai_model_name": "gpt-4o-mini"
  }'
```

**Response:**
```json
{
  "posts": [
    "Exciting news! 🚀 We're thrilled to announce our latest product launch. This game-changing innovation is set to revolutionize the industry. Stay tuned for more details! #ProductLaunch #Innovation",
    "Breaking: Our newest product is here! After months of development and testing, we're ready to share something truly special with our community. #NewProduct #Launch",
    "The wait is over! Our latest product launch represents the culmination of our team's dedication and vision. We can't wait for you to experience what we've built. #LaunchDay"
  ]
}
```

### Action 2: Post Content (`action: "post"`)

Posts content to specified social media platforms.

**Body:**
```json
{
  "user_id": "string (required)",
  "action": "post",
  "selected_post": "string (required)",
  "platforms": ["string"] (required),
  "page_id": "string (optional, for Facebook/Instagram)",
  "social_connection_id": "string (optional, for Twitter/LinkedIn)",
  "media_url": "string (optional)"
}
```

**Example Request:**
```bash
curl -X POST https://[YOUR_PROJECT_REF].supabase.co/functions/v1/single-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -d '{
    "user_id": "76029ff0-fc1d-42c3-abe0-9b84e4e5514c",
    "action": "post",
    "selected_post": "Exciting news! 🚀 We're thrilled to announce our latest product launch.",
    "platforms": ["facebook", "twitter"],
    "page_id": "123456789",
    "social_connection_id": "987654321",
    "media_url": "https://example.com/image.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Post(s) processed.",
  "results": [
    {
      "platform": "facebook",
      "success": true,
      "data": {
        "id": "123456789_987654321"
      }
    },
    {
      "platform": "twitter",
      "success": true,
      "data": {
        "data": {
          "id": "1234567890123456789",
          "text": "Exciting news! 🚀 We're thrilled to announce our latest product launch."
        }
      }
    }
  ]
}
```

### Action 3: Generate Journey Map (`action: "generate_journey_map"`)

Generates a content journey map for multi-day campaigns.

**Body:**
```json
{
  "user_id": "string (required)",
  "action": "generate_journey_map",
  "journey_data": {
    "name": "string (required)",
    "goal": "string (required)",
    "description": "string (required)",
    "durationDays": "number (required)",
    "brandId": "string (optional)",
    "keyMilestones": "string (optional)",
    "targetAudience": "string (optional)",
    "desiredTone": "string (optional)"
  }
}
```

**Example Request:**
```bash
curl -X POST https://[YOUR_PROJECT_REF].supabase.co/functions/v1/single-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -d '{
    "user_id": "76029ff0-fc1d-42c3-abe0-9b84e4e5514c",
    "action": "generate_journey_map",
    "journey_data": {
      "name": "Product Launch Journey",
      "goal": "Build excitement and awareness for our new product",
      "description": "A 7-day journey to launch our revolutionary new product",
      "durationDays": 7,
      "brandId": "87e05ae7-8f83-4c89-afcc-450fc1572e2c",
      "keyMilestones": "Teaser, Reveal, Features, Benefits, Social Proof, Launch, Celebration",
      "targetAudience": "Tech-savvy professionals aged 25-45",
      "desiredTone": "Professional yet approachable"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "journey_map": [
    "Day 1: Building Anticipation - Teaser Campaign",
    "Day 2: The Big Reveal - Product Announcement",
    "Day 3: Deep Dive - Key Features Showcase",
    "Day 4: Value Proposition - Benefits and Solutions",
    "Day 5: Social Proof - Customer Testimonials",
    "Day 6: Launch Preparation - Final Countdown",
    "Day 7: Celebration - Launch Day Success"
  ]
}
```

#### Supported Platforms

| Platform | Required Parameters | Notes |
|----------|-------------------|-------|
| Facebook | `page_id` | Uses Facebook Pages API |
| Instagram | `page_id` | Uses Facebook Pages API (same as Facebook) |
| Twitter | `social_connection_id` | Uses Twitter API v2 |
| LinkedIn | `social_connection_id` | Uses LinkedIn API |

#### Error Responses

**400 Bad Request:**
```json
{
  "error": "Missing required parameter"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication failed"
}
```

**402 Payment Required:**
```json
{
  "error": "Insufficient tokens or server error"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error: [error message]"
}
```

---

## 3. Database Schema Requirements

### Required Tables

#### `brands` Table
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  mission_statement TEXT,
  industry TEXT,
  site_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `ai_providers` Table
```sql
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_base_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `ai_models` Table
```sql
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  provider_id UUID REFERENCES ai_providers(id),
  api_model_id TEXT NOT NULL,
  model_type TEXT DEFAULT 'chat_completion',
  temperature_default DECIMAL DEFAULT 0.7,
  max_tokens_default INTEGER DEFAULT 600,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `generated_media_posts` Table
```sql
CREATE TABLE generated_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  prompt TEXT NOT NULL,
  content_type TEXT NOT NULL,
  generated_image_url TEXT,
  image_description TEXT,
  overlay_text TEXT,
  overlay_options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `social_pages` Table (for Facebook/Instagram)
```sql
CREATE TABLE social_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL,
  page_access_token TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `social_connections` Table (for Twitter/LinkedIn)
```sql
CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oauth_user_token TEXT NOT NULL,
  oauth_refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Environment Variables

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# OpenAI Configuration
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]

# Twitter Configuration (for Twitter posting)
TWITTER_CLIENT_ID=[YOUR_TWITTER_CLIENT_ID]
TWITTER_CLIENT_SECRET=[YOUR_TWITTER_CLIENT_SECRET]
```

---

## 5. Usage Examples

### Complete Workflow Example

1. **Generate Media Content:**
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/generate-media-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{
    "prompt": "Create a professional logo for our tech startup",
    "brand_id": "87e05ae7-8f83-4c89-afcc-450fc1572e2c",
    "type": "image"
  }'
```

2. **Generate Post Content:**
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/single-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{
    "user_id": "76029ff0-fc1d-42c3-abe0-9b84e4e5514c",
    "action": "generate",
    "prompt": "Announcing our new logo design",
    "platforms": ["facebook", "twitter"]
  }'
```

3. **Post to Social Media:**
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/single-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{
    "user_id": "76029ff0-fc1d-42c3-abe0-9b84e4e5514c",
    "action": "post",
    "selected_post": "Exciting news! We've just unveiled our new logo design. What do you think? 🎨",
    "platforms": ["facebook", "twitter"],
    "page_id": "123456789",
    "social_connection_id": "987654321",
    "media_url": "https://[PROJECT_REF].supabase.co/storage/v1/object/public/generated-images/brand_id/image_timestamp.png"
  }'
```

---

## 6. Rate Limits and Best Practices

- **Rate Limits:** Currently no hard rate limits, but be mindful of API usage
- **Token Management:** The system includes token deduction for content generation
- **Error Handling:** Always check response status codes and handle errors gracefully
- **Authentication:** Use service role keys for server-to-server communication
- **Caching:** Consider caching generated content to avoid regeneration costs

---

## 7. Support and Troubleshooting

### Common Issues

1. **Authentication Errors:** Ensure your API key is valid and has proper permissions
2. **Missing Parameters:** Check that all required fields are provided
3. **Platform-Specific Errors:** Verify that social media accounts are properly connected
4. **Token Issues:** Ensure sufficient tokens are available for content generation

### Debugging

Enable detailed logging by checking the Supabase Edge Function logs in your dashboard.

### Contact

For technical support or questions about the API, please refer to your AutoAuthor documentation or contact your system administrator. 