'use client'

import Link from 'next/link'
import { TrendingUp, Clock } from 'lucide-react'

// Mock data for now
const popularVCs = [
  { name: 'ABC 벤처스', reviewCount: 12, rating: 4.2 },
  { name: 'XYZ 캐피털', reviewCount: 8, rating: 3.8 },
  { name: 'DEF 인베스트먼츠', reviewCount: 15, rating: 4.5 },
]

const recentActivity = [
  { type: 'review', vcName: 'ABC 벤처스', time: '2시간 전' },
  { type: 'comment', vcName: 'XYZ 캐피털', time: '4시간 전' },
  { type: 'review', vcName: 'DEF 인베스트먼츠', time: '6시간 전' },
]

export function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Popular VCs */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">인기 VC</h3>
        </div>
        <div className="space-y-3">
          {popularVCs.map((vc, index) => (
            <Link key={vc.name} href={`/vcs/${encodeURIComponent(vc.name)}`}>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {vc.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    후기 {vc.reviewCount}개 • 평점 {vc.rating}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600">
                  {activity.type === 'review' ? '새 후기: ' : '새 댓글: '}
                </span>
                <span className="text-gray-900 font-medium">{activity.vcName}</span>
              </div>
              <span className="text-gray-500 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-primary-50 rounded-lg border border-primary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">
          플랫폼 통계
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-primary-700">전체 VC</span>
            <span className="font-medium text-primary-900">124개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-700">전체 후기</span>
            <span className="font-medium text-primary-900">1,247개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-700">이번 주 신규</span>
            <span className="font-medium text-primary-900">12개</span>
          </div>
        </div>
      </div>
    </div>
  )
}