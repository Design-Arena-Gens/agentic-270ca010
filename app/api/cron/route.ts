import { NextResponse } from 'next/server'

// This endpoint can be called by a cron service (like Vercel Cron or external)
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get configuration
    const configRes = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/config`)
    const config = await configRes.json()

    if (!config.enabled) {
      return NextResponse.json({ message: 'Auto-posting is disabled' })
    }

    // Generate new video
    const generateRes = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: config.topic })
    })

    const result = await generateRes.json()

    return NextResponse.json({
      message: 'Cron job executed successfully',
      video: result.video
    })

  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      error: 'Cron job failed',
      details: error.message
    }, { status: 500 })
  }
}
