import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const LinksTable = ({ links, loading, onLinkDeleted, onRefresh, shortLinkBase }) => {
  const [deletingCode, setDeletingCode] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)

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

  const handleDelete = async (code) => {
    if (!window.confirm('Are you sure you want to delete this link?')) {
      return
    }

    setDeletingCode(code)
    try {
      await axios.delete(`${API_URL}/api/links/${code}`)
      onLinkDeleted(code)
    } catch (err) {
      alert('Failed to delete link')
      console.error('Error deleting link:', err)
    } finally {
      setDeletingCode(null)
    }
  }

  const copyToClipboard = async (text, code) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredLinks = links.filter(link => 
    link.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="loading-spinner mx-auto mb-4 border-primary-600"></div>
        <p className="text-gray-600 font-medium">Loading your links...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Links</h2>
            <p className="text-gray-600 text-sm mt-1">
              {links.length} link{links.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">No links found</p>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first link to get started'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Short Link</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Clicked</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLinks.map((link) => (
                <tr key={link.code} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 text-sm">🔗</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {link.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(`${shortLinkBase}/${link.code}`, link.code)}
                            className={`p-1 rounded transition-colors duration-200 ${
                              copiedCode === link.code 
                                ? 'text-green-600 bg-green-50' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Copy short URL"
                          >
                            {copiedCode === link.code ? '✅' : '📋'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new URL(shortLinkBase).host}/{link.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div 
                      className="text-sm text-gray-900 max-w-xs truncate hover:text-clip transition-all duration-200 cursor-help" 
                      title={link.original_url}
                    >
                      {link.original_url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {link.clicks}
                      </span>
                      {link.clicks > 0 && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          +{link.clicks}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(link.last_clicked)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link
                      to={`/code/${link.code}`}
                      className="text-primary-600 hover:text-primary-800 font-medium flex items-center space-x-1 transition-colors duration-200"
                    >
                      <span>📈</span>
                      <span>Analytics</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(link.code)}
                      disabled={deletingCode === link.code}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 font-medium flex items-center space-x-1 transition-colors duration-200"
                    >
                      <span>🗑️</span>
                      <span>{deletingCode === link.code ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LinksTable