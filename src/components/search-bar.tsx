'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Sparkles } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({ onSearch, placeholder = 'VC 이름으로 검색...', autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // 실시간 검색 (디바운싱 없이 간단히)
    if (value.trim() === '') {
      onSearch('')
    }
  }

  const popularSearches = ['스톤브릿지벤처스', '알토스벤처스', '소프트뱅크벤처스', '본엔젤스', 'DSC인베스트먼트']

  return (
    <div className="w-full animate-fade-in">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`relative transition-all duration-300 ${
          isFocused ? 'transform -translate-y-1 scale-105' : ''
        }`}>
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Search className={`h-5 w-5 transition-colors duration-200 ${
              isFocused ? 'text-primary-500' : 'text-gray-400'
            }`} />
          </div>
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full pl-12 pr-32 py-4 text-lg bg-white border-2 rounded-2xl shadow-soft transition-all duration-300 placeholder:text-gray-400 ${
              isFocused 
                ? 'border-primary-500 shadow-soft-lg ring-4 ring-primary-100' 
                : 'border-gray-200 hover:border-gray-300'
            } focus:outline-none`}
          />
          
          {/* Action Buttons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                aria-label="검색어 지우기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <button
              type="submit"
              disabled={!query.trim()}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                query.trim()
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md transform hover:scale-105'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              검색
            </button>
          </div>
        </div>
        
        {/* Gradient Border Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400 to-blue-400 p-0.5 -z-10">
            <div className="bg-white rounded-2xl h-full w-full" />
          </div>
        )}
      </form>
      
      {/* Popular Searches */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">인기 검색어</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <button
              key={search}
              onClick={() => {
                setQuery(search)
                onSearch(search)
              }}
              className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 hover:scale-105"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}