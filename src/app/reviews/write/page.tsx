'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

// 투자 라운드 옵션
const INVESTMENT_ROUNDS = [
  { value: 'angel', label: '엔젤' },
  { value: 'seed', label: '시드' },
  { value: 'pre_a', label: 'Pre-A' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c', label: 'Series C' },
  { value: 'series_d', label: 'Series D' },
  { value: 'other', label: '기타' }
]

// 평가 태그 정의
const EVALUATION_TAGS = [
  { key: 'tag_communication', label: '소통', description: '원활한 커뮤니케이션' },
  { key: 'tag_consistency', label: '일관성', description: '말과 행동의 일치' },
  { key: 'tag_understanding', label: '이해도', description: '사업에 대한 이해' },
  { key: 'tag_leadership', label: '리더십', description: '리더십과 비전' },
  { key: 'tag_philosophy', label: '철학', description: '투자 철학의 명확성' },
  { key: 'tag_support', label: '지원', description: '실질적인 도움' },
  { key: 'tag_empathy', label: '공감', description: '창업자 입장 이해' },
  { key: 'tag_portfolio_interest', label: '포트폴리오 관심', description: '투자 후 관심도' },
  { key: 'tag_openness', label: '개방성', description: '새로운 아이디어 수용' },
  { key: 'tag_optimism', label: '낙관성', description: '긍정적 태도' },
  { key: 'tag_honesty', label: '정직성', description: '투명한 소통' },
  { key: 'tag_politeness', label: '예의', description: '매너와 존중' },
  { key: 'tag_intelligence', label: '지능', description: '통찰력과 전문성' }
]

interface VC {
  id: string
  name: string
}

export default function WriteReviewPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [vcs, setVcs] = useState<VC[]>([])
  
  // 폼 데이터
  const [selectedVc, setSelectedVc] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [investmentRound, setInvestmentRound] = useState('')
  const [investmentYear, setInvestmentYear] = useState(new Date().getFullYear())
  const [investmentMonth, setInvestmentMonth] = useState(new Date().getMonth() + 1)
  const [personnelName, setPersonnelName] = useState('')
  const [personnelPosition, setPersonnelPosition] = useState('')
  const [tags, setTags] = useState<{ [key: string]: boolean | null }>({})

  // 사용자 정보 및 권한 확인
  useEffect(() => {
    const checkUser = async () => {
      const client = createClient()
      const { data: { user } } = await client.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      
      // 프로필 정보 가져오기
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (!profile || profile.user_type !== 'founder') {
        alert('창업자만 후기를 작성할 수 있습니다.')
        router.push('/')
        return
      }
      
      setProfile(profile)
    }
    
    checkUser()
  }, [router])

  // VC 목록 가져오기
  useEffect(() => {
    const fetchVCs = async () => {
      console.log('Fetching VCs...')
      const client = createClient()
      const { data, error } = await client
        .from('vcs')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      
      if (error) {
        console.error('Error fetching VCs:', error)
      } else if (data) {
        console.log('VCs fetched:', data)
        setVcs(data)
      } else {
        console.log('No VCs found')
      }
    }
    
    fetchVCs()
  }, [])

  // 태그 토글
  const toggleTag = (key: string) => {
    setTags(prev => ({
      ...prev,
      [key]: prev[key] === true ? false : prev[key] === false ? null : true
    }))
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started')
    console.log('Selected VC:', selectedVc)
    console.log('Title:', title)
    console.log('Content:', content)
    console.log('Investment Round:', investmentRound)
    
    if (!selectedVc || !title || !content || !investmentRound) {
      setError('필수 항목을 모두 입력해주세요.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      console.log('Creating review with data:', {
        selectedVc,
        title,
        content,
        investmentRound,
        investmentYear,
        investmentMonth,
        tags
      })
      
      const supabase = createClient()
      
      // 담당자 정보 생성 (선택사항)
      let personnelId = null
      if (personnelName) {
        console.log('Creating personnel:', personnelName, personnelPosition)
        const { data: personnel, error: personnelError } = await supabase
          .from('vc_personnel')
          .insert({
            vc_id: selectedVc,
            name: personnelName,
            position: personnelPosition || '미상',
            start_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single()
        
        if (personnelError) {
          console.error('Personnel creation error:', personnelError)
        }
        
        if (personnel) {
          personnelId = personnel.id
          console.log('Personnel created with ID:', personnelId)
        }
      }
      
      // 후기 생성
      const reviewData = {
        author_id: user.id,
        vc_id: selectedVc,
        personnel_id: personnelId,
        title,
        content,
        investment_round: investmentRound,
        investment_year: investmentYear,
        investment_month: investmentMonth,
        status: 'published',
        ...Object.fromEntries(
          Object.entries(tags).map(([key, value]) => [key, value])
        )
      }
      
      console.log('Inserting review data:', reviewData)
      
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single()
      
      if (reviewError) {
        console.error('Review creation error:', reviewError)
        throw reviewError
      }
      
      console.log('Review created:', review)
      
      // 크레딧 추가 (+5) - API 엔드포인트 사용
      try {
        const creditResponse = await fetch('/api/credit-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            reviewId: review.id,
            amount: 5,
            transactionType: 'earned_write'
          })
        })

        const creditResult = await creditResponse.json()
        
        if (!creditResponse.ok) {
          console.error('Credit transaction error:', creditResult.error)
        } else {
          console.log('Credit transaction success:', creditResult)
        }
      } catch (creditError) {
        console.error('Credit API error:', creditError)
      }
      
      alert('후기가 성공적으로 작성되었습니다. 5크레딧을 획득했습니다!')
      router.push(`/reviews/${review.id}`)
      
    } catch (err: any) {
      console.error('Submission error:', err)
      setError(`후기 작성 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">투자 후기 작성</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* VC 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VC 선택 *
              </label>
              <select
                value={selectedVc}
                onChange={(e) => setSelectedVc(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">VC를 선택하세요</option>
                {vcs.map(vc => (
                  <option key={vc.id} value={vc.id}>{vc.name}</option>
                ))}
              </select>
            </div>

            {/* 투자 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투자 라운드 *
                </label>
                <select
                  value={investmentRound}
                  onChange={(e) => setInvestmentRound(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">선택하세요</option>
                  {INVESTMENT_ROUNDS.map(round => (
                    <option key={round.value} value={round.value}>{round.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투자 연도 *
                </label>
                <input
                  type="number"
                  value={investmentYear}
                  onChange={(e) => setInvestmentYear(parseInt(e.target.value))}
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투자 월 *
                </label>
                <select
                  value={investmentMonth}
                  onChange={(e) => setInvestmentMonth(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}월</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 담당자 정보 (선택사항) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당자 이름 (선택)
                </label>
                <input
                  type="text"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당자 직책 (선택)
                </label>
                <input
                  type="text"
                  value={personnelPosition}
                  onChange={(e) => setPersonnelPosition(e.target.value)}
                  placeholder="예: 파트너, 심사역"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="후기 제목을 입력하세요"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 후기 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="투자 과정에서의 경험을 자세히 작성해주세요"
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* 평가 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                평가 태그 (선택)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EVALUATION_TAGS.map(tag => (
                  <div key={tag.key} className="border rounded-lg p-3">
                    <div className="font-medium text-sm mb-1">{tag.label}</div>
                    <div className="text-xs text-gray-500 mb-2">{tag.description}</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTags(prev => ({ ...prev, [tag.key]: true }))}
                        className={`px-3 py-1 text-xs rounded ${
                          tags[tag.key] === true 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        긍정
                      </button>
                      <button
                        type="button"
                        onClick={() => setTags(prev => ({ ...prev, [tag.key]: false }))}
                        className={`px-3 py-1 text-xs rounded ${
                          tags[tag.key] === false 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        부정
                      </button>
                      <button
                        type="button"
                        onClick={() => setTags(prev => ({ ...prev, [tag.key]: null }))}
                        className={`px-3 py-1 text-xs rounded ${
                          tags[tag.key] === null || tags[tag.key] === undefined
                            ? 'bg-gray-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        해당없음
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/reviews')}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? '작성 중...' : '후기 작성 (+5 크레딧)'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}