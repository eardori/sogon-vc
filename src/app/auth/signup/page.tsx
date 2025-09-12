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
  const router = useRouter()

  const handleBasicSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
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
      // Supabase Auth 회원가입
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
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
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const verifyBusinessNumber = async () => {
    if (!businessRegistrationNumber || !companyName) {
      setError('회사명과 사업자등록번호를 모두 입력해주세요.')
      return
    }

    setVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/verify-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessNumber: businessRegistrationNumber,
          companyName: companyName,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsVerified(true)
        setError('')
        // 검증된 회사명으로 자동 업데이트
        if (result.data?.companyName && result.data.companyName !== companyName) {
          setCompanyName(result.data.companyName)
          // 사용자에게 알림
          alert(`회사명이 "${result.data.companyName}"(으)로 확인되었습니다.`)
        }
      } else {
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
      if (!companyName || !businessRegistrationNumber) {
        setError('회사명과 사업자등록번호를 모두 입력해주세요.')
        return
      }
      if (!isVerified) {
        setError('사업자등록번호 검증이 필요합니다.')
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">8자 이상 입력해주세요</p>
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <Button type="submit" className="w-full">
                  {userType === 'prospective_founder' ? '회원가입 완료' : '다음 단계'}
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
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

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
                          setBusinessRegistrationNumber(e.target.value)
                          setIsVerified(false)
                        }}
                        className="input-field flex-1"
                        disabled={isVerified}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={verifyBusinessNumber}
                        disabled={verifying || isVerified || !businessRegistrationNumber || !companyName}
                      >
                        {verifying ? '검증 중...' : isVerified ? '✓ 검증완료' : '검증'}
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {isVerified ? '✓ 사업자등록번호가 확인되었습니다' : '사업자등록번호로 회사 인증을 진행합니다'}
                    </p>
                    {isVerified && (
                      <p className="mt-1 text-sm text-green-600">
                        베타 테스트 기간 - 자동 승인됨
                      </p>
                    )}
                  </div>
                </>
              )}

              {userType === 'vc_general' && (
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-yellow-800">
                    VC 회원은 사전 등록된 이메일 주소로만 가입할 수 있습니다. 
                    등록되지 않은 이메일인 경우 관리자 승인이 필요합니다.
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                  {error}
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
                  disabled={loading}
                >
                  {loading ? '처리 중...' : '회원가입 완료'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}