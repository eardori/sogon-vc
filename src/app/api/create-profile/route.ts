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
    const { userId, email, userType, companyName, businessRegistrationNumber } = await request.json()

    // 프로필 생성
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        user_type: userType,
        company_name: companyName,
        business_registration_number: businessRegistrationNumber,
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}