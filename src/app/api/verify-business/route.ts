import { NextRequest, NextResponse } from 'next/server'

// 국세청 사업자등록번호 진위확인 API
// 실제 서비스에서는 공공데이터포털 API 키가 필요합니다
// https://www.data.go.kr/data/15081808/openapi.do

export async function POST(request: NextRequest) {
  try {
    const { businessNumber, companyName } = await request.json()

    // 사업자등록번호 형식 검증 (XXX-XX-XXXXX)
    const businessNumberRegex = /^\d{3}-?\d{2}-?\d{5}$/
    const cleanNumber = businessNumber.replace(/-/g, '')
    
    if (!businessNumberRegex.test(businessNumber)) {
      return NextResponse.json(
        { 
          success: false, 
          message: '올바른 사업자등록번호 형식이 아닙니다.' 
        },
        { status: 400 }
      )
    }

    // 사업자등록번호 체크섬 검증
    const checksum = validateBusinessNumber(cleanNumber)
    if (!checksum) {
      return NextResponse.json(
        { 
          success: false, 
          message: '유효하지 않은 사업자등록번호입니다.' 
        },
        { status: 400 }
      )
    }

    // 베타 테스트 기간 동안 임시 검증 로직
    // 실제 운영시에는 국세청 API 또는 다른 검증 서비스 사용
    const isTestMode = process.env.BUSINESS_VERIFICATION_TEST_MODE === 'true'
    
    if (isTestMode) {
      // 테스트 모드: 특정 번호만 유효하다고 가정
      const testValidNumbers = [
        '1234567890', // 테스트용 유효 번호
        '0000000000', // 테스트용 유효 번호
      ]
      
      const isValid = testValidNumbers.includes(cleanNumber) || 
                     cleanNumber.startsWith('123') // 123으로 시작하는 번호는 테스트용으로 허용
      
      if (isValid) {
        return NextResponse.json({
          success: true,
          message: '사업자등록번호가 확인되었습니다.',
          data: {
            businessNumber: businessNumber,
            companyName: companyName,
            status: 'active',
            verified: true
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          message: '등록되지 않은 사업자등록번호입니다.',
        })
      }
    }

    // 실제 API 호출 (국세청 또는 기타 서비스)
    // const apiKey = process.env.BUSINESS_VERIFICATION_API_KEY
    // const response = await fetch('https://api.odcloud.kr/api/nts-businessman/v1/status', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`
    //   },
    //   body: JSON.stringify({
    //     b_no: [cleanNumber]
    //   })
    // })

    // 임시 응답 (실제 서비스에서는 위의 API 응답 사용)
    return NextResponse.json({
      success: true,
      message: '베타 테스트 기간 - 자동 승인',
      data: {
        businessNumber: businessNumber,
        companyName: companyName,
        status: 'active',
        verified: true
      }
    })

  } catch (error) {
    console.error('Business verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '사업자등록번호 검증 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}

// 사업자등록번호 체크섬 검증 함수
function validateBusinessNumber(businessNumber: string): boolean {
  if (businessNumber.length !== 10) return false
  
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]
  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(businessNumber[i]) * weights[i]
  }
  
  sum += Math.floor((parseInt(businessNumber[8]) * 5) / 10)
  
  const checkDigit = (10 - (sum % 10)) % 10
  
  return checkDigit === parseInt(businessNumber[9])
}