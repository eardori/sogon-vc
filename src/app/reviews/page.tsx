'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

// 투자 라운드 라벨
const INVESTMENT_ROUND_LABELS: { [key: string]: string } = {
  angel: '엔젤',
  seed: '시드',
  pre_a: 'Pre-A',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
  series_d: 'Series D',
  other: '기타'
}

// 평가 태그 정의
const EVALUATION_TAGS = [
  { key: 'tag_communication', label: '소통' },
  { key: 'tag_consistency', label: '일관성' },
  { key: 'tag_understanding', label: '이해도' },
  { key: 'tag_leadership', label: '리더십' },
  { key: 'tag_philosophy', label: '철학' },
  { key: 'tag_support', label: '지원' },
  { key: 'tag_empathy', label: '공감' },
  { key: 'tag_portfolio_interest', label: '포트폴리오 관심' },
  { key: 'tag_openness', label: '개방성' },
  { key: 'tag_optimism', label: '낙관성' },
  { key: 'tag_honesty', label: '정직성' },
  { key: 'tag_politeness', label: '예의' },
  { key: 'tag_intelligence', label: '지능' }
]

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
  is_viewed?: boolean
  tag_summary?: {
    positive: string[]
    negative: string[]
  }
}

export default function ReviewsPage() {
  const router = useRouter()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedVc, setSelectedVc] = useState('')
  const [selectedRound, setSelectedRound] = useState('')
  const [vcs, setVcs] = useState<any[]>([])

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }
    fetchUser()
  }, [])

  // VC 목록 가져오기
  useEffect(() => {
    const fetchVCs = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('vcs')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      
      if (data) {
        setVcs(data)
      }
    }
    fetchVCs()
  }, [])

  // 후기 목록 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
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

      // 필터 적용
      if (selectedVc) {
        query = query.eq('vc_id', selectedVc)
      }
      if (selectedRound) {
        query = query.eq('investment_round', selectedRound)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching reviews:', error)
      } else if (data) {
        // 사용자가 이미 조회한 후기 확인
        let viewedReviews: string[] = []
        if (user) {
          const { data: views } = await supabase
            .from('review_views')
            .select('review_id')
            .eq('user_id', user.id)
          
          viewedReviews = views?.map(v => v.review_id) || []
        }

        // 태그 요약 생성
        const processedReviews = data.map(review => {
          const positive: string[] = []
          const negative: string[] = []
          
          EVALUATION_TAGS.forEach(tag => {
            const value = review[tag.key]
            if (value === true) positive.push(tag.label)
            if (value === false) negative.push(tag.label)
          })

          return {
            ...review,
            is_viewed: viewedReviews.includes(review.id),
            tag_summary: { positive, negative }
          }
        })

        setReviews(processedReviews)
      }
      
      setLoading(false)
    }

    fetchReviews()
  }, [selectedVc, selectedRound, user])

  // 후기 클릭 핸들러
  const handleReviewClick = async (review: Review) => {
    // 본인 작성 후기거나 이미 조회한 후기는 바로 이동
    if (review.author?.id === user?.id || review.is_viewed) {
      router.push(`/reviews/${review.id}`)
      return
    }

    // 크레딧 확인
    if (!profile || profile.credits < 1) {
      alert('크레딧이 부족합니다. 후기를 작성하여 크레딧을 획득하세요.')
      return
    }

    // 크레딧 차감 확인
    if (confirm('1크레딧을 사용하여 후기를 조회하시겠습니까?')) {
      router.push(`/reviews/${review.id}`)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                <span className="text-gradient">투자 후기</span>
              </h1>
              <p className="text-lg text-gray-600">실제 창업자들의 VC 투자 경험을 확인하세요</p>
            </div>
            
            {profile?.user_type === 'founder' && (
              <Link href="/reviews/write">
                <Button className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <span className="flex items-center gap-2">
                    후기 작성
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                      +5 크레딧
                    </span>
                  </span>
                </Button>
              </Link>
            )}
          </div>

          {/* 크레딧 정보 카드 */}
          {profile && (
            <div className="card p-6 mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-2xl">
                    <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">크</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">보유 크레딧</span>
                    </div>
                    <span className="text-2xl font-bold text-primary-600">{profile.credits || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>후기 조회: <span className="font-semibold text-red-600">-1 크레딧</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                    <span>후기 작성: <span className="font-semibold text-success-600">+5 크레딧</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 필터 섹션 */}
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">필터</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  VC 선택
                </label>
                <div className="relative">
                  <select
                    value={selectedVc}
                    onChange={(e) => setSelectedVc(e.target.value)}
                    className="input-field appearance-none pr-10 cursor-pointer"
                  >
                    <option value="">전체 VC</option>
                    {vcs.map(vc => (
                      <option key={vc.id} value={vc.id}>{vc.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  투자 라운드
                </label>
                <div className="relative">
                  <select
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(e.target.value)}
                    className="input-field appearance-none pr-10 cursor-pointer"
                  >
                    <option value="">전체 라운드</option>
                    {Object.entries(INVESTMENT_ROUND_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 후기 목록 */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="card text-center py-16 animate-fade-in">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 후기가 없어요</h3>
                <p className="text-gray-600 mb-6">첫 번째 후기를 작성해주세요!</p>
                {profile?.user_type === 'founder' && (
                  <Link href="/reviews/write">
                    <Button className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      첫 후기 작성하기
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 결과 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  후기 {reviews.length.toLocaleString()}개
                </h2>
                <div className="text-sm text-gray-500">
                  최신 순으로 정렬
                </div>
              </div>
              
              {reviews.map((review, index) => (
                <article
                  key={review.id}
                  className={`card-interactive cursor-pointer animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleReviewClick(review)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
                          {review.title}
                        </h3>
                        
                        {/* VC 정보 */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <span className="text-primary-600 text-sm font-bold">
                                {review.vc?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{review.vc?.name || '알 수 없음'}</div>
                              {review.personnel && (
                                <div className="text-xs text-gray-500">
                                  {review.personnel.name} {review.personnel.position}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* 투자 정보 */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                            <span>{INVESTMENT_ROUND_LABELS[review.investment_round]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{review.investment_year}년 {review.investment_month}월</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{review.author?.anonymous_company_name || '익명'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {review.is_viewed && (
                          <span className="px-2.5 py-1 bg-success-100 text-success-700 text-xs font-semibold rounded-full border border-success-200">
                            조회함
                          </span>
                        )}
                        <time className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </time>
                      </div>
                    </div>

                    {/* 태그 요약 */}
                    {review.tag_summary && (
                      <div className="mb-4">
                        <div className="flex gap-2 flex-wrap">
                          {review.tag_summary.positive.slice(0, 3).map(tag => (
                            <span key={tag} className="tag-positive text-xs">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {tag}
                            </span>
                          ))}
                          {review.tag_summary.negative.slice(0, 2).map(tag => (
                            <span key={tag} className="tag-negative text-xs">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              {tag}
                            </span>
                          ))}
                          {(review.tag_summary.positive.length + review.tag_summary.negative.length) > 5 && (
                            <span className="tag-default text-xs">
                              +{(review.tag_summary.positive.length + review.tag_summary.negative.length) - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 내용 미리보기 */}
                    <p className="text-gray-700 line-clamp-2 text-sm leading-relaxed mb-4">
                      {review.content}
                    </p>

                    {/* 하단 메타 정보 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{review.view_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{review.like_count}</span>
                        </div>
                        {review.dislike_count > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                            </svg>
                            <span>{review.dislike_count}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors duration-200">
                        자세히 보기 →
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}