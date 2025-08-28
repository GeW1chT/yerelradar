import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { openaiService } from '@/lib/openai'

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  city: z.string().optional(),
  category: z.string().optional(),
  district: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().min(0.5).max(50).default(10), // km
  minRating: z.number().min(0).max(5).optional(),
  priceRange: z.array(z.enum(['BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY'])).optional(),
  sortBy: z.enum(['relevance', 'rating', 'distance', 'trending', 'reviews']).default('relevance'),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
  isOpen: z.boolean().optional(),
  hasDelivery: z.boolean().optional(),
  accessibility: z.boolean().optional(),
  aiEnhanced: z.boolean().default(true)
})

// Mock businesses for development
const mockBusinesses = [
  {
    id: '1',
    name: 'Köşe Pizza',
    slug: 'kose-pizza-besiktas',
    description: '25 yıldır aynı lezzet, özel pizza tarifleri',
    category: 'Restoran',
    subcategory: 'Pizza',
    city: 'İstanbul',
    district: 'Beşiktaş',
    neighborhood: 'Levent',
    address: 'Barbaros Bulvarı No:45',
    lat: 41.0431,
    lng: 29.0099,
    phone: '+90 212 234 12 34',
    verified: true,
    isPremium: false,
    avgRating: 4.2,
    totalReviews: 128,
    priceRange: 'MODERATE',
    keywords: ['pizza', 'lezzet', 'aile', 'geleneksel', 'taze malzeme', 'margherita', 'sucuklu'],
    amenities: ['WIFI', 'PARKING', 'DELIVERY', 'TAKEOUT', 'ACCEPTS_CARDS'],
    workingHours: [
      { day: 'MONDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
      { day: 'TUESDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
      { day: 'WEDNESDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
      { day: 'THURSDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
      { day: 'FRIDAY', openTime: '11:00', closeTime: '24:00', isClosed: false },
      { day: 'SATURDAY', openTime: '11:00', closeTime: '24:00', isClosed: false },
      { day: 'SUNDAY', openTime: '12:00', closeTime: '23:00', isClosed: false },
    ]
  },
  {
    id: '2',
    name: 'Starbucks Zorlu Center',
    slug: 'starbucks-zorlu-besiktas',
    description: 'Dünyaca ünlü kahve zinciri',
    category: 'Kafe',
    subcategory: 'Kahve',
    city: 'İstanbul',
    district: 'Beşiktaş',
    neighborhood: 'Zorlu Center',
    address: 'Zorlu Center AVM',
    lat: 41.0431,
    lng: 29.0099,
    phone: '+90 212 234 12 35',
    verified: true,
    isPremium: true,
    avgRating: 4.0,
    totalReviews: 89,
    priceRange: 'EXPENSIVE',
    keywords: ['kahve', 'starbucks', 'avm', 'çalışma', 'wifi', 'latte', 'americano'],
    amenities: ['WIFI', 'ACCEPTS_CARDS', 'WHEELCHAIR_ACCESSIBLE'],
    workingHours: [
      { day: 'MONDAY', openTime: '07:00', closeTime: '22:00', isClosed: false },
      { day: 'TUESDAY', openTime: '07:00', closeTime: '22:00', isClosed: false },
      { day: 'WEDNESDAY', openTime: '07:00', closeTime: '22:00', isClosed: false },
      { day: 'THURSDAY', openTime: '07:00', closeTime: '22:00', isClosed: false },
      { day: 'FRIDAY', openTime: '07:00', closeTime: '22:00', isClosed: false },
      { day: 'SATURDAY', openTime: '08:00', closeTime: '22:00', isClosed: false },
      { day: 'SUNDAY', openTime: '08:00', closeTime: '22:00', isClosed: false },
    ]
  },
  {
    id: '3',
    name: 'Berber Ali',
    slug: 'berber-ali-besiktas',
    description: 'Geleneksel berberlik sanatı',
    category: 'Berber',
    subcategory: 'Erkek Berber',
    city: 'İstanbul',
    district: 'Beşiktaş',
    neighborhood: 'Çarşı',
    address: 'Beşiktaş Çarşı',
    lat: 41.0431,
    lng: 29.0099,
    phone: '+90 212 234 12 36',
    verified: true,
    isPremium: false,
    avgRating: 4.7,
    totalReviews: 67,
    priceRange: 'BUDGET',
    keywords: ['berber', 'geleneksel', 'sakal', 'tıraş', 'usta', 'kaliteli'],
    amenities: ['ACCEPTS_CARDS'],
    workingHours: [
      { day: 'MONDAY', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'TUESDAY', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'WEDNESDAY', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'THURSDAY', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'FRIDAY', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'SATURDAY', openTime: '09:00', closeTime: '18:00', isClosed: false },
      { day: 'SUNDAY', openTime: '', closeTime: '', isClosed: true },
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryData = {
      q: searchParams.get('q') || '',
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      district: searchParams.get('district') || undefined,
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
      radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 10,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      priceRange: searchParams.get('priceRange')?.split(',') as any,
      sortBy: searchParams.get('sortBy') as any || 'relevance',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      isOpen: searchParams.get('isOpen') === 'true',
      hasDelivery: searchParams.get('hasDelivery') === 'true',
      accessibility: searchParams.get('accessibility') === 'true',
      aiEnhanced: searchParams.get('aiEnhanced') !== 'false'
    }

    const validatedQuery = searchSchema.parse(queryData)

    // Perform search
    const searchResults = await performSearch(validatedQuery)

    return NextResponse.json({
      success: true,
      data: searchResults.results,
      meta: {
        total: searchResults.total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < searchResults.total,
        searchTime: searchResults.searchTime,
        aiEnhanced: validatedQuery.aiEnhanced,
        suggestions: searchResults.suggestions
      }
    })

  } catch (error) {
    console.error('Search API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz arama parametreleri', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Arama sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

async function performSearch(query: z.infer<typeof searchSchema>) {
  const startTime = Date.now()

  // AI-enhanced query processing
  let enhancedQuery = query.q
  let aiSuggestions: string[] = []

  if (query.aiEnhanced && query.q.length > 3) {
    try {
      // Use AI to understand search intent and expand query
      const aiResult = await enhanceSearchQuery(query.q)
      enhancedQuery = aiResult.enhancedQuery
      aiSuggestions = aiResult.suggestions
    } catch (error) {
      console.error('AI query enhancement failed:', error)
    }
  }

  // Filter businesses based on criteria
  let filteredBusinesses = mockBusinesses.filter(business => {
    // Text search
    if (query.q) {
      const searchTerms = enhancedQuery.toLowerCase().split(' ')
      const searchableText = `${business.name} ${business.description} ${business.category} ${business.subcategory} ${business.keywords.join(' ')}`.toLowerCase()
      
      const matches = searchTerms.some(term => searchableText.includes(term))
      if (!matches) return false
    }

    // City filter
    if (query.city && business.city.toLowerCase() !== query.city.toLowerCase()) {
      return false
    }

    // Category filter
    if (query.category && business.category.toLowerCase() !== query.category.toLowerCase()) {
      return false
    }

    // District filter
    if (query.district && business.district.toLowerCase() !== query.district.toLowerCase()) {
      return false
    }

    // Rating filter
    if (query.minRating && business.avgRating < query.minRating) {
      return false
    }

    // Price range filter
    if (query.priceRange && query.priceRange.length > 0 && !query.priceRange.includes(business.priceRange)) {
      return false
    }

    // Location/distance filter
    if (query.lat && query.lng) {
      const distance = calculateDistance(query.lat, query.lng, business.lat, business.lng)
      if (distance > query.radius) return false
    }

    // Open now filter
    if (query.isOpen && !isBusinessOpen(business.workingHours)) {
      return false
    }

    // Delivery filter
    if (query.hasDelivery && !business.amenities.includes('DELIVERY')) {
      return false
    }

    // Accessibility filter
    if (query.accessibility && !business.amenities.includes('WHEELCHAIR_ACCESSIBLE')) {
      return false
    }

    return true
  })

  // Calculate relevance scores for each business
  filteredBusinesses = filteredBusinesses.map(business => ({
    ...business,
    relevanceScore: calculateRelevanceScore(business, query.q, enhancedQuery)
  }))

  // Sort results
  filteredBusinesses.sort((a, b) => {
    switch (query.sortBy) {
      case 'relevance':
        return (b as any).relevanceScore - (a as any).relevanceScore
      case 'rating':
        return b.avgRating - a.avgRating
      case 'distance':
        if (query.lat && query.lng) {
          const distanceA = calculateDistance(query.lat, query.lng, a.lat, a.lng)
          const distanceB = calculateDistance(query.lat, query.lng, b.lat, b.lng)
          return distanceA - distanceB
        }
        return 0
      case 'reviews':
        return b.totalReviews - a.totalReviews
      case 'trending':
        // Mock trending score based on recent activity
        return (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0)
      default:
        return 0
    }
  })

  // Pagination
  const total = filteredBusinesses.length
  const paginatedResults = filteredBusinesses.slice(query.offset, query.offset + query.limit)

  // Add distance information if location provided
  const resultsWithDistance = paginatedResults.map(business => ({
    ...business,
    distance: query.lat && query.lng 
      ? calculateDistance(query.lat, query.lng, business.lat, business.lng)
      : undefined
  }))

  const searchTime = Date.now() - startTime

  return {
    results: resultsWithDistance,
    total,
    searchTime,
    suggestions: aiSuggestions
  }
}

async function enhanceSearchQuery(originalQuery: string): Promise<{ enhancedQuery: string; suggestions: string[] }> {
  try {
    const prompt = `
Kullanıcı arama sorgusu: "${originalQuery}"

Bu arama sorgusunu analiz et ve:
1. Arama kelimelerini genişlet (eş anlamlılar, ilgili terimler)
2. Alternatif arama önerileri oluştur

JSON formatında yanıt ver:
{
  "enhancedQuery": "genişletilmiş arama sorgusu",
  "suggestions": ["öneri1", "öneri2", "öneri3"]
}
    `

    const response = await openaiService.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Sen Türkçe arama sorgularını analiz eden ve iyileştiren bir AI asistanısın.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('AI response is empty')

    return JSON.parse(content)
  } catch (error) {
    console.error('AI query enhancement error:', error)
    return {
      enhancedQuery: originalQuery,
      suggestions: []
    }
  }
}

function calculateRelevanceScore(business: any, originalQuery: string, enhancedQuery: string): number {
  let score = 0
  const queryTerms = originalQuery.toLowerCase().split(' ')
  const enhancedTerms = enhancedQuery.toLowerCase().split(' ')
  
  // Name matches (highest weight)
  queryTerms.forEach(term => {
    if (business.name.toLowerCase().includes(term)) score += 10
  })
  
  // Category matches
  queryTerms.forEach(term => {
    if (business.category.toLowerCase().includes(term)) score += 8
    if (business.subcategory.toLowerCase().includes(term)) score += 8
  })
  
  // Keyword matches
  business.keywords.forEach((keyword: string) => {
    queryTerms.forEach(term => {
      if (keyword.toLowerCase().includes(term)) score += 6
    })
  })
  
  // Description matches
  queryTerms.forEach(term => {
    if (business.description.toLowerCase().includes(term)) score += 4
  })
  
  // Enhanced query matches (lower weight)
  enhancedTerms.forEach(term => {
    if (business.name.toLowerCase().includes(term)) score += 3
    if (business.description.toLowerCase().includes(term)) score += 2
  })
  
  // Boost for verified businesses
  if (business.verified) score += 2
  
  // Boost for premium businesses
  if (business.isPremium) score += 1
  
  // Rating boost
  score += business.avgRating
  
  return score
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}

function isBusinessOpen(workingHours: any[]): boolean {
  const now = new Date()
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  
  const todayHours = workingHours.find(wh => wh.day === currentDay)
  
  if (!todayHours || todayHours.isClosed) return false
  if (!todayHours.openTime || !todayHours.closeTime) return false
  
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
}