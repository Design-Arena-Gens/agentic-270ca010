// Video generation utilities
import Anthropic from '@anthropic-ai/sdk'

export interface VideoContent {
  title: string
  description: string
  hashtags: string[]
  script: string[]
  keywords: string[]
}

export async function generateVideoContent(topic: string, apiKey: string): Promise<VideoContent> {
  const anthropic = new Anthropic({ apiKey })

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Create a YouTube video concept for: "${topic}".

Requirements:
- Title: Engaging, SEO-friendly, 60 characters max
- Description: 200-300 words with key points, call-to-action
- Hashtags: 15-20 relevant tags for maximum reach
- Script: 5-7 section outlines with talking points
- Keywords: 10-15 SEO keywords

Make it viral-worthy and monetization-friendly.

Return as JSON with keys: title, description, hashtags, script, keywords`
    }]
  })

  const content = message.content[0]
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }

  // Fallback
  return {
    title: `${topic} - Complete Guide`,
    description: `Learn everything about ${topic}! This comprehensive guide covers all the essentials you need to know. Don't forget to like, subscribe, and hit the notification bell for more awesome content!`,
    hashtags: ['#' + topic.replace(/\s+/g, ''), '#YouTube', '#Tutorial', '#Guide', '#HowTo', '#Tips', '#2024', '#Viral', '#Trending'],
    script: [
      'Hook: Attention-grabbing opening',
      'Introduction: What we\'ll cover',
      'Main content section 1',
      'Main content section 2',
      'Main content section 3',
      'Tips and best practices',
      'Conclusion and call-to-action'
    ],
    keywords: [topic, 'tutorial', 'guide', 'how to', 'tips', 'best', 'complete', 'beginner', 'learn']
  }
}

export function generateOptimizedDescription(content: VideoContent): string {
  const hashtags = content.hashtags.join(' ')
  return `${content.description}

📌 Timestamps:
0:00 - Introduction
1:30 - Main Content
8:45 - Tips & Tricks
12:00 - Conclusion

🔔 Subscribe for more: [Your Channel]
👍 Like this video if you found it helpful!
💬 Comment below with your thoughts!

${hashtags}

Keywords: ${content.keywords.join(', ')}`
}

export function optimizeForMonetization(content: VideoContent): VideoContent {
  // Ensure content is advertiser-friendly
  const cleanDescription = content.description
    .replace(/\b(click here|free money|get rich quick)\b/gi, '')
    .trim()

  const uniqueKeywords = Array.from(new Set([...content.keywords, 'educational', 'family friendly', 'tutorial']))

  return {
    ...content,
    description: cleanDescription,
    keywords: uniqueKeywords
  }
}
