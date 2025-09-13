import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: '이메일을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 도메인 추출
    const emailDomain = email.split('@')[1]
    if (!emailDomain) {
      return NextResponse.json(
        { success: false, message: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // VC 테이블에서 도메인 확인
    const { data: vcs, error } = await supabase
      .from('vcs')
      .select('name, email_domain')
      .eq('email_domain', emailDomain)
      .eq('is_active', true)

    if (error) {
      console.error('VC email verification error:', error)
      return NextResponse.json(
        { success: false, message: '이메일 검증 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (vcs && vcs.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'VC 이메일이 확인되었습니다.',
        data: {
          vcName: vcs[0].name,
          emailDomain: emailDomain,
          verified: true
        }
      })
    }

    // 화이트리스트에 없는 경우
    return NextResponse.json({
      success: false,
      message: '등록되지 않은 VC 이메일입니다. 관리자 승인이 필요합니다.',
      data: {
        emailDomain: emailDomain,
        verified: false
      }
    })

  } catch (error) {
    console.error('VC email verification error:', error)
    return NextResponse.json(
      { success: false, message: '이메일 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}