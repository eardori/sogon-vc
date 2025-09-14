'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search-bar'
import { ReviewList } from '@/components/review-list'
import { Sidebar } from '@/components/sidebar'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto section-padding container-padding">
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
              <span className="text-gradient">VC 투자 후기</span>
              <br className="hidden sm:block" />
              <span className="text-gray-700">플랫폼</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              실제 창업자들의 솔직한 VC 투자 경험을 통해<br className="hidden sm:block" />
              당신에게 맞는 투자자를 찾아보세요
            </p>
          </div>
          
          {/* Enhanced Search Section */}
          <div className="max-w-4xl mx-auto">
            <SearchBar 
              onSearch={setSearchQuery} 
              placeholder="어떤 VC를 찾고 계신가요? (예: 스톤브릿지벤처스)"
              autoFocus={false}
            />
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto section-padding py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Review List */}
          <div className="lg:col-span-3 mb-12 lg:mb-0">
            <ReviewList searchQuery={searchQuery} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}