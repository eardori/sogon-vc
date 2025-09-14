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

// 투자 라운드 색상 매핑
const ROUND_COLORS: { [key: string]: string } = {
  angel: 'bg-purple-100 text-purple-700 border-purple-200',
  seed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pre_a: 'bg-blue-100 text-blue-700 border-blue-200',
  series_a: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  series_b: 'bg-violet-100 text-violet-700 border-violet-200',
  series_c: 'bg-amber-100 text-amber-700 border-amber-200',
  series_d: 'bg-rose-100 text-rose-700 border-rose-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200'
}

// 평가 태그 정의 (아이콘과 색상 추가)
const EVALUATION_TAGS = [
  { 
    key: 'tag_communication', 
    label: '소통', 
    description: '원활한 커뮤니케이션', 
    icon: '💬',
    positiveColor: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_consistency', 
    label: '일관성', 
    description: '말과 행동의 일치', 
    icon: '⚖️',
    positiveColor: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_understanding', 
    label: '이해도', 
    description: '사업에 대한 이해', 
    icon: '🧠',
    positiveColor: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_leadership', 
    label: '리더십', 
    description: '리더십과 비전', 
    icon: '👑',
    positiveColor: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_philosophy', 
    label: '철학', 
    description: '투자 철학의 명확성', 
    icon: '🎯',
    positiveColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_support', 
    label: '지원', 
    description: '실질적인 도움', 
    icon: '🤝',
    positiveColor: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_empathy', 
    label: '공감', 
    description: '창업자 입장 이해', 
    icon: '❤️',
    positiveColor: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_portfolio_interest', 
    label: '포트폴리오 관심', 
    description: '투자 후 관심도', 
    icon: '📈',
    positiveColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_openness', 
    label: '개방성', 
    description: '새로운 아이디어 수용', 
    icon: '🚀',
    positiveColor: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_optimism', 
    label: '낙관성', 
    description: '긍정적 태도', 
    icon: '☀️',
    positiveColor: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_honesty', 
    label: '정직성', 
    description: '투명한 소통', 
    icon: '🔍',
    positiveColor: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_politeness', 
    label: '예의', 
    description: '매너와 존중', 
    icon: '🙏',
    positiveColor: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  { 
    key: 'tag_intelligence', 
    label: '지능', 
    description: '통찰력과 전문성', 
    icon: '⭐',
    positiveColor: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    negativeColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  }
]

interface ReviewDetail {
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
    website?: string
    description?: string
  }
  personnel?: {
    name: string
    position: string
  }
  [key: string]: any // For tag fields
}

interface VCResponse {
  id: string
  content: string
  is_official: boolean
  created_at: string
  author: {
    company_name: string
    user_type: string
  }
}

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [vcResponses, setVcResponses] = useState<VCResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [hasLiked, setHasLiked] = useState<boolean | null>(null)
  const [responseContent, setResponseContent] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

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

  // 후기 상세 정보 가져오기
  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true)
      const supabase = createClient()
      
      // 후기 기본 정보 가져오기
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          *,
          author:profiles!reviews_author_id_fkey(
            id,
            anonymous_company_name
          ),
          vc:vcs!reviews_vc_id_fkey(
            id,
            name,
            website,
            description
          ),
          personnel:vc_personnel(
            name,
            position
          )
        `)
        .eq('id', params.id)
        .single()

      if (reviewError || !reviewData) {
        console.error('Error fetching review:', reviewError)
        router.push('/reviews')
        return
      }

      // 권한 확인 및 크레딧 처리
      if (user && reviewData.author?.id && reviewData.author.id !== user.id) {
        // 이미 조회한 적이 있는지 확인
        const { data: existingView } = await supabase
          .from('review_views')
          .select('id')
          .eq('user_id', user.id)
          .eq('review_id', params.id)
          .single()

        if (!existingView) {
          // 크레딧 확인
          if (!profile || profile.credits < 1) {
            alert('크레딧이 부족합니다. 후기를 작성하여 크레딧을 획득하세요.')
            router.push('/reviews')
            return
          }

          // 크레딧 차감 - API 엔드포인트 사용
          try {
            const creditResponse = await fetch('/api/credit-transaction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                reviewId: params.id,
                amount: -1,
                transactionType: 'spent_read'
              })
            })

            const creditResult = await creditResponse.json()
            
            if (creditResponse.ok) {
              // 조회 기록 생성
              await supabase
                .from('review_views')
                .insert({
                  user_id: user.id,
                  review_id: params.id
                })

              // 조회수 증가
              await supabase
                .from('reviews')
                .update({ view_count: reviewData.view_count + 1 })
                .eq('id', params.id)
                
              console.log('Credit transaction success:', creditResult)
            } else {
              console.error('Credit transaction error:', creditResult.error)
            }
          } catch (creditError) {
            console.error('Credit API error:', creditError)
          }
        }
      }

      setReview(reviewData)

      // VC 답변 가져오기
      const { data: responses } = await supabase
        .from('vc_responses')
        .select(`
          *,
          author:profiles!vc_responses_author_id_fkey(
            company_name,
            user_type
          )
        `)
        .eq('review_id', params.id)
        .order('created_at', { ascending: false })

      if (responses) {
        setVcResponses(responses)
      }

      // 사용자의 좋아요/싫어요 상태 확인
      if (user) {
        const { data: reaction } = await supabase
          .from('review_reactions')
          .select('is_like')
          .eq('review_id', params.id)
          .eq('user_id', user.id)
          .single()

        if (reaction) {
          setHasLiked(reaction.is_like)
        }
      }

      setLoading(false)
    }

    fetchReview()
  }, [params.id, user, profile, router])

  // 좋아요/싫어요 토글
  const handleReaction = async (isLike: boolean) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/auth/login')
      return
    }

    const supabase = createClient()
    
    if (hasLiked === isLike) {
      // 이미 선택한 것을 다시 클릭하면 취소
      await supabase
        .from('review_reactions')
        .delete()
        .eq('review_id', params.id)
        .eq('user_id', user.id)

      setHasLiked(null)
      
      // 카운트 업데이트
      if (review) {
        const updateData = isLike 
          ? { like_count: review.like_count - 1 }
          : { dislike_count: review.dislike_count - 1 }
        
        await supabase
          .from('reviews')
          .update(updateData)
          .eq('id', params.id)
        
        setReview({
          ...review,
          ...updateData
        })
      }
    } else {
      // 새로운 반응 또는 변경
      const { error } = await supabase
        .from('review_reactions')
        .upsert({
          review_id: params.id,
          user_id: user.id,
          is_like: isLike
        })

      if (!error) {
        const prevLiked = hasLiked
        setHasLiked(isLike)
        
        // 카운트 업데이트
        if (review) {
          let updateData: any = {}
          
          if (prevLiked === null) {
            // 처음 반응
            updateData = isLike 
              ? { like_count: review.like_count + 1 }
              : { dislike_count: review.dislike_count + 1 }
          } else {
            // 반응 변경
            updateData = isLike 
              ? { like_count: review.like_count + 1, dislike_count: review.dislike_count - 1 }
              : { like_count: review.like_count - 1, dislike_count: review.dislike_count + 1 }
          }
          
          await supabase
            .from('reviews')
            .update(updateData)
            .eq('id', params.id)
          
          setReview({
            ...review,
            ...updateData
          })
        }
      }
    }
  }

  // VC 답변 제출
  const handleSubmitResponse = async () => {
    if (!user || !profile) {
      alert('로그인이 필요합니다.')
      return
    }

    const supabase = createClient()
    
    if (profile.user_type !== 'vc_general' && profile.user_type !== 'vc_anonymous') {
      alert('VC 회원만 답변을 작성할 수 있습니다.')
      return
    }

    if (!responseContent.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    setSubmittingResponse(true)

    const { data, error } = await supabase
      .from('vc_responses')
      .insert({
        review_id: params.id,
        author_id: user.id,
        content: responseContent,
        is_official: profile.user_type === 'vc_general'
      })
      .select(`
        *,
        author:profiles!vc_responses_author_id_fkey(
          company_name,
          user_type
        )
      `)
      .single()

    if (error) {
      alert('답변 작성 중 오류가 발생했습니다.')
    } else if (data) {
      setVcResponses([data, ...vcResponses])
      setResponseContent('')
      alert('답변이 등록되었습니다.')
    }

    setSubmittingResponse(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">리뷰를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-xl font-semibold text-gray-800">후기를 찾을 수 없습니다</h2>
          <p className="text-gray-600">요청하신 후기가 삭제되었거나 존재하지 않습니다.</p>
          <Link href="/reviews">
            <Button className="mt-4">목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  // 태그 분류
  const positiveTags = EVALUATION_TAGS.filter(tag => review[tag.key] === true)
  const negativeTags = EVALUATION_TAGS.filter(tag => review[tag.key] === false)

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100">
      {/* 네비게이션 헤더 */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/reviews">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                목록
              </Button>
            </Link>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {review.view_count.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(review.created_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 히어로 섹션 */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-soft animate-fade-in">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-3">
                      {review.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${ROUND_COLORS[review.investment_round] || ROUND_COLORS.other}`}>
                        {INVESTMENT_ROUND_LABELS[review.investment_round]} 라운드
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {review.investment_year}년 {review.investment_month}월
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* VC 정보 카드 */}
                <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-primary-800 mb-1">{review.vc?.name || '알 수 없음'}</h3>
                      {review.personnel && (
                        <p className="text-primary-700 text-sm font-medium">
                          {review.personnel.name} {review.personnel.position}
                        </p>
                      )}
                      {review.vc?.website && (
                        <a 
                          href={review.vc.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 text-sm hover:text-primary-800 transition-colors inline-flex items-center gap-1 mt-1"
                        >
                          웹사이트 방문
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <div className="text-right text-sm text-primary-700">
                      <div>작성자</div>
                      <div className="font-semibold">{review.author?.anonymous_company_name || '익명'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 평가 태그 시각화 */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-primary-500 to-indigo-500 w-1 h-6 rounded-full"></span>
                  평가 태그
                </h3>
                
                {positiveTags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-emerald-700">긍정적 평가</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {positiveTags.map(tag => (
                        <div
                          key={tag.key}
                          className={`group relative px-4 py-2 rounded-lg border transition-all duration-200 cursor-help ${tag.positiveColor}`}
                          onMouseEnter={() => setShowTooltip(tag.key)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{tag.icon}</span>
                            <span className="font-medium text-sm">{tag.label}</span>
                          </div>
                          
                          {showTooltip === tag.key && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-slide-up">
                              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                {tag.description}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {negativeTags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-red-700">부정적 평가</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {negativeTags.map(tag => (
                        <div
                          key={tag.key}
                          className={`group relative px-4 py-2 rounded-lg border transition-all duration-200 cursor-help ${tag.negativeColor}`}
                          onMouseEnter={() => setShowTooltip(tag.key)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base opacity-60">{tag.icon}</span>
                            <span className="font-medium text-sm">{tag.label}</span>
                          </div>
                          
                          {showTooltip === tag.key && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-slide-up">
                              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                {tag.description}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {positiveTags.length === 0 && negativeTags.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🤔</div>
                    <p>평가 태그가 설정되지 않았습니다.</p>
                  </div>
                )}
              </div>

              {/* 상세 후기 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-primary-500 to-indigo-500 w-1 h-6 rounded-full"></span>
                  상세 후기
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
                      {review.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* 반응 버튼 */}
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-gray-100">
                <button
                  onClick={() => handleReaction(true)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                    hasLiked === true 
                      ? 'bg-primary-500 text-white shadow-lg scale-105' 
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <div className={`text-xl transition-transform duration-300 ${hasLiked === true ? 'scale-110' : 'group-hover:scale-110'}`}>
                    👍
                  </div>
                  <div className="text-center">
                    <div className="text-sm">도움이 됐어요</div>
                    <div className="text-lg font-bold">{review.like_count}</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleReaction(false)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                    hasLiked === false 
                      ? 'bg-red-500 text-white shadow-lg scale-105' 
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-300 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <div className={`text-xl transition-transform duration-300 ${hasLiked === false ? 'scale-110' : 'group-hover:scale-110'}`}>
                    👎
                  </div>
                  <div className="text-center">
                    <div className="text-sm">아쉬웠어요</div>
                    <div className="text-lg font-bold">{review.dislike_count}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* VC 답변 섹션 */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-primary-500 to-indigo-500 w-1 h-8 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">VC 답변</h2>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span>{vcResponses.length}개</span>
                </div>
              </div>
              
              {/* VC 답변 작성 폼 (VC 회원만) */}
              {profile?.user_type === 'vc_general' || profile?.user_type === 'vc_anonymous' ? (
                <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {profile.company_name?.[0] || 'V'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {profile.user_type === 'vc_general' 
                          ? `${profile.company_name}로 답변` 
                          : '익명 VC로 답변'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {profile.user_type === 'vc_general' ? '공식 답변으로 게시됩니다' : '익명 답변으로 게시됩니다'}
                      </div>
                    </div>
                  </div>
                  <textarea
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    placeholder="창업자들에게 도움이 될 답변을 작성해주세요..."
                    rows={4}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={handleSubmitResponse}
                      disabled={submittingResponse || !responseContent.trim()}
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 transition-all duration-200"
                    >
                      {submittingResponse ? '답변 등록 중...' : '답변 등록'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* VC 답변 목록 */}
              {vcResponses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">💭</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">아직 VC 답변이 없습니다</h3>
                  <p className="text-sm">첫 번째 답변을 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vcResponses.map((response, index) => (
                    <div 
                      key={response.id} 
                      className="group border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          response.is_official ? 'bg-primary-500' : 'bg-gray-400'
                        }`}>
                          {response.is_official ? response.author.company_name?.[0] || 'V' : 'VC'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {response.is_official ? (
                                <>
                                  <span className="font-bold text-primary-700">
                                    {response.author.company_name}
                                  </span>
                                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                    공식 답변
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="font-bold text-gray-600">익명 VC</span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                    익명 답변
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(response.created_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {response.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* 통계 카드 */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-soft">
                <h3 className="font-bold text-gray-900 mb-4">리뷰 통계</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">긍정 태그</span>
                    </div>
                    <span className="font-bold text-emerald-600">{positiveTags.length}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">부정 태그</span>
                    </div>
                    <span className="font-bold text-red-600">{negativeTags.length}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">도움됨</span>
                    </div>
                    <span className="font-bold text-blue-600">{review.like_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">아쉬움</span>
                    </div>
                    <span className="font-bold text-gray-600">{review.dislike_count}</span>
                  </div>
                </div>
              </div>

              {/* 관련 정보 */}
              {review.vc?.description && (
                <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-soft">
                  <h3 className="font-bold text-gray-900 mb-4">VC 소개</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.vc.description}
                  </p>
                </div>
              )}

              {/* 액션 카드 */}
              <div className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-2">더 많은 후기가 필요하신가요?</h3>
                <p className="text-sm text-primary-100 mb-4">
                  다른 창업자들의 생생한 VC 투자 경험을 확인해보세요.
                </p>
                <Link href="/reviews">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200"
                  >
                    전체 후기 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}