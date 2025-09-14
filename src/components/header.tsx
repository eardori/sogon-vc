'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './auth-provider'
import { Button } from './ui/button'
import { UserCircle, Menu, X, PenSquare, Home, FileText, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function Header() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  // 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [user])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <h1 className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-200">
                sogon.vc
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                홈
              </Link>
              <Link 
                href="/reviews" 
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                후기
              </Link>
              <Link 
                href="/vcs" 
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              >
                <Building2 className="h-4 w-4" />
                VC 목록
              </Link>
              {profile?.user_type === 'founder' && (
                <Link 
                  href="/reviews/write" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all duration-200 ml-2"
                >
                  <PenSquare className="h-4 w-4" />
                  후기 작성
                </Link>
              )}
            </nav>

            {/* Desktop User menu */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
                    <UserCircle className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700 font-medium">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  {profile && (
                    <div className="px-3 py-2 bg-primary-50 rounded-xl">
                      <span className="text-sm text-primary-700 font-semibold">
                        {profile.credits || 0} 크레딧
                      </span>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={signOut}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">로그인</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="shadow-sm hover:shadow-md">회원가입</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile menu overlay */}
          {mobileMenuOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-slide-up z-50">
              <nav className="section-padding py-6 space-y-2">
                <Link 
                  href="/" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  홈
                </Link>
                <Link 
                  href="/reviews" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  후기
                </Link>
                <Link 
                  href="/vcs" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building2 className="h-5 w-5" />
                  VC 목록
                </Link>
                
                {user ? (
                  <>
                    {profile?.user_type === 'founder' && (
                      <Link 
                        href="/reviews/write" 
                        className="flex items-center gap-3 px-4 py-3 text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all duration-200 font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <PenSquare className="h-5 w-5" />
                        후기 작성
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="px-4 py-3 bg-gray-50 rounded-xl mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {user.email?.split('@')[0]}
                            </span>
                          </div>
                          {profile && (
                            <span className="text-sm text-primary-600 font-semibold">
                              {profile.credits || 0} 크레딧
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          signOut()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                    <Link 
                      href="/auth/login"
                      className="block px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium border border-gray-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link 
                      href="/auth/signup"
                      className="block px-4 py-3 text-center text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all duration-200 font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      
      {/* Mobile Floating Write Button - 창업자만 표시 */}
      {profile?.user_type === 'founder' && !mobileMenuOpen && (
        <Link 
          href="/reviews/write"
          className="md:hidden fixed bottom-6 right-6 z-50 bg-primary-600 text-white rounded-2xl p-4 shadow-soft-lg hover:bg-primary-700 hover:scale-110 active:scale-95 transition-all duration-200 group"
        >
          <PenSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        </Link>
      )}
    </>
  )
}