'use client'

import Link from 'next/link'
import { ThumbsUp, ThumbsDown, Eye, Calendar, Building, TrendingUp } from 'lucide-react'

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
    viewCount?: number
    likeCount?: number
    dislikeCount?: number
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getTagStyle = (value: 'positive' | 'negative' | 'neutral') => {
    switch (value) {
      case 'positive': return 'tag-positive'
      case 'negative': return 'tag-negative'
      case 'neutral': return 'tag-neutral'
    }
  }

  const getTagIcon = (value: 'positive' | 'negative' | 'neutral') => {
    switch (value) {
      case 'positive': return <ThumbsUp className="h-3.5 w-3.5" />
      case 'negative': return <ThumbsDown className="h-3.5 w-3.5" />
      case 'neutral': return <TrendingUp className="h-3.5 w-3.5" />
    }
  }
  
  const tagLabels = {
    communication: '소통',
    consistency: '일관성', 
    understanding: '이해도'
  }

  return (
    <article className="card-interactive group animate-fade-in">
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/reviews/${review.id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-2">
                {review.title}
              </h3>
            </Link>
            
            {/* VC and Company Info */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{review.vcName}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">{review.companyName}</span>
            </div>
            
            {/* Investment Details */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{review.investmentRound}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{review.investmentDate}</span>
              </div>
            </div>
          </div>
          
          {/* Date Badge */}
          <div className="flex-shrink-0 ml-4">
            <time className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
              {review.createdAt}
            </time>
          </div>
        </div>
      </div>
      
      {/* Content Preview */}
      <div className="px-6 pb-4">
        <p className="text-gray-700 leading-relaxed line-clamp-2 text-sm">
          {review.excerpt}
        </p>
      </div>
      
      {/* Tags Section */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(review.tags).map(([key, value]) => (
            <div 
              key={key}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${getTagStyle(value)} transition-all duration-200 hover:scale-105`}
            >
              {getTagIcon(value)}
              <span>{tagLabels[key as keyof typeof tagLabels]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Stats */}
      {(review.viewCount !== undefined || review.likeCount !== undefined) && (
        <div className="px-6 py-3 border-t border-gray-50 bg-gray-25 rounded-b-2xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              {review.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{review.viewCount.toLocaleString()}</span>
                </div>
              )}
              {review.likeCount !== undefined && (
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5 text-success-500" />
                  <span>{review.likeCount}</span>
                </div>
              )}
              {review.dislikeCount !== undefined && review.dislikeCount > 0 && (
                <div className="flex items-center gap-1">
                  <ThumbsDown className="h-3.5 w-3.5 text-error-500" />
                  <span>{review.dislikeCount}</span>
                </div>
              )}
            </div>
            
            <Link 
              href={`/reviews/${review.id}`}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              자세히 보기 →
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}