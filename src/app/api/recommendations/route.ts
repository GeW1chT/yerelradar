import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs'
import { z } from 'zod'
import { openaiService } from '@/lib/openai'
import { getCurrentUser } from '@/lib/clerk-utils'

const recommendationsSchema = z.object({
  city: z.string().optional(),
  limit: z.number().min(1).max(20).default(10),
  type: z.enum(['general', 'nearby', 'trending', 'similar']).default('general'),
  category: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  excludeVisited: z.boolean().default(true)
})

// Mock businesses for recommendations
const mockBusinesses = [
  {
    id: '1',
    name: 'Köşe Pizza',
    category: 'Restoran',
    subcategory: 'Pizza',
    city: 'İstanbul',
    district: 'Beşiktaş',
    avgRating: 4.2,
    totalReviews: 128,
    priceRange: 'MODERATE',
    keywords: ['pizza', 'lezzet', 'aile', 'geleneksel'],
    healthScore: 8.5,
    lat: 41.0431,
    lng: 29.0099
  },
  {
    id: '2',
    name: 'Artisan Coffee',
    category: 'Kafe',
    subcategory: 'Özel Kahve',
    city: 'İstanbul',
    district: 'Kadıköy',
    avgRating: 4.7,
    totalReviews: 89,
    priceRange: 'MODERATE',
    keywords: ['kahve', 'artisan', 'sakin', 'çalışma'],
    healthScore: 9.1,
    lat: 40.9897,
    lng: 29.0246
  },
  {
    id: '3',
    name: 'Sushi Zen',
    category: 'Restoran',
    subcategory: 'Japon',
    city: 'İstanbul',
    district: 'Beyoğlu',
    avgRating: 4.5,
    totalReviews: 156,
    priceRange: 'EXPENSIVE',
    keywords: ['sushi', 'japon', 'kaliteli', 'taze'],
    healthScore: 9.3,
    lat: 41.0370,
    lng: 28.9857
  },
  {
    id: '4',
    name: 'Burger House',
    category: 'Restoran',
    subcategory: 'Fast Food',
    city: 'İstanbul',
    district: 'Şişli',
    avgRating: 4.1,
    totalReviews: 201,
    priceRange: 'BUDGET',
    keywords: ['burger', 'hızlı', 'lezzetli', 'gençlik'],
    healthScore: 7.8,
    lat: 41.0588,
    lng: 28.9833
  }
]

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulaması gerekli' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryData = {
      city: searchParams.get('city') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      type: searchParams.get('type') as any || 'general',
      category: searchParams.get('category') || undefined,
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
      excludeVisited: searchParams.get('excludeVisited') !== 'false'
    }

    const validatedQuery = recommendationsSchema.parse(queryData)

    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(user, validatedQuery)

    return NextResponse.json({
      success: true,
      data: recommendations.businesses,
      meta: {
        userId: user.id,
        type: validatedQuery.type,
        total: recommendations.businesses.length,
        personalizedScore: recommendations.personalizedScore,
        recommendations: recommendations.aiRecommendations,
        nextUpdate: recommendations.nextUpdate
      }
    })

  } catch (error) {
    console.error('Recommendations API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Öneriler oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

async function generatePersonalizedRecommendations(user: any, query: any) {
  try {
    // Analyze user preferences and history
    const userProfile = await analyzeUserProfile(user)
    
    // Get AI-powered recommendations
    const aiRecommendations = await getAIRecommendations(userProfile, query)
    
    // Filter and score businesses
    let recommendations = mockBusinesses.filter(business => {
      // City filter
      if (query.city && business.city.toLowerCase() !== query.city.toLowerCase()) {
        return false
      }
      
      // Category filter
      if (query.category && business.category.toLowerCase() !== query.category.toLowerCase()) {
        return false
      }
      
      // Exclude visited places if requested
      if (query.excludeVisited && userProfile.visitedBusinesses.includes(business.id)) {
        return false
      }
      
      return true
    })

    // Calculate personalized scores
    recommendations = recommendations.map(business => ({
      ...business,
      personalizedScore: calculatePersonalizedScore(business, userProfile, query),
      matchReason: generateMatchReason(business, userProfile),
      distanceKm: query.lat && query.lng ? 
        calculateDistance(query.lat, query.lng, business.lat, business.lng) : undefined
    }))

    // Sort by personalized score
    recommendations.sort((a: any, b: any) => b.personalizedScore - a.personalizedScore)

    // Limit results
    recommendations = recommendations.slice(0, query.limit)

    return {
      businesses: recommendations,
      personalizedScore: calculateOverallPersonalizationScore(recommendations, userProfile),
      aiRecommendations,
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }

  } catch (error) {
    console.error('Error generating personalized recommendations:', error)
    throw error
  }
}

async function analyzeUserProfile(user: any) {
  // Mock user profile analysis - in real app, this would query the database
  const mockProfile = {
    id: user.id,
    level: user.level || 'BEGINNER',
    totalReviews: user.totalReviews || 0,
    experiencePoints: user.experiencePoints || 0,
    favoriteCategories: ['Restoran', 'Kafe'], // Would be derived from review history
    averageRating: 4.2, // Average rating user gives
    preferredPriceRange: ['MODERATE', 'BUDGET'],
    visitedBusinesses: ['1'], // Business IDs user has reviewed
    reviewKeywords: ['lezzetli', 'temiz', 'hızlı', 'kaliteli'], // From user's reviews
    locationPreference: 'İstanbul',
    timePreference: 'evening', // When user is most active
    socialInfluence: 'medium' // How much user follows trends
  }

  return mockProfile
}

async function getAIRecommendations(userProfile: any, query: any) {
  try {
    const prompt = `
Kullanıcı Profili:
- Seviye: ${userProfile.level}
- Toplam Yorum: ${userProfile.totalReviews}
- Favori Kategoriler: ${userProfile.favoriteCategories.join(', ')}
- Ortalama Verdiği Puan: ${userProfile.averageRating}
- Tercih Ettiği Fiyat: ${userProfile.preferredPriceRange.join(', ')}
- Yorum Anahtar Kelimeleri: ${userProfile.reviewKeywords.join(', ')}
- Konum Tercihi: ${userProfile.locationPreference}

Arama Türü: ${query.type}
${query.category ? `Kategori: ${query.category}` : ''}

Bu kullanıcıya kişiselleştirilmiş öneri stratejisi oluştur:

{
  "strategy": "öneri stratejisi açıklaması",
  "focusAreas": ["odaklanılacak alanlar"],
  "recommendations": [
    {
      "type": "öneri türü",
      "reason": "neden önerildiği",
      "priority": "high|medium|low"
    }
  ],
  "personalizedMessage": "kullanıcıya özel mesaj"
}
    `

    const response = await openaiService.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Sen kişiselleştirilmiş işletme önerisi uzmanı bir AI asistanısın.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 600,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('AI response is empty')

    return JSON.parse(content)
  } catch (error) {
    console.error('AI recommendations error:', error)
    return {
      strategy: 'Genel öneriler',
      focusAreas: ['kalite', 'konum'],
      recommendations: [],
      personalizedMessage: 'Size özel öneriler hazırladık!'
    }
  }
}

function calculatePersonalizedScore(business: any, userProfile: any, query: any): number {
  let score = 0

  // Base rating score (0-40 points)
  score += business.avgRating * 8

  // Category preference (0-20 points)
  if (userProfile.favoriteCategories.includes(business.category)) {
    score += 20
  }

  // Price preference (0-15 points)
  if (userProfile.preferredPriceRange.includes(business.priceRange)) {
    score += 15
  }

  // Health score preference (0-10 points)
  score += business.healthScore

  // Keyword matching (0-10 points)
  const matchingKeywords = business.keywords.filter((keyword: string) => 
    userProfile.reviewKeywords.some((userKeyword: string) => 
      keyword.toLowerCase().includes(userKeyword.toLowerCase())
    )
  )
  score += matchingKeywords.length * 2

  // Review count (0-5 points)
  score += Math.min(business.totalReviews / 50, 5)

  // Distance bonus/penalty (query dependent)
  if (query.lat && query.lng) {
    const distance = calculateDistance(query.lat, query.lng, business.lat, business.lng)
    if (distance < 2) score += 5 // Very close
    else if (distance > 10) score -= 5 // Far away
  }

  // User level adjustment
  if (userProfile.level === 'LOCAL_HERO' || userProfile.level === 'GURU') {
    // Experienced users might prefer premium or unique places
    if (business.healthScore > 9) score += 5
  }

  return Math.round(score)
}

function generateMatchReason(business: any, userProfile: any): string {
  const reasons = []

  if (userProfile.favoriteCategories.includes(business.category)) {
    reasons.push(`${business.category} sevginiz`)
  }

  if (business.avgRating >= 4.5) {
    reasons.push('yüksek puanı')
  }

  if (userProfile.preferredPriceRange.includes(business.priceRange)) {
    reasons.push('uygun fiyat aralığı')
  }

  const matchingKeywords = business.keywords.filter((keyword: string) => 
    userProfile.reviewKeywords.some((userKeyword: string) => 
      keyword.toLowerCase().includes(userKeyword.toLowerCase())
    )
  )

  if (matchingKeywords.length > 0) {
    reasons.push(`"${matchingKeywords[0]}" tercihiniz`)
  }

  if (business.healthScore > 8.5) {
    reasons.push('yüksek sağlık skoru')
  }

  if (reasons.length === 0) {
    reasons.push('genel uyumunuz')
  }

  return reasons.slice(0, 2).join(' ve ') + ' nedeniyle öneriliyor'
}

function calculateOverallPersonalizationScore(recommendations: any[], userProfile: any): number {
  if (recommendations.length === 0) return 0

  const avgScore = recommendations.reduce((sum, rec) => sum + rec.personalizedScore, 0) / recommendations.length
  const maxPossibleScore = 100 // Maximum possible personalized score
  
  return Math.round((avgScore / maxPossibleScore) * 100)
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