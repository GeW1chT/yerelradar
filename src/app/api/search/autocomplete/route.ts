import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const autocompleteSchema = z.object({
  q: z.string().min(1).max(50),
  city: z.string().optional(),
  limit: z.number().min(1).max(20).default(10),
  type: z.enum(['businesses', 'categories', 'all']).default('all')
})

// Mock data for autocomplete suggestions
const mockCategories = [
  'Restoran', 'Kafe', 'Fast Food', 'Berber', 'Kuaför', 'Market', 'Eczane', 
  'Spor Salonu', 'Güzellik Salonu', 'Veteriner', 'Temizlikçi', 'Elektrikçi'
]

const mockBusinessNames = [
  'Köşe Pizza', 'Starbucks', 'McDonald\'s', 'Burger King', 'Berber Ali',
  'Kuaför Ayşe', 'Migros', 'CarrefourSA', 'Eczane Plus', 'Gold\'s Gym'
]

const mockKeywords = [
  'pizza', 'hamburger', 'kahve', 'tıraş', 'saç kesimi', 'market', 'ilaç',
  'spor', 'fitness', 'güzellik', 'makyaj', 'pet shop', 'temizlik'
]

const mockPopularSearches = [
  'en iyi pizza', 'açık kafeler', 'ucuz berber', 'kaliteli restoran',
  'hızlı yemek', 'güvenilir eczane', 'modern kuaför', 'temiz market'
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const queryData = {
      q: searchParams.get('q') || '',
      city: searchParams.get('city') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      type: searchParams.get('type') as any || 'all'
    }

    const validatedQuery = autocompleteSchema.parse(queryData)
    const suggestions = generateSuggestions(validatedQuery)

    return NextResponse.json({
      success: true,
      data: suggestions,
      meta: {
        query: validatedQuery.q,
        count: suggestions.length,
        type: validatedQuery.type
      }
    })

  } catch (error) {
    console.error('Autocomplete API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Öneri oluşturma sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

function generateSuggestions(query: z.infer<typeof autocompleteSchema>) {
  const suggestions: any[] = []
  const searchTerm = query.q.toLowerCase()

  // Business name suggestions
  if (query.type === 'businesses' || query.type === 'all') {
    const businessMatches = mockBusinessNames
      .filter(name => name.toLowerCase().includes(searchTerm))
      .map(name => ({
        type: 'business',
        text: name,
        highlight: highlightMatch(name, query.q),
        category: 'İşletme',
        icon: 'building'
      }))
    suggestions.push(...businessMatches)
  }

  // Category suggestions
  if (query.type === 'categories' || query.type === 'all') {
    const categoryMatches = mockCategories
      .filter(category => category.toLowerCase().includes(searchTerm))
      .map(category => ({
        type: 'category',
        text: category,
        highlight: highlightMatch(category, query.q),
        category: 'Kategori',
        icon: 'tag'
      }))
    suggestions.push(...categoryMatches)
  }

  // Keyword suggestions
  if (query.type === 'all') {
    const keywordMatches = mockKeywords
      .filter(keyword => keyword.toLowerCase().includes(searchTerm))
      .map(keyword => ({
        type: 'keyword',
        text: keyword,
        highlight: highlightMatch(keyword, query.q),
        category: 'Anahtar Kelime',
        icon: 'search'
      }))
    suggestions.push(...keywordMatches)
  }

  // Popular search suggestions
  if (query.type === 'all' && searchTerm.length >= 3) {
    const popularMatches = mockPopularSearches
      .filter(search => search.toLowerCase().includes(searchTerm))
      .map(search => ({
        type: 'popular',
        text: search,
        highlight: highlightMatch(search, query.q),
        category: 'Popüler Arama',
        icon: 'trending-up'
      }))
    suggestions.push(...popularMatches)
  }

  // Sort by relevance (exact matches first, then partial matches)
  suggestions.sort((a, b) => {
    const aExact = a.text.toLowerCase().startsWith(searchTerm)
    const bExact = b.text.toLowerCase().startsWith(searchTerm)
    
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    
    return a.text.length - b.text.length
  })

  // Add search intent suggestions if no direct matches
  if (suggestions.length === 0) {
    suggestions.push(...generateSearchIntentSuggestions(query.q))
  }

  return suggestions.slice(0, query.limit)
}

function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function generateSearchIntentSuggestions(query: string): any[] {
  const intentSuggestions = []
  
  // Location-based suggestions
  if (query.includes('yakın') || query.includes('burada')) {
    intentSuggestions.push({
      type: 'intent',
      text: `Yakınımdaki ${query.replace(/yakın|burada/gi, '').trim()}`,
      highlight: query,
      category: 'Yakın Konum',
      icon: 'map-pin'
    })
  }

  // Time-based suggestions
  if (query.includes('açık') || query.includes('geç')) {
    intentSuggestions.push({
      type: 'intent',
      text: `Şu anda açık ${query.replace(/açık|geç/gi, '').trim()}`,
      highlight: query,
      category: 'Açık Yerler',
      icon: 'clock'
    })
  }

  // Price-based suggestions
  if (query.includes('ucuz') || query.includes('uygun') || query.includes('ekonomik')) {
    intentSuggestions.push({
      type: 'intent',
      text: `Uygun fiyatlı ${query.replace(/ucuz|uygun|ekonomik/gi, '').trim()}`,
      highlight: query,
      category: 'Ekonomik',
      icon: 'dollar-sign'
    })
  }

  // Quality-based suggestions
  if (query.includes('iyi') || query.includes('kaliteli') || query.includes('güzel')) {
    intentSuggestions.push({
      type: 'intent',
      text: `Kaliteli ${query.replace(/iyi|kaliteli|güzel/gi, '').trim()}`,
      highlight: query,
      category: 'Kaliteli',
      icon: 'star'
    })
  }

  return intentSuggestions
}