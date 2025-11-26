import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const Stats = () => {
  const { code } = useParams()
  const [link, setLink] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)  


  const getApiUrl = () => {
  
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5001';
    }
    
  
    return window.location.origin;
  };
  
  const API_URL = getApiUrl();
  const SHORT_LINK_BASE = getApiUrl()
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/api/links/${code}`)
        setLink(response.data)
        setError('')
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Link not found')
        } else {
          setError('Failed to load stats')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [code])

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="loading-spinner mx-auto mb-4 border-primary-600"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Analytics for <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">/{link.code}</span>
          </h1>
          <p className="text-xl text-gray-600">Track your link's performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-blue-600">👆</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{link.clicks}</div>
            <p className="text-gray-600 font-medium">Total Clicks</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-green-600">📅</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">Created</div>
            <p className="text-gray-600">{formatDate(link.created_at)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-orange-600">🕒</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">Last Clicked</div>
            <p className="text-gray-600">{formatDate(link.last_clicked)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Link Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Short URL</label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <code className="bg-gray-100 px-4 py-3 rounded-lg text-sm font-mono flex-1 border border-gray-200">
                  {SHORT_LINK_BASE}/{link.code}
                </code>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${SHORT_LINK_BASE}/${link.code}`)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center space-x-2 justify-center sm:justify-start"
                >
                  <span>📋</span>
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Destination URL</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 break-all font-mono">{link.original_url}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">QR Code</label>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-gray-600 font-medium mb-2">QR Code Generator</p>
                <p className="text-gray-500 text-sm">Enable QR code generation in settings</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats
