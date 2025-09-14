import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYWN5eGtsYnZuaWlrdXd5d2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY3MTc5NywiZXhwIjoyMDczMjQ3Nzk3fQ.DMOvj8-4Rhy_PHJrtWhpW6-C9q6cLqfBaghnwHikq3Y',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    // 전체 VC 수
    const { count: totalVCs } = await supabaseAdmin
      .from('vcs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // 전체 후기 수
    const { count: totalReviews } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // 이번 주 신규 후기 수
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { count: weeklyReviews } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('created_at', oneWeekAgo.toISOString())

    // 인기 VC (후기 수 기준 상위 3개)
    const { data: popularVCs } = await supabaseAdmin
      .from('vcs')
      .select(`
        id,
        name,
        reviews:reviews(count)
      `)
      .eq('is_active', true)
      .eq('reviews.status', 'published')
      .order('reviews_count', { ascending: false })
      .limit(3)

    // 리뷰 카운트를 수동으로 계산
    const { data: vcReviewCounts } = await supabaseAdmin
      .from('reviews')
      .select('vc_id')
      .eq('status', 'published')
    
    const vcCountMap = new Map()
    vcReviewCounts?.forEach(review => {
      const count = vcCountMap.get(review.vc_id) || 0
      vcCountMap.set(review.vc_id, count + 1)
    })

    // VC 정보 가져오기
    const { data: vcs } = await supabaseAdmin
      .from('vcs')
      .select('id, name')
      .eq('is_active', true)
    
    const vcsWithCounts = vcs?.map(vc => ({
      ...vc,
      reviewCount: vcCountMap.get(vc.id) || 0
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3)

    // 최근 활동 (최근 후기 3개)
    const { data: recentReviews } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        created_at,
        vc:vcs!reviews_vc_id_fkey(
          id,
          name
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3)

    const recentActivity = recentReviews?.map(review => ({
      type: 'review',
      vcName: review.vc.name,
      time: getRelativeTime(new Date(review.created_at))
    }))

    return NextResponse.json({
      stats: {
        totalVCs: totalVCs || 0,
        totalReviews: totalReviews || 0,
        weeklyReviews: weeklyReviews || 0
      },
      popularVCs: vcsWithCounts || [],
      recentActivity: recentActivity || []
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `${minutes}분 전`
  } else if (hours < 24) {
    return `${hours}시간 전`
  } else {
    return `${days}일 전`
  }
}