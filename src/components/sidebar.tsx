'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Clock } from 'lucide-react'

interface Stats {
  totalVCs: number
  totalReviews: number
  weeklyReviews: number
}

interface PopularVC {
  id: string
  name: string
  reviewCount: number
}

interface RecentActivity {
  type: string
  vcName: string
  time: string
}

export function Sidebar() {
  const [stats, setStats] = useState<Stats>({
    totalVCs: 0,
    totalReviews: 0,
    weeklyReviews: 0
  })
  const [popularVCs, setPopularVCs] = useState<PopularVC[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        
        if (response.ok) {
          setStats(data.stats)
          setPopularVCs(data.popularVCs)
          setRecentActivity(data.recentActivity)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // 5분마다 통계 업데이트
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Loading skeleton */}
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-6">
            <div className="animate-skeleton h-6 rounded-lg w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="animate-skeleton h-4 rounded-lg"></div>
              <div className="animate-skeleton h-4 rounded-lg"></div>
              <div className="animate-skeleton h-4 rounded-lg w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Popular VCs */}
      {popularVCs.length > 0 && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">인기 VC</h3>
              <p className="text-sm text-gray-600">많은 후기가 있는 VC</p>
            </div>
          </div>
          <div className="space-y-3">
            {popularVCs.map((vc, index) => (
              <Link key={vc.id} href={`/vcs/${vc.id}`}>
                <div className="group flex items-center justify-between p-3 hover:bg-primary-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-primary-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 truncate">
                        {vc.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        후기 {vc.reviewCount.toLocaleString()}개
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success-100 rounded-lg">
              <Clock className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">최근 활동</h3>
              <p className="text-sm text-gray-600">실시간 업데이트</p>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-25 rounded-xl">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'review' ? 'bg-primary-400' : 'bg-success-400'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="text-gray-600">
                      {activity.type === 'review' ? '새 후기' : '새 댓글'}
                    </span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="font-semibold text-gray-900">{activity.vcName}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-900">플랫폼 통계</h3>
            <p className="text-sm text-primary-700">실시간 데이터</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-primary-600 uppercase tracking-wide">전체 VC</div>
                <div className="text-2xl font-bold text-primary-900 mt-1">{stats.totalVCs.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-primary-600 uppercase tracking-wide">전체 후기</div>
                <div className="text-2xl font-bold text-primary-900 mt-1">{stats.totalReviews.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-success-600 uppercase tracking-wide">이번 주 신규</div>
                <div className="text-2xl font-bold text-success-700 mt-1">{stats.weeklyReviews.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-success-100 rounded-lg">
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}