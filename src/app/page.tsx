import { SearchBar } from '@/components/search-bar'
import { ReviewList } from '@/components/review-list'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                VC 후기 검색
              </h1>
              <SearchBar />
            </div>
            
            {/* Review List */}
            <ReviewList />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>
    </div>
  )
}