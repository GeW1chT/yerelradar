'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, MapPin, Filter, Clock, DollarSign, Star, TrendingUp,
  Building, Tag, X, Mic, MicOff, Loader2, Zap, Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, debounce } from '@/lib/utils'

interface SearchSuggestion {
  type: 'business' | 'category' | 'keyword' | 'popular' | 'intent'
  text: string
  highlight: string
  category: string
  icon: string
}

interface SearchComponentProps {
  initialQuery?: string
  initialLocation?: string
  placeholder?: string
  showFilters?: boolean
  autoFocus?: boolean
  onSearch?: (query: string, filters?: any) => void
}

export default function SearchComponent({
  initialQuery = '',
  initialLocation = '',
  placeholder = 'Restoran, kafe, berber... ara',
  showFilters = true,
  autoFocus = false,
  onSearch
}: SearchComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isIntelligentMode, setIsIntelligentMode] = useState(true)
  const [aiInterpretation, setAiInterpretation] = useState<string>('')
  
  // Advanced filters state
  const [filters, setFilters] = useState({
    category: '',
    minRating: 0,
    priceRange: [] as string[],
    isOpen: false,
    hasDelivery: false,
    accessibility: false,
    radius: 10
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Debounced autocomplete function
  const debouncedAutocomplete = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      setAiInterpretation('')
      return
    }

    setIsLoading(true)
    try {
      // If intelligent mode is enabled and query is longer, use AI processing
      if (isIntelligentMode && searchQuery.length >= 5) {
        await processIntelligentSearch(searchQuery)
      }
      
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(location)}&limit=8`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Autocomplete error:', error)
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // Process intelligent search with AI
  const processIntelligentSearch = async (searchQuery: string) => {
    try {
      const context = {
        userLocation: {
          city: location,
          lat: 41.0082, // Mock Istanbul coordinates
          lng: 28.9784
        },
        timeContext: {
          currentTime: new Date().toISOString(),
          isWeekend: [0, 6].includes(new Date().getDay()),
          timeOfDay: getTimeOfDay()
        }
      }

      const response = await fetch('/api/search/intelligent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          context
        })
      })

      const data = await response.json()
      if (data.success) {
        setAiInterpretation(data.data.interpretation)
        
        // Auto-apply intelligent filters
        if (data.data.searchParams.filters) {
          const aiFilters = data.data.searchParams.filters
          setFilters(prev => ({
            ...prev,
            ...aiFilters
          }))
        }
      }
    } catch (error) {
      console.error('Intelligent search error:', error)
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    if (hour < 21) return 'evening'
    return 'night'
  }

  useEffect(() => {
    if (query) {
      debouncedAutocomplete(query)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return

    const searchUrl = new URLSearchParams()
    searchUrl.set('q', finalQuery)
    if (location) searchUrl.set('city', location)
    
    // Add active filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 0 && (Array.isArray(value) ? value.length > 0 : true)) {
        searchUrl.set(key, Array.isArray(value) ? value.join(',') : String(value))
      }
    })

    if (onSearch) {
      onSearch(finalQuery, filters)
    } else {
      router.push(`/arama?${searchUrl.toString()}`)
    }
    
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    handleSearch(suggestion.text)
  }

  const startVoiceSearch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      const chunks: BlobPart[] = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        
        // Convert to base64 for API
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1]
          
          try {
            setIsLoading(true)
            const response = await fetch('/api/search/voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioData: base64Audio,
                city: location,
                language: 'tr'
              })
            })
            
            const data = await response.json()
            if (data.success) {
              setQuery(data.data.enhancedQuery)
              setAiInterpretation(`Ses: "${data.data.transcription}" → ${data.data.enhancedQuery}`)
              
              // Automatically search with the transcribed query
              handleSearch(data.data.enhancedQuery)
            } else {
              alert(data.error || 'Ses tanıma hatası')
            }
          } catch (error) {
            console.error('Voice search processing error:', error)
            alert('Ses işleme hatası')
          } finally {
            setIsLoading(false)
          }
        }
        reader.readAsDataURL(blob)
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsListening(true)
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening) {
          stopVoiceSearch()
        }
      }, 10000)
    } catch (error) {
      console.error('Voice search error:', error)
      alert('Mikrofon erişimi reddedildi')
    }
  }

  const stopVoiceSearch = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      building: Building,
      tag: Tag,
      search: Search,
      'trending-up': TrendingUp,
      'map-pin': MapPin,
      clock: Clock,
      'dollar-sign': DollarSign,
      star: Star
    }
    return icons[iconName] || Search
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex bg-white rounded-xl border border-gray-300 shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-l-xl focus:outline-none text-gray-900 placeholder-gray-500"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>

          {/* Location Input */}
          <div className="w-48 relative border-l border-gray-200">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Şehir"
              className="w-full pl-12 pr-4 py-4 text-lg border-0 focus:outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Voice Search Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={isListening ? stopVoiceSearch : startVoiceSearch}
            className={cn(
              "px-4 border-l border-gray-200 rounded-none",
              isListening && "text-red-500"
            )}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          {/* Search Button */}
          <Button
            onClick={() => handleSearch()}
            size="lg"
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-l-none"
          >
            Ara
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => {
              const IconComponent = getIconComponent(suggestion.icon)
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left"
                >
                  <IconComponent className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div
                      className="text-gray-900 font-medium"
                      dangerouslySetInnerHTML={{ __html: suggestion.highlight }}
                    />
                    <div className="text-sm text-gray-500">{suggestion.category}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      
      {/* AI Interpretation */}
      {aiInterpretation && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <span className="text-sm font-medium text-blue-900">AI Yorumu: </span>
              <span className="text-sm text-blue-800">{aiInterpretation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filters */}
      {showFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="bg-white border-gray-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtreler
          </Button>
          
          <Button
            variant={isIntelligentMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsIntelligentMode(!isIntelligentMode)}
            className={isIntelligentMode ? "bg-purple-600 text-white" : "bg-white border-gray-300"}
          >
            <Zap className="w-4 h-4 mr-2" />
            Akıllı Arama
          </Button>
          
          <Button
            variant={filters.isOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, isOpen: !prev.isOpen }))}
            className={filters.isOpen ? "bg-blue-600 text-white" : "bg-white border-gray-300"}
          >
            <Clock className="w-4 h-4 mr-2" />
            Şu anda açık
          </Button>

          <Button
            variant={filters.hasDelivery ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, hasDelivery: !prev.hasDelivery }))}
            className={filters.hasDelivery ? "bg-blue-600 text-white" : "bg-white border-gray-300"}
          >
            Teslimat var
          </Button>

          {filters.minRating > 0 && (
            <Badge variant="outline" className="bg-white border-gray-300">
              <Star className="w-3 h-3 mr-1" />
              {filters.minRating}+ yıldız
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
              />
            </Badge>
          )}

          {filters.priceRange.length > 0 && (
            <Badge variant="outline" className="bg-white border-gray-300">
              <DollarSign className="w-3 h-3 mr-1" />
              Fiyat filtreli
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, priceRange: [] }))}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Minimum Puan</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Tümü</option>
                <option value={4}>4+ Yıldız</option>
                <option value={3}>3+ Yıldız</option>
                <option value={2}>2+ Yıldız</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Fiyat Aralığı</label>
              <div className="space-y-2">
                {[
                  { label: 'Ekonomik (₺)', value: 'BUDGET' },
                  { label: 'Orta (₺₺)', value: 'MODERATE' },
                  { label: 'Pahalı (₺₺₺)', value: 'EXPENSIVE' },
                  { label: 'Lüks (₺₺₺₺)', value: 'LUXURY' }
                ].map((range) => (
                  <label key={range.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes(range.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, priceRange: [...prev.priceRange, range.value] }))
                        } else {
                          setFilters(prev => ({ ...prev, priceRange: prev.priceRange.filter(p => p !== range.value) }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-900">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Mesafe (km)</label>
              <input
                type="range"
                min={0.5}
                max={50}
                step={0.5}
                value={filters.radius}
                onChange={(e) => setFilters(prev => ({ ...prev, radius: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{filters.radius} km</div>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setFilters({
                category: '',
                minRating: 0,
                priceRange: [],
                isOpen: false,
                hasDelivery: false,
                accessibility: false,
                radius: 10
              })}
            >
              Filtreleri Temizle
            </Button>
            <Button onClick={() => handleSearch()}>
              Filtrelerle Ara
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}