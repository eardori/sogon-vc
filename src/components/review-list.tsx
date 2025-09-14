'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReviewCard } from './review-card'

interface Review {
  id: string
  title: string
  content: string
  investment_round: string
  investment_year: number
  investment_month: number
  view_count: number
  like_count: number
  dislike_count: number
  created_at: string
  tag_communication: boolean | null
  tag_consistency: boolean | null
  tag_understanding: boolean | null
  tag_leadership: boolean | null
  tag_philosophy: boolean | null
  tag_support: boolean | null
  tag_empathy: boolean | null
  tag_portfolio_interest: boolean | null
  tag_openness: boolean | null
  tag_optimism: boolean | null
  tag_honesty: boolean | null
  tag_politeness: boolean | null
  tag_intelligence: boolean | null
  author: {
    id: string
    anonymous_company_name: string
  }
  vc: {
    id: string
    name: string
  }
  personnel?: {
    name: string
    position: string
  }
}

interface ReviewListProps {
  searchQuery?: string
}

export function ReviewList({ searchQuery }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const supabase = createClient()
        
        let query = supabase
          .from('reviews')
          .select(`
            id,
            title,
            content,
            investment_round,
            investment_year,
            investment_month,
            view_count,
            like_count,
            dislike_count,
            created_at,
            tag_communication,
            tag_consistency,
            tag_understanding,
            tag_leadership,
            tag_philosophy,
            tag_support,
            tag_empathy,
            tag_portfolio_interest,
            tag_openness,
            tag_optimism,
            tag_honesty,
            tag_politeness,
            tag_intelligence,
            author:profiles!reviews_author_id_fkey(
              id,
              anonymous_company_name
            ),
            vc:vcs!reviews_vc_id_fkey(
              id,
              name
            ),
            personnel:vc_personnel(
              name,
              position
            )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10)

        // 검색어가 있으면 VC 이름으로 필터링
        if (searchQuery) {
          // VC 이름으로 검색하려면 먼저 VC ID를 찾아야 함
          const { data: vcs } = await supabase
            .from('vcs')
            .select('id')
            .ilike('name', `%${searchQuery}%`)
          
          if (vcs && vcs.length > 0) {
            const vcIds = vcs.map(vc => vc.id)
            query = query.in('vc_id', vcIds)
          }
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw fetchError
        }

        console.log('Fetched reviews:', data?.length || 0, 'reviews')
        setReviews(data || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(`후기를 불러오는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [searchQuery])

  // 투자 라운드 라벨
  const getInvestmentRoundLabel = (round: string) => {
    const labels: { [key: string]: string } = {
      angel: '엔젤',
      seed: '시드',
      pre_a: 'Pre-A',
      series_a: 'Series A',
      series_b: 'Series B',
      series_c: 'Series C',
      series_d: 'Series D',
      other: '기타'
    }
    return labels[round] || round
  }

  // 태그 상태 결정 함수
  const getTagStatus = (value: boolean | null): 'positive' | 'negative' | 'neutral' => {
    if (value === true) return 'positive'
    if (value === false) return 'negative'
    return 'neutral'
  }

  // ReviewCard에 맞는 형식으로 데이터 변환
  const transformReview = (review: Review) => ({
    id: review.id,
    title: review.title,
    vcName: review.vc?.name || '알 수 없음',
    companyName: review.author?.anonymous_company_name || '익명',
    investmentRound: getInvestmentRoundLabel(review.investment_round),
    investmentDate: `${review.investment_year}-${String(review.investment_month).padStart(2, '0')}`,
    excerpt: review.content.substring(0, 150) + (review.content.length > 150 ? '...' : ''),
    tags: {
      communication: getTagStatus(review.tag_communication),
      consistency: getTagStatus(review.tag_consistency),
      understanding: getTagStatus(review.tag_understanding),
    },
    createdAt: new Date(review.created_at).toLocaleDateString('ko-KR'),
    viewCount: review.view_count,
    likeCount: review.like_count,
    dislikeCount: review.dislike_count
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {searchQuery ? `"${searchQuery}" 검색 결과` : '최신 후기'}
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {searchQuery ? `"${searchQuery}" 검색 결과` : '최신 후기'}
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
          {error}
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {searchQuery ? `"${searchQuery}" 검색 결과` : '최신 후기'}
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-600 text-center">
          {searchQuery ? '검색 결과가 없습니다.' : '아직 작성된 후기가 없습니다.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {searchQuery ? `"${searchQuery}" 검색 결과` : '최신 후기'}
      </h2>
      
      <div className="space-y-4">
        {reviews.filter(review => review && review.id).map((review) => (
          <ReviewCard key={review.id} review={transformReview(review)} />
        ))}
      </div>
      
      {reviews.length === 10 && (
        <div className="text-center pt-4">
          <a href="/reviews" className="text-primary-600 hover:text-primary-700 font-medium">
            더 많은 후기 보기 →
          </a>
        </div>
      )}
    </div>
  )
}