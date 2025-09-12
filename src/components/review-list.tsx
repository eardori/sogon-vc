'use client'

import { ReviewCard } from './review-card'

// Mock data for now
const mockReviews = [
  {
    id: '1',
    title: 'A라운드 투자 경험 후기',
    vcName: 'ABC 벤처스',
    companyName: 'A사',
    investmentRound: 'Series A',
    investmentDate: '2023-10',
    excerpt: '전반적으로 만족스러운 투자 경험이었습니다. 담당자가 매우 전문적이고...',
    tags: {
      communication: 'positive',
      consistency: 'positive',
      understanding: 'neutral',
    },
    createdAt: '2023-11-15',
  },
  {
    id: '2',
    title: 'Pre-A 라운드 투자 진행 후기',
    vcName: 'XYZ 캐피털',
    companyName: 'B사',
    investmentRound: 'Pre-A',
    investmentDate: '2023-09',
    excerpt: '투자 프로세스가 다소 길었지만, 결과적으로는...',
    tags: {
      communication: 'negative',
      consistency: 'positive',
      understanding: 'positive',
    },
    createdAt: '2023-11-12',
  },
]

export function ReviewList() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        최신 후기
      </h2>
      
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}