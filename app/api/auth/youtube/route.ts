import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/youtube/callback'
)

export async function GET() {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ],
      prompt: 'consent'
    })

    return NextResponse.redirect(authUrl)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to initiate YouTube authentication',
      message: 'Please set up YouTube API credentials in your environment variables'
    }, { status: 500 })
  }
}
