# API Endpoints Documentation

## 🌐 **Base Configuration**

### **Base URL**
```
https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/functions/v1/
```

### **Authentication**
All API calls require authentication using your Supabase project's anon key or service role key:

```bash
Authorization: Bearer [YOUR_SUPABASE_ANON_KEY_OR_SERVICE_ROLE_KEY]
```

---

## 📱 **Social Media Posting API**

### **Endpoint: `single-post`**
Creates and publishes posts across multiple social media platforms.

#### **Request**
```http
POST /single-post
Content-Type: application/json
Authorization: Bearer [YOUR_KEY]
```

#### **Payload**
```json
{
  "user_id": "string (required, UUID)",
  "brand_id": "string (required, UUID)",
  "prompt": "string (required)",
  "platforms": ["facebook", "twitter", "linkedin"],
  "ai_model": "string (optional, default: 'gpt-3.5-turbo')",
  "include_image": false,
  "include_meme": false,
  "tone": "professional",
  "style": "informative"
}
```

#### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | UUID | Yes | User identifier |
| `brand_id` | UUID | Yes | Brand profile to use |
| `prompt` | string | Yes | Content prompt for generation |
| `platforms` | array | Yes | Target platforms: `facebook`, `twitter`, `linkedin`, `instagram` |
| `ai_model` | string | No | AI model: `gpt-3.5-turbo`, `gpt-4` (default: `gpt-3.5-turbo`) |
| `include_image` | boolean | No | Generate accompanying image |
| `include_meme` | boolean | No | Generate meme content |
| `tone` | string | No | Content tone: `professional`, `casual`, `humorous` |
| `style` | string | No | Content style: `informative`, `promotional`, `story` |

#### **Response**
```json
{
  "success": true,
  "message": "Posts generated and published successfully",
  "posts_created": 3,
  "platforms_posted": ["facebook", "twitter", "linkedin"],
  "generated_content": {
    "facebook": {
      "content": "Your generated Facebook post content...",
      "character_count": 240,
      "hashtags": ["#business", "#growth"]
    },
    "twitter": {
      "content": "Your generated Twitter post content...",
      "character_count": 280,
      "hashtags": ["#startup", "#tech"]
    },
    "linkedin": {
      "content": "Your generated LinkedIn post content...",
      "character_count": 350,
      "hashtags": ["#professional", "#networking"]
    }
  },
  "media_generated": {
    "image_url": "https://[PROJECT].supabase.co/storage/v1/object/public/images/...",
    "image_description": "Generated image description"
  }
}
```

#### **Example Usage**
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/single-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_KEY]" \
  -d '{
    "user_id": "user-uuid-here",
    "brand_id": "brand-uuid-here", 
    "prompt": "Share insights about AI in business",
    "platforms": ["twitter", "linkedin"],
    "ai_model": "gpt-4",
    "tone": "professional",
    "include_image": false
  }'
```

---

## 🎨 **Media Generation API**

### **Endpoint: `generate-media-content`**
Generates AI-powered images, memes, and visual content.

#### **Request**
```http
POST /generate-media-content
Content-Type: application/json
Authorization: Bearer [YOUR_KEY]
```

#### **Payload**
```json
{
  "user_id": "string (required, UUID)",
  "prompt": "string (required)",
  "brand_id": "string (required, UUID)",
  "type": "string (optional, 'meme' | 'image')",
  "style": "string (optional)",
  "dimensions": "string (optional, '1024x1024' | '1792x1024' | '1024x1792')"
}
```

#### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | UUID | Yes | User identifier for token deduction |
| `prompt` | string | Yes | Description of content to generate |
| `brand_id` | UUID | Yes | Brand context for generation |
| `type` | string | No | Content type: `image` or `meme` (default: `image`) |
| `style` | string | No | Visual style: `photorealistic`, `cartoon`, `digital_art` |
| `dimensions` | string | No | Image size (default: `1024x1024`) |

#### **Response**
```json
{
  "success": true,
  "message": "Media content generation completed",
  "brand_id": "87e05ae7-8f83-4c89-afcc-450fc1572e2c",
  "content_type": "image",
  "generated_content": {
    "imageUrl": "https://[PROJECT].supabase.co/storage/v1/object/public/generated-images/...",
    "image_description": "A modern, professional image showing...",
    "overlay_text": null,
    "metadata": {
      "style": "photorealistic",
      "dimensions": "1024x1024",
      "generation_time": "3.2s"
    }
  },
  "tokens_used": 15,
  "remaining_tokens": 485
}
```

#### **Example Usage**
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/generate-media-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_KEY]" \
  -d '{
    "user_id": "user-uuid-here",
    "prompt": "Professional headshot for LinkedIn profile",
    "brand_id": "brand-uuid-here",
    "type": "image",
    "style": "photorealistic",
    "dimensions": "1024x1024"
  }'
```

---

## 📝 **Blog Generation API**

### **Endpoint: `generateFullBlogPost`**
Generates complete blog posts with SEO optimization.

#### **Request**
```http
POST /generateFullBlogPost
Content-Type: application/json
Authorization: Bearer [YOUR_KEY]
```

#### **Payload**
```json
{
  "user_id": "string (required, UUID)",
  "brand_id": "string (required, UUID)",
  "campaign_id": "string (optional, UUID)",
  "prompt": "string (required)",
  "model_id": "string (optional)",
  "include_seo": true
}
```

#### **Response**
```json
{
  "success": true,
  "blog_post": {
    "id": "blog-post-uuid",
    "title": "Generated Blog Post Title",
    "slug": "generated-blog-post-title",
    "content_html": "<article>...</article>",
    "content_markdown": "# Generated Blog Post Title\n\n...",
    "excerpt": "Brief summary of the blog post...",
    "seo": {
      "meta_title": "SEO Optimized Title",
      "meta_description": "SEO meta description...",
      "keywords": ["keyword1", "keyword2"],
      "reading_time": 5
    },
    "word_count": 1200,
    "publication_date": "2025-08-08T21:50:00Z"
  },
  "tokens_used": 45,
  "generation_time": "12.3s"
}
```

---

## 🔄 **Campaign Management API**

### **Endpoint: `generate-campaign-posts`**
Generates posts for scheduled campaigns across multiple platforms.

#### **Request**
```http
POST /generate-campaign-posts
Content-Type: application/json
Authorization: Bearer [YOUR_KEY]
```

#### **Payload**
```json
{
  "campaign_id": "string (required, UUID)",
  "user_id": "string (required, UUID)",
  "platforms": ["facebook", "twitter", "linkedin"],
  "post_count": 5,
  "schedule_interval": "daily"
}
```

#### **Response**
```json
{
  "success": true,
  "campaign_id": "campaign-uuid",
  "posts_generated": 15,
  "platforms": ["facebook", "twitter", "linkedin"],
  "schedule": {
    "start_date": "2025-08-09T00:00:00Z",
    "end_date": "2025-08-14T00:00:00Z",
    "frequency": "daily"
  },
  "posts": [
    {
      "id": "post-uuid",
      "platform": "facebook",
      "content": "Generated post content...",
      "scheduled_time": "2025-08-09T19:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

---

## 🔍 **Token Management API**

### **Endpoint: `deductTokens`**
Manages user token balance for AI operations.

#### **Request**
```http
POST /deductTokens
Content-Type: application/json
Authorization: Bearer [YOUR_KEY]
```

#### **Payload**
```json
{
  "user_id": "string (required, UUID)",
  "task_type": "string (required)",
  "model_id": "string (optional)",
  "include_image": false
}
```

#### **Task Types & Token Costs**
| Task Type | Base Cost | With Image | Description |
|-----------|-----------|------------|-------------|
| `single_post` | 2 tokens | +3 tokens | Single social media post |
| `campaign_post` | 5 tokens | +3 tokens | Campaign post generation |
| `blog_generation` | 10 tokens | +5 tokens | Full blog post |
| `media_generation` | 5 tokens | N/A | AI image generation |
| `brand_generation` | 8 tokens | N/A | AI brand profile creation |

---

## 🚨 **Error Handling**

### **Standard Error Response**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional technical details"
  },
  "timestamp": "2025-08-08T21:50:00Z"
}
```

### **Common Error Codes**
| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_AUTH` | Invalid or missing authorization | Check Authorization header |
| `INSUFFICIENT_TOKENS` | Not enough tokens for operation | Purchase more tokens |
| `INVALID_BRAND_ID` | Brand not found or inaccessible | Verify brand ID exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retrying |
| `VALIDATION_ERROR` | Invalid request parameters | Check required fields |

---

## 📊 **Rate Limits**

| Endpoint | Limit | Window | Burst |
|----------|-------|--------|--------|
| `single-post` | 10 requests | 1 minute | 20 |
| `generate-media-content` | 5 requests | 1 minute | 10 |
| `generateFullBlogPost` | 3 requests | 5 minutes | 5 |
| `generate-campaign-posts` | 2 requests | 10 minutes | 3 |

---

## 🔧 **SDK Examples**

### **JavaScript/TypeScript**
```typescript
const autoAuthorAPI = {
  baseUrl: 'https://[PROJECT_REF].supabase.co/functions/v1',
  apiKey: 'your-api-key',
  
  async createPost(payload: PostPayload) {
    const response = await fetch(`${this.baseUrl}/single-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    return response.json();
  }
};
```

### **Python**
```python
import requests

class AutoAuthorAPI:
    def __init__(self, project_ref, api_key):
        self.base_url = f"https://{project_ref}.supabase.co/functions/v1"
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    
    def create_post(self, payload):
        response = requests.post(
            f"{self.base_url}/single-post",
            headers=self.headers,
            json=payload
        )
        return response.json()
```

---

*Last Updated: August 8, 2025*
*API Version: v1.0*