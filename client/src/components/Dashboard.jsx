import React, { useState, useEffect } from 'react'
import axios from 'axios'
import LinkForm from './LinkForm'
import LinksTable from './LinksTable'
import StatsCard from './StatsCard'



const Dashboard = () => {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    mostPopular: null
  })   


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

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/links`)
      const linksData = response.data
      setLinks(linksData)
      
      const totalClicks = linksData.reduce((sum, link) => sum + link.clicks, 0)
      const mostPopular = linksData.length > 0 
        ? linksData.reduce((max, link) => link.clicks > max.clicks ? link : max, linksData[0])
        : null
        
      setStats({
        totalLinks: linksData.length,
        totalClicks,
        mostPopular
      })
      setError('')
    } catch (err) {
      setError('Failed to fetch links')
      console.error('Error fetching links:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleLinkCreated = (newLink) => {
    setLinks([newLink, ...links])
    setStats(prev => ({
      ...prev,
      totalLinks: prev.totalLinks + 1
    }))
  }

  const handleLinkDeleted = (code) => {
    const deletedLink = links.find(link => link.code === code)
    setLinks(links.filter(link => link.code !== code))
    setStats(prev => ({
      ...prev,
      totalLinks: prev.totalLinks - 1,
      totalClicks: prev.totalClicks - (deletedLink?.clicks || 0)
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">TinyLink</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Shorten your URLs, track performance, and share with confidence
          </p>
        </div>

        {!loading && links.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            <StatsCard
              title="Total Links"
              value={stats.totalLinks}
              icon="🔗"
              color="blue"
              description="All your shortened URLs"
            />
            <StatsCard
              title="Total Clicks"
              value={stats.totalClicks}
              icon="👆"
              color="green"
              description="Across all your links"
            />
            <StatsCard
              title="Most Popular"
              value={stats.mostPopular ? stats.mostPopular.clicks : 0}
              subtitle={stats.mostPopular ? `/${stats.mostPopular.code}` : 'N/A'}
              icon="🔥"
              color="orange"
              description="Your top performing link"
            />
          </div>
        )}

        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Pass SHORT_LINK_BASE to LinkForm */}
          <LinkForm onLinkCreated={handleLinkCreated} shortLinkBase={SHORT_LINK_BASE} />
        </div>

        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Pass SHORT_LINK_BASE to LinksTable */}
          <LinksTable 
            links={links} 
            loading={loading}
            onLinkDeleted={handleLinkDeleted}
            onRefresh={fetchLinks}
            shortLinkBase={SHORT_LINK_BASE}
          />
        </div>

        {!loading && links.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🔗</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No links yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Create your first short link to get started. It's quick, easy, and free!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard