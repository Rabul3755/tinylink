import React, { useState } from 'react'
import axios from 'axios'

const LinkForm = ({ onLinkCreated }) => {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post('https://tinylink-production-2e62.up.railway.app/api/links', {
        url,
        customCode: customCode || undefined
      })

      setSuccess('🎉 Link created successfully!')
      setUrl('')
      setCustomCode('')
      onLinkCreated(response.data)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      if (err.response?.status === 409) {
        setError('❌ This custom code is already taken. Please choose another one.')
      } else if (err.response?.status === 400) {
        setError('❌ Please enter a valid URL')
      } else {
        setError('❌ Failed to create link. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Short Link</h2>
        <p className="text-gray-600">Transform long URLs into short, memorable links</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-3">
            Destination URL *
          </label>
          <div className="relative">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url-path-that-needs-shortening"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-400">🌐</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="customCode" className="block text-sm font-semibold text-gray-700 mb-3">
            Custom Slug (optional)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {window.location.origin}/
            </div>
            <input
              type="text"
              id="customCode"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="my-custom-link"
              pattern="[A-Za-z0-9]{1,10}"
              title="1-10 alphanumeric characters only"
              className="w-full px-4 py-3 pl-40 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
            <span>💡</span>
            <span>Leave empty for auto-generated code. Only letters and numbers, 1-10 characters.</span>
          </p>
        </div>

        {error && (
          <div className="animate-bounce-in bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-sm">!</span>
            </div>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="animate-bounce-in bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="loading-spinner border-white"></div>
              <span>Creating Magic Link...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>✨</span>
              <span>Create Short Link</span>
            </div>
          )}
        </button>
      </form>
    </div>
  )
}

export default LinkForm