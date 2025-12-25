import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Generate video content using Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Create a YouTube video concept for the topic: "${topic}".

Provide:
1. An engaging title (60 chars max)
2. A detailed description (200-300 words) with key points
3. 15-20 relevant hashtags
4. A video script outline (5-7 main points)
5. SEO keywords

Format as JSON with keys: title, description, hashtags (array), script (array), keywords (array)`
      }]
    })

    let videoData
    try {
      const content = message.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          videoData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      }
    } catch (parseError) {
      // Fallback to generated content
      videoData = {
        title: `${topic} - Complete Guide`,
        description: `Comprehensive guide about ${topic}. Learn everything you need to know!`,
        hashtags: ['#' + topic.replace(/\s+/g, ''), '#YouTube', '#Tutorial', '#Guide'],
        script: ['Introduction', 'Main Content', 'Tips & Tricks', 'Conclusion'],
        keywords: [topic, 'tutorial', 'guide', 'howto']
      }
    }

    // Create video metadata
    const video = {
      id: Date.now().toString(),
      title: videoData.title || `${topic} - Video`,
      description: videoData.description || '',
      hashtags: videoData.hashtags || [],
      script: videoData.script || [],
      keywords: videoData.keywords || [],
      status: 'draft',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }

    // Store video (in production, save to database)
    const storeResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    })

    return NextResponse.json({
      message: 'Video content generated successfully!',
      video
    })

  } catch (error: any) {
    console.error('Error generating video:', error)
    return NextResponse.json({
      error: 'Failed to generate video',
      details: error.message
    }, { status: 500 })
  }
}
