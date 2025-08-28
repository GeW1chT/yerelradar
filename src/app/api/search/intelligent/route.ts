import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { openaiService } from '@/lib/openai'

const intelligentSearchSchema = z.object({
  query: z.string().min(1).max(200),
  context: z.object({
    userLocation: z.object({
      lat: z.number(),
      lng: z.number(),
      city: z.string().optional(),
      district: z.string().optional()
    }).optional(),
    userPreferences: z.object({
      favoriteCategories: z.array(z.string()).optional(),
      pricePreference: z.enum(['BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY']).optional(),
      pastSearches: z.array(z.string()).optional()
    }).optional(),
    timeContext: z.object({
      currentTime: z.string(), // ISO string
      isWeekend: z.boolean(),
      timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional()
    }).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, context } = intelligentSearchSchema.parse(body)

    // Analyze query with AI
    const analysisResult = await analyzeNaturalLanguageQuery(query, context)
    
    if (!analysisResult.success) {
      return NextResponse.json(
        { success: false, error: 'Sorgu analiz edilemedi' },
        { status: 400 }
      )
    }

    // Convert AI analysis to search parameters
    const searchParams = convertToSearchParams(analysisResult.data, context)

    // Perform the actual search
    const searchResults = await performIntelligentSearch(searchParams)

    return NextResponse.json({
      success: true,
      data: {
        originalQuery: query,
        interpretation: analysisResult.data.interpretation,
        intent: analysisResult.data.intent,
        searchParams,
        results: searchResults.results,
        suggestions: analysisResult.data.suggestions,
        contextualRecommendations: searchResults.contextualRecommendations
      },
      meta: {
        total: searchResults.total,
        confidence: analysisResult.data.confidence,
        processingTime: searchResults.processingTime
      }
    })

  } catch (error) {
    console.error('Intelligent search error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz arama parametreleri', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Akıllı arama sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

async function analyzeNaturalLanguageQuery(query: string, context: any) {
  try {
    const contextInfo = buildContextPrompt(context)
    
    const prompt = `
Kullanıcının doğal dil arama sorgusu: "${query}"

${contextInfo}

Bu sorguyu analiz et ve kullanıcının ne aradığını anla. JSON formatında yanıt ver:

{
  "interpretation": "kullanıcının ne aradığının açıklaması",
  "intent": "primary_intent", // find_restaurant, find_service, check_hours, compare_options, get_directions, etc.
  "entities": {
    "businessType": "işletme türü",
    "location": "konum tercihi",
    "timeRequirement": "zaman gereksinimi",
    "priceRange": "fiyat tercihi",
    "specificFeatures": ["özel özellikler"],
    "mood": "kullanıcının mood'u" // casual, urgent, exploring, specific
  },
  "searchTerms": ["anahtar", "kelimeler"],
  "filters": {
    "category": "kategori",
    "isOpen": true/false,
    "priceRange": ["BUDGET", "MODERATE"],
    "hasDelivery": true/false,
    "minRating": 4,
    "distance": 5000 // meters
  },
  "suggestions": ["alternatif arama önerileri"],
  "confidence": 0.85
}

Örnek sorgular ve analizleri:
- "çok acıktım hızlıca bir şeyler yemek istiyorum" → intent: find_restaurant, mood: urgent, filters: {hasDelivery: true}
- "romantik bir akşam yemeği için güzel bir yer" → intent: find_restaurant, mood: romantic, filters: {priceRange: ["EXPENSIVE", "LUXURY"]}
- "çocuklarla gidebileceğim yer" → intent: find_restaurant, specificFeatures: ["family_friendly"]
- "sabah kahvesi içebileceğim yakın kafe" → intent: find_cafe, timeRequirement: "morning", location: "nearby"
    `

    const response = await openaiService.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Sen doğal dil işleme uzmanı bir AI asistanısın. Kullanıcıların arama sorgularını analiz edip intent ve context çıkarıyorsun.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('AI response is empty')

    const parsed = JSON.parse(content)
    
    return {
      success: true,
      data: parsed
    }
  } catch (error) {
    console.error('Query analysis error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

function buildContextPrompt(context: any): string {
  if (!context) return ''

  let contextPrompt = '\nBağlam Bilgileri:\n'
  
  if (context.userLocation) {
    contextPrompt += `- Kullanıcı konumu: ${context.userLocation.city || 'Bilinmeyen şehir'}`
    if (context.userLocation.district) {
      contextPrompt += `, ${context.userLocation.district}`
    }
    contextPrompt += '\n'
  }

  if (context.userPreferences) {
    if (context.userPreferences.favoriteCategories?.length > 0) {
      contextPrompt += `- Favori kategoriler: ${context.userPreferences.favoriteCategories.join(', ')}\n`
    }
    if (context.userPreferences.pricePreference) {
      contextPrompt += `- Fiyat tercihi: ${context.userPreferences.pricePreference}\n`
    }
    if (context.userPreferences.pastSearches?.length > 0) {
      contextPrompt += `- Geçmiş aramalar: ${context.userPreferences.pastSearches.slice(0, 3).join(', ')}\n`
    }
  }

  if (context.timeContext) {
    const time = new Date(context.timeContext.currentTime)
    contextPrompt += `- Şu anki zaman: ${time.toLocaleString('tr-TR')}\n`
    contextPrompt += `- Hafta sonu: ${context.timeContext.isWeekend ? 'Evet' : 'Hayır'}\n`
    if (context.timeContext.timeOfDay) {
      contextPrompt += `- Günün saati: ${context.timeContext.timeOfDay}\n`
    }
  }

  return contextPrompt
}

function convertToSearchParams(analysisData: any, context: any) {
  const params: any = {
    q: analysisData.searchTerms?.join(' ') || '',
    intent: analysisData.intent,
    ...analysisData.filters
  }

  // Add location context
  if (context?.userLocation?.city) {
    params.city = context.userLocation.city
  }

  // Add user preferences
  if (context?.userPreferences?.pricePreference && !params.priceRange) {
    params.priceRange = [context.userPreferences.pricePreference]
  }

  return params
}

async function performIntelligentSearch(searchParams: any) {
  const startTime = Date.now()
  
  // Mock implementation - in real app, this would call the main search API
  const mockResults = [
    {
      id: '1',
      name: 'Akıllı Arama Sonucu',
      category: searchParams.category || 'Restoran',
      avgRating: 4.5,
      totalReviews: 100,
      relevanceScore: 95
    }
  ]

  // Generate contextual recommendations based on intent
  const contextualRecommendations = generateContextualRecommendations(searchParams)

  return {
    results: mockResults,
    total: mockResults.length,
    contextualRecommendations,
    processingTime: Date.now() - startTime
  }
}

function generateContextualRecommendations(searchParams: any): string[] {
  const recommendations = []

  switch (searchParams.intent) {
    case 'find_restaurant':
      recommendations.push('Önceki yorumlara göre servis hızına dikkat edin')
      recommendations.push('Bu saatte rezervasyon yapmanız önerilir')
      break
    case 'find_service':
      recommendations.push('İşletmenin çalışma saatlerini kontrol edin')
      recommendations.push('Önceden randevu almanız gerekebilir')
      break
    case 'check_hours':
      recommendations.push('Tatil günlerinde farklı saatler olabilir')
      break
    default:
      recommendations.push('Daha spesifik arama için filtreler kullanabilirsiniz')
  }

  return recommendations
}