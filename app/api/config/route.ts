import { NextResponse } from 'next/server'

let config = {
  topic: '',
  schedule: '0 10 * * *',
  enabled: false,
  youtubeAuth: null
}

export async function GET() {
  return NextResponse.json(config)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    config = { ...config, ...body }
    return NextResponse.json({ message: 'Configuration saved successfully!', config })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
}
