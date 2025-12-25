'use client'

import { useState, useEffect } from 'react'

interface Video {
  id: string
  title: string
  status: string
  scheduledTime: string
  url?: string
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    topic: '',
    schedule: '',
    enabled: false
  })
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchVideos()
    fetchConfig()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config')
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await res.json()
      setStatus(data.message || 'Configuration saved!')
    } catch (error) {
      setStatus('Error saving configuration')
    } finally {
      setLoading(false)
    }
  }

  const generateVideo = async () => {
    setLoading(true)
    setStatus('Generating video...')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: config.topic })
      })
      const data = await res.json()
      setStatus(data.message || 'Video generated!')
      fetchVideos()
    } catch (error) {
      setStatus('Error generating video')
    } finally {
      setLoading(false)
    }
  }

  const authenticateYouTube = async () => {
    window.open('/api/auth/youtube', '_blank')
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎬 YouTube AI Agent
          </h1>
          <p className="text-xl text-gray-300">
            Automatically create and publish videos to your YouTube channel
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">⚙️ Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Topic/Niche
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => setConfig({...config, topic: e.target.value})}
                  placeholder="e.g., Tech News, Gaming, Cooking"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Cron Format)
                </label>
                <input
                  type="text"
                  value={config.schedule}
                  onChange={(e) => setConfig({...config, schedule: e.target.value})}
                  placeholder="0 10 * * * (Daily at 10 AM)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: "0 10 * * *" (10 AM daily), "0 14 * * 1,3,5" (Mon, Wed, Fri at 2 PM)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({...config, enabled: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Enable Auto-Posting
                </label>
              </div>

              <button
                onClick={saveConfig}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>

              <button
                onClick={authenticateYouTube}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                🔐 Connect YouTube Account
              </button>

              <button
                onClick={generateVideo}
                disabled={loading || !config.topic}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : '▶️ Generate Video Now'}
              </button>

              {status && (
                <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Statistics</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{videos.length}</div>
                <div className="text-sm opacity-90">Total Videos</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">
                  {videos.filter(v => v.status === 'published').length}
                </div>
                <div className="text-sm opacity-90">Published</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">
                  {videos.filter(v => v.status === 'scheduled').length}
                </div>
                <div className="text-sm opacity-90">Scheduled</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">
                  ${(videos.filter(v => v.status === 'published').length * 2.5).toFixed(2)}
                </div>
                <div className="text-sm opacity-90">Est. Earnings</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">💡 Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ AI-generated video content</li>
                <li>✅ Automated title & description</li>
                <li>✅ SEO-optimized hashtags</li>
                <li>✅ Scheduled publishing</li>
                <li>✅ Monetization ready</li>
                <li>✅ Analytics tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🎥 Video Queue</h2>

          {videos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No videos yet. Generate your first video to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-gray-700">Scheduled</th>
                    <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{video.title}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          video.status === 'published' ? 'bg-green-100 text-green-800' :
                          video.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {video.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{video.scheduledTime}</td>
                      <td className="py-3 px-4">
                        {video.url && (
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
