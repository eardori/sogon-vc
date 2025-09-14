import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const { userId, reviewId, amount, transactionType } = await request.json()

    // 크레딧 트랜잭션 생성
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        review_id: reviewId,
        amount: amount,
        transaction_type: transactionType
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Credit transaction error:', transactionError)
      return NextResponse.json(
        { error: transactionError.message },
        { status: 400 }
      )
    }

    // 프로필 크레딧 업데이트
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    const currentCredits = profile?.credits || 0
    const newCredits = currentCredits + amount

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      transaction,
      newCredits 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}