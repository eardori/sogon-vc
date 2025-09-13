'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type UserType = 'prospective_founder' | 'founder' | 'vc_general'

const userTypeOptions = [
  { value: 'prospective_founder', label: '예비창업자', description: '투자 유치를 준비 중인 예비창업자' },
  { value: 'founder', label: '창업자', description: '실제 투자 경험이 있는 창업자 (후기 작성 가능)' },
  { value: 'vc_general', label: 'VC', description: '벤처캐피털 투자심사역/파트너 (답변 작성 가능)' },
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<UserType>('prospective_founder')
  const [companyName, setCompanyName] = useState('')
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [isVerified, setIsVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [vcEmailVerified, setVcEmailVerified] = useState(false)
  const [vcName, setVcName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.'
    }
    
    if (!/[A-Za-z]/.test(password)) {
      return '비밀번호에 영문자가 포함되어야 합니다.'
    }
    
    if (!/\d/.test(password)) {
      return '비밀번호에 숫자가 포함되어야 합니다.'
    }
    
    return null
  }

  const validateEmail = (email: string): string | null => {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return '올바른 이메일 형식이 아닙니다.'
    }
    
    // 창업자나 VC는 회사 이메일 필수
    if (userType === 'founder' || userType === 'vc_general') {
      const publicDomains = [
        'gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'hanmail.net',
        'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'
      ]
      const domain = email.split('@')[1]?.toLowerCase()
      
      if (publicDomains.includes(domain)) {
        return `${userType === 'founder' ? '창업자' : 'VC'}는 회사 이메일을 사용해주세요. (개인 이메일 사용 불가)`
      }
    }
    
    return null
  }

  const handleBasicSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 이메일 검증
    const emailValidationError = validateEmail(email)
    if (emailValidationError) {
      setError(emailValidationError)
      return
    }
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    // VC의 경우 이메일 도메인 검증
    if (userType === 'vc_general') {
      setError('')
      setVerifying(true)
      
      try {
        const response = await fetch('/api/verify-vc-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        
        const result = await response.json()
        
        if (!result.success) {
          setError(result.message || 'VC 이메일 검증에 실패했습니다.')
          setVerifying(false)
          return
        }
        
        setVcEmailVerified(true)
        setVcName(result.data?.vcName || '')
      } catch (error) {
        setError('VC 이메일 검증 중 오류가 발생했습니다.')
        setVerifying(false)
        return
      } finally {
        setVerifying(false)
      }
    }

    setError('')
    
    // 창업자나 VC인 경우 추가 정보 입력 단계로
    if (userType === 'founder' || userType === 'vc_general') {
      setStep(2)
      return
    }

    // 예비창업자인 경우 바로 회원가입 진행
    await completeSignup()
  }

  const completeSignup = async () => {
    setLoading(true)
    setError('')

    try {
      // 네트워크 연결 확인
      if (!navigator.onLine) {
        throw new Error('인터넷 연결을 확인해주세요.')
      }

      // Supabase Auth 회원가입 (재시도 로직 포함)
      let data, authError
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        try {
          const result = await supabase.auth.signUp({
            email,
            password,
          })
          data = result.data
          authError = result.error
          
          if (!authError) break
          
          // 특정 에러는 재시도하지 않음
          if (authError.message.includes('already registered') || 
              authError.message.includes('Invalid email')) {
            break
          }
          
          attempts++
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)) // 점진적 대기
          }
        } catch (networkError) {
          attempts++
          if (attempts >= maxAttempts) {
            throw new Error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        }
      }

      if (authError) {
        // Supabase Auth 에러 메시지를 사용자 친화적으로 변환
        let errorMessage = authError.message
        if (authError.message.includes('Password')) {
          errorMessage = '비밀번호는 8자 이상의 영문자와 숫자를 포함해야 합니다.'
        } else if (authError.message.includes('Email')) {
          errorMessage = '유효한 이메일 주소를 입력해주세요.'
        } else if (authError.message.includes('User already registered')) {
          errorMessage = '이미 가입된 이메일 주소입니다.'
        } else if (authError.message.includes('Invalid API key')) {
          errorMessage = '비밀번호 형식이 올바르지 않습니다. 영문자와 숫자를 포함한 8자 이상 입력해주세요.'
        }
        
        setError(errorMessage)
        setLoading(false)
        return
      }

      if (data.user) {
        // 프로필 생성
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            user_type: userType,
            company_name: userType === 'founder' ? companyName : null,
            business_registration_number: userType === 'founder' ? businessRegistrationNumber : null,
          } as any)

        if (profileError) {
          setError('프로필 생성 중 오류가 발생했습니다.')
          setLoading(false)
          return
        }

        // 이메일 인증 안내
        alert('회원가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.')
        router.push('/auth/login')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      
      // 에러 타입별 메시지 처리
      if (err.message?.includes('인터넷')) {
        setError(err.message)
      } else if (err.message?.includes('네트워크')) {
        setError(err.message)
      } else {
        setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
      
      // 재시도 카운터 증가
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  // 사업자등록번호 포맷팅 함수
  const formatBusinessNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '')
    
    // 10자리 숫자를 XXX-XX-XXXXX 형식으로 포맷팅
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
    }
    // 10자리 초과 입력 방지
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }

  const verifyBusinessNumber = async () => {
    if (!businessRegistrationNumber) {
      setError('사업자등록번호를 입력해주세요.')
      return
    }

    // 하이픈 제거한 숫자만 추출
    const cleanNumber = businessRegistrationNumber.replace(/[^0-9]/g, '')
    
    if (cleanNumber.length !== 10) {
      setError('사업자등록번호는 10자리 숫자여야 합니다.')
      return
    }

    setVerifying(true)
    setError('')
    setCompanyName('') // 검증 시작 시 회사명 초기화

    try {
      const response = await fetch('/api/verify-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessNumber: cleanNumber,
          companyName: '', // 회사명 비워서 전송
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsVerified(true)
        setError('')
        
        // 검증된 회사명 설정
        if (result.data?.companyName) {
          setCompanyName(result.data.companyName)
          // 검증 성공 메시지
          console.log('회사명 확인:', result.data.companyName)
        } else {
          // 회사명을 가져오지 못한 경우
          setCompanyName('(회사명 확인 중)')
        }
      } else {
        setIsVerified(false)
        setError(result.message || '사업자등록번호 검증에 실패했습니다.')
      }
    } catch (error) {
      setError('검증 중 오류가 발생했습니다.')
    } finally {
      setVerifying(false)
    }
  }

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userType === 'founder') {
      if (!businessRegistrationNumber) {
        setError('사업자등록번호를 입력해주세요.')
        return
      }
      if (!isVerified) {
        setError('사업자등록번호 검증이 필요합니다.')
        return
      }
      if (!companyName) {
        setError('회사명이 확인되지 않았습니다. 사업자등록번호 검증을 다시 시도해주세요.')
        return
      }
    }

    await completeSignup()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-primary-600">sogon.vc</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            로그인하기
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleBasicSignup}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  회원 유형 선택
                </label>
                <div className="space-y-3">
                  {userTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-start">
                      <input
                        type="radio"
                        name="userType"
                        value={option.value}
                        checked={userType === option.value}
                        onChange={(e) => setUserType(e.target.value as UserType)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일 주소
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      // 입력 중 실시간 검증 (디바운싱 효과)
                      if (e.target.value) {
                        setTimeout(() => {
                          const error = validateEmail(e.target.value)
                          setEmailError(error || '')
                        }, 300)
                      } else {
                        setEmailError('')
                      }
                    }}
                    onBlur={() => {
                      // 포커스 아웃 시 즉시 검증
                      if (email) {
                        const error = validateEmail(email)
                        setEmailError(error || '')
                      }
                    }}
                    className={`input-field ${emailError ? 'border-red-500' : email && !emailError ? 'border-green-500' : ''}`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">
                    {emailError}
                  </p>
                )}
                {!emailError && (userType === 'founder' || userType === 'vc_general') && (
                  <p className="mt-1 text-sm text-orange-600">
                    ⚠️ {userType === 'founder' ? '창업자' : 'VC'}는 반드시 회사 이메일 주소를 사용해주세요
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      // 실시간 비밀번호 검증
                      if (e.target.value) {
                        const error = validatePassword(e.target.value)
                        setPasswordError(error || '')
                      } else {
                        setPasswordError('')
                      }
                      // 비밀번호 확인도 체크
                      if (confirmPassword && e.target.value !== confirmPassword) {
                        setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
                      } else {
                        setConfirmPasswordError('')
                      }
                    }}
                    className={`input-field ${passwordError ? 'border-red-500' : password && !passwordError ? 'border-green-500' : ''}`}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">8자 이상, 영문자와 숫자 포함</p>
                {password && (
                  <div className="mt-1 text-sm">
                    <div className={`${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                      ✓ 8자 이상 {password.length >= 8 ? '만족' : '필요'}
                    </div>
                    <div className={`${/[A-Za-z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                      ✓ 영문자 포함 {/[A-Za-z]/.test(password) ? '만족' : '필요'}
                    </div>
                    <div className={`${/\d/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                      ✓ 숫자 포함 {/\d/.test(password) ? '만족' : '필요'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      // 실시간 비밀번호 확인 검증
                      if (e.target.value && password) {
                        if (e.target.value !== password) {
                          setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
                        } else {
                          setConfirmPasswordError('')
                        }
                      } else {
                        setConfirmPasswordError('')
                      }
                    }}
                    className={`input-field ${confirmPasswordError ? 'border-red-500' : confirmPassword && !confirmPasswordError ? 'border-green-500' : ''}`}
                  />
                </div>
                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-red-600">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                  <div>{error}</div>
                  {retryCount > 0 && (
                    <button 
                      onClick={() => {
                        setError('')
                        setRetryCount(0)
                      }}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              )}

              <div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !!emailError || !!passwordError || !!confirmPasswordError || !email || !password || !confirmPassword}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    userType === 'prospective_founder' ? '회원가입 완료' : '다음 단계'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleCompleteSignup}>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  추가 정보 입력
                </h3>
                <p className="text-sm text-gray-600">
                  {userType === 'founder' ? '창업자 인증을 위한 정보를 입력해주세요.' : 'VC 인증을 위한 정보를 입력해주세요.'}
                </p>
              </div>

              {userType === 'founder' && (
                <>
                  <div>
                    <label htmlFor="businessRegistrationNumber" className="block text-sm font-medium text-gray-700">
                      사업자등록번호
                    </label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        id="businessRegistrationNumber"
                        name="businessRegistrationNumber"
                        type="text"
                        placeholder="123-45-67890"
                        required
                        value={businessRegistrationNumber}
                        onChange={(e) => {
                          const formatted = formatBusinessNumber(e.target.value)
                          setBusinessRegistrationNumber(formatted)
                          setIsVerified(false)
                          setCompanyName('') // 번호 변경 시 회사명 초기화
                        }}
                        maxLength={12} // XXX-XX-XXXXX 형식 (하이픈 포함)
                        className="input-field flex-1"
                        disabled={isVerified}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={verifyBusinessNumber}
                        disabled={verifying || isVerified || !businessRegistrationNumber}
                      >
                        {verifying ? '검증 중...' : isVerified ? '✓ 검증완료' : '검증'}
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {isVerified ? '✓ 사업자등록번호가 확인되었습니다' : '하이픈(-) 없이 10자리 숫자를 입력하세요 (자동 포맷팅)'}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      회사명
                    </label>
                    <div className="mt-1">
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => {
                          if (!isVerified) {
                            setCompanyName(e.target.value)
                          }
                        }}
                        className={`input-field ${isVerified ? 'bg-green-50 border-green-300' : ''}`}
                        readOnly={isVerified}
                        placeholder={isVerified ? companyName : '사업자등록번호 검증 후 자동 입력됩니다'}
                      />
                    </div>
                    {isVerified && companyName && companyName !== '(회사명 확인 중)' && (
                      <p className="mt-1 text-sm text-green-600">
                        ✓ 검증된 회사명: {companyName}
                      </p>
                    )}
                    {isVerified && (
                      <p className="mt-1 text-sm text-blue-600">
                        베타 테스트 기간 - 자동 승인됨
                      </p>
                    )}
                  </div>
                </>
              )}

              {userType === 'vc_general' && (
                <div className={`p-4 rounded ${vcEmailVerified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  {vcEmailVerified ? (
                    <div>
                      <p className="text-sm text-green-800 font-medium">
                        ✓ {vcName} 이메일로 확인되었습니다.
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        회원가입을 진행해주세요.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-800">
                      VC 회원은 사전 등록된 회사 이메일 주소로만 가입할 수 있습니다. 
                      등록되지 않은 이메일인 경우 관리자 승인이 필요합니다.
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                  <div>{error}</div>
                  {retryCount > 0 && (
                    <button 
                      onClick={() => {
                        setError('')
                        setRetryCount(0)
                      }}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || (userType === 'founder' && !isVerified)}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    '회원가입 완료'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}