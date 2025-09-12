'use client'

import Link from 'next/link'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface ReviewCardProps {
  review: {
    id: string
    title: string
    vcName: string
    companyName: string
    investmentRound: string
    investmentDate: string
    excerpt: string
    tags: {
      communication: 'positive' | 'negative' | 'neutral'
      consistency: 'positive' | 'negative' | 'neutral'
      understanding: 'positive' | 'negative' | 'neutral'
    }
    createdAt: string
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getTagColor = (value: 'positive' | 'negative' | 'neutral') => {
    switch (value) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      case 'neutral': return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getTagIcon = (value: 'positive' | 'negative' | 'neutral') => {
    switch (value) {
      case 'positive': return <ThumbsUp className="h-3 w-3" />
      case 'negative': return <ThumbsDown className="h-3 w-3" />
      case 'neutral': return null
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link href={`/reviews/${review.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
              {review.title}
            </h3>
          </Link>
          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
            <span>{review.vcName}</span>
            <span>•</span>
            <span>{review.companyName}</span>
            <span>•</span>
            <span>{review.investmentRound}</span>
            <span>•</span>
            <span>{review.investmentDate}</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">{review.createdAt}</span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{review.excerpt}</p>

      <div className="flex flex-wrap gap-2">
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(review.tags.communication)}`}>
          {getTagIcon(review.tags.communication)}
          <span>소통</span>
        </div>
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(review.tags.consistency)}`}>
          {getTagIcon(review.tags.consistency)}
          <span>일관성</span>
        </div>
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(review.tags.understanding)}`}>
          {getTagIcon(review.tags.understanding)}
          <span>이해도</span>
        </div>
      </div>
    </div>
  )
}