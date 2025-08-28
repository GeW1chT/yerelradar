import OpenAI from 'openai'
import { AIReviewAnalysis, AIPhotoAnalysis, AudioAnalysis, Sentiment, BusinessInsights, PersonalizedRecommendation } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Advanced Review Analysis with Multi-dimensional Scoring
export async function analyzeReview(reviewText: string, businessType: string, audioUrl?: string): Promise<AIReviewAnalysis> {
  const prompt = `
    Türkçe restoran/işletme yorumunu detaylı analiz et: "${reviewText}"
    İşletme türü: ${businessType}
    
    JSON formatında dön:
    {
      "sentiment": "VERY_NEGATIVE|NEGATIVE|NEUTRAL|POSITIVE|VERY_POSITIVE",
      "score": 0-10 arası genel puan,
      "categories": {
        "taste": 0-10,
        "service": 0-10,
        "cleanliness": 0-10,
        "price": 0-10,
        "atmosphere": 0-10
      },
      "summary": "tek cümle özet",
      "tags": ["pozitif etiketler array"],
      "suggestions": "işletmeye öneriler varsa",
      "authenticity": 0-10 (sahtelik kontrolü),
      "emotionalTone": "excited|satisfied|neutral|disappointed|angry"
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  let analysis = JSON.parse(response.choices[0].message.content!)

  // Audio analysis if provided
  if (audioUrl) {
    const audioAnalysis = await analyzeAudio(audioUrl)
    analysis.audioSentiment = audioAnalysis
  }

  return analysis
}

// AI Photo Analysis for Automatic Tagging
export async function analyzePhoto(imageUrl: string, businessType: string): Promise<AIPhotoAnalysis> {
  const prompt = `
    Bu ${businessType} fotoğrafını analiz et: ${imageUrl}
    
    JSON formatında dön:
    {
      "dishType": "yemek türü (varsa)",
      "ambiance": "atmosfer tanımı",
      "crowdLevel": "empty|quiet|moderate|busy|packed",
      "qualityScore": 0-10,
      "detectedItems": ["görünen öğeler array"],
      "colorPalette": ["dominant renkler"],
      "lighting": "poor|dim|good|bright|excellent",
      "cleanliness": 0-10
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Audio Review Analysis
export async function analyzeAudio(audioUrl: string): Promise<AudioAnalysis> {
  // First transcribe the audio
  const transcription = await openai.audio.transcriptions.create({
    file: await fetch(audioUrl).then(r => r.blob()),
    model: "whisper-1",
    language: "tr"
  })

  const prompt = `
    Bu ses yorumunu analiz et: "${transcription.text}"
    
    JSON formatında dön:
    {
      "sentiment": "VERY_NEGATIVE|NEGATIVE|NEUTRAL|POSITIVE|VERY_POSITIVE",
      "enthusiasm": 0-10,
      "authenticity": 0-10,
      "tone": "excited|satisfied|neutral|disappointed|angry",
      "speechClarity": 0-10,
      "backgroundNoise": 0-10
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Business Intelligence Report Generation
export async function generateBusinessReport(businessId: string, reviews: any[], competitors: any[]): Promise<BusinessInsights> {
  const recentReviews = reviews.slice(0, 50) // Last 50 reviews
  const reviewTexts = recentReviews.map(r => r.content).join('\n---\n')

  const prompt = `
    Bu işletme için detaylı AI rapor oluştur:
    
    Son yorumlar: "${reviewTexts}"
    
    Rakip bilgileri: ${JSON.stringify(competitors)}
    
    JSON formatında dön:
    {
      "overview": "genel durum özeti",
      "strengths": ["güçlü yönler array"],
      "weaknesses": ["zayıf yönler array"],
      "suggestions": ["öneriler array"],
      "competitorComparison": "rakip analizi",
      "trendAnalysis": {
        "direction": "up|down|stable",
        "percentage": sayı,
        "period": "son 30 gün"
      },
      "monthlyStats": {
        "totalReviews": sayı,
        "avgRating": sayı,
        "positivePercentage": sayı,
        "responseRate": sayı
      }
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Personalized Recommendations Engine
export async function generatePersonalizedRecommendations(
  userId: string, 
  userReviews: any[], 
  userPreferences: any,
  nearbyBusinesses: any[]
): Promise<PersonalizedRecommendation[]> {
  
  const userProfile = await analyzeUserProfile(userReviews, userPreferences)
  
  const prompt = `
    Bu kullanıcı profiline göre işletme önerileri oluştur:
    
    Kullanıcı profili: ${JSON.stringify(userProfile)}
    Yakındaki işletmeler: ${JSON.stringify(nearbyBusinesses)}
    
    Her öneri için JSON array dön:
    [
      {
        "businessId": "id",
        "score": 0-100,
        "reasons": ["öneri sebepleri"],
        "type": "taste_match|location_convenience|social_proof|trending|discovery",
        "confidence": 0-100
      }
    ]
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  const recommendations = JSON.parse(response.choices[0].message.content!)
  
  return recommendations.map((rec: any) => ({
    ...rec,
    business: nearbyBusinesses.find(b => b.id === rec.businessId)
  }))
}

// User Profile Analysis for Better Recommendations
async function analyzeUserProfile(userReviews: any[], userPreferences: any) {
  const reviewTexts = userReviews.map(r => r.content).join('\n---\n')
  
  const prompt = `
    Bu kullanıcının yorum geçmişini analiz et ve profil çıkar:
    
    Yorumlar: "${reviewTexts}"
    Tercihler: ${JSON.stringify(userPreferences)}
    
    JSON formatında dön:
    {
      "preferredCategories": ["kategori tercihleri"],
      "pricePreference": "BUDGET|MODERATE|EXPENSIVE|LUXURY",
      "cuisinePreferences": ["mutfak tercihleri"],
      "atmospherePreference": "casual|formal|trendy|traditional",
      "importantFactors": ["önem verdiği faktörler"],
      "avoidancePatterns": ["kaçındığı şeyler"],
      "personalityType": "adventurous|conservative|social|quiet"
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Smart Search with AI Enhancement
export async function enhanceSearch(query: string, context: any) {
  const prompt = `
    Bu arama sorgusunu geliştirir ve anlamını genişlet:
    
    Sorgu: "${query}"
    Bağlam: ${JSON.stringify(context)}
    
    JSON formatında dön:
    {
      "enhancedQuery": "geliştirilmiş sorgu",
      "suggestedFilters": {"kategori": "değer"},
      "relatedSearches": ["ilgili aramalar"],
      "intent": "restaurant|cafe|shopping|entertainment|service",
      "sentiment": "casual|urgent|exploratory|specific"
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Health & Safety Alert Analysis
export async function analyzeHealthConcerns(reviews: any[]) {
  const concerningReviews = reviews.filter(r => 
    r.content.toLowerCase().includes('hastalandım') ||
    r.content.toLowerCase().includes('zehirlen') ||
    r.content.toLowerCase().includes('mide') ||
    r.rating <= 2
  )

  if (concerningReviews.length === 0) return null

  const reviewTexts = concerningReviews.map(r => r.content).join('\n---\n')

  const prompt = `
    Bu yorumlarda sağlık riski var mı analiz et:
    
    Yorumlar: "${reviewTexts}"
    
    JSON formatında dön:
    {
      "hasHealthRisk": true/false,
      "riskLevel": "low|medium|high|critical",
      "riskType": "food_poisoning|hygiene|other",
      "confidence": 0-100,
      "evidence": ["kanıt metinleri"],
      "recommendation": "önerilen aksiyon"
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Competitor Analysis
export async function analyzeCompetitors(business: any, competitors: any[]) {
  const prompt = `
    Bu işletme için rakip analizi yap:
    
    Ana işletme: ${JSON.stringify(business)}
    Rakipler: ${JSON.stringify(competitors)}
    
    JSON formatında dön:
    {
      "competitivePosition": "leader|strong|average|weak",
      "advantages": ["avantajlar"],
      "disadvantages": ["dezavantajlar"],
      "opportunities": ["fırsatlar"],
      "threats": ["tehditler"],
      "marketShare": "tahmini pazar payı",
      "recommendations": ["öneriler"]
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Trend Detection
export async function detectTrends(cityData: any, timeframe: string = '30d') {
  const prompt = `
    Bu şehir verilerinden trendleri tespit et:
    
    Veri: ${JSON.stringify(cityData)}
    Zaman aralığı: ${timeframe}
    
    JSON formatında dön:
    {
      "risingCategories": ["yükselen kategoriler"],
      "decliningCategories": ["düşen kategoriler"],
      "emergingTrends": ["yeni trendler"],
      "seasonalPatterns": "mevsimsel desenler",
      "predictions": ["tahminler"],
      "confidence": 0-100
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}

// Voice Search Understanding
export async function processVoiceSearch(audioUrl: string) {
  // Transcribe voice to text
  const transcription = await openai.audio.transcriptions.create({
    file: await fetch(audioUrl).then(r => r.blob()),
    model: "whisper-1",
    language: "tr"
  })

  // Enhance and understand the search intent
  return await enhanceSearch(transcription.text, { source: 'voice' })
}

// Mystery Diner Mission Generator
export async function generateMysteryMission(business: any, weaknesses: string[]) {
  const prompt = `
    Bu işletme için gizli müşteri görevi oluştur:
    
    İşletme: ${JSON.stringify(business)}
    Zayıf yönler: ${JSON.stringify(weaknesses)}
    
    JSON formatında dön:
    {
      "title": "görev başlığı",
      "description": "detaylı açıklama",
      "requirements": ["kontrol edilecek noktalar"],
      "duration": "tahmini süre",
      "reward": "ödül puanı",
      "difficulty": "easy|medium|hard",
      "focus_areas": ["odaklanılacak alanlar"]
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}