import { NextResponse } from 'next/server'

// In-memory storage (in production, use a database)
let videos: any[] = []

export async function GET() {
  return NextResponse.json({ videos })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    videos.push(body)
    return NextResponse.json({ message: 'Video added', video: body })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 })
  }
}
