import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Response schemas for type safety
const ReviewAnalysisSchema = z.object({
  sentiment: z.enum(['VERY_POSITIVE', 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'VERY_NEGATIVE']),
  sentimentScore: z.number().min(0).max(10),
  tags: z.array(z.string()).max(10),
  categories: z.object({
    taste: z.number().min(0).max(10),
    service: z.number().min(0).max(10),
    cleanliness: z.number().min(0).max(10),
    price: z.number().min(0).max(10),
    atmosphere: z.number().min(0).max(10),
  }),
  insights: z.array(z.string()).max(5),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  language: z.string(),
  wordCount: z.number(),
})

const BusinessInsightSchema = z.object({
  strengths: z.array(z.string()).max(5),
  weaknesses: z.array(z.string()).max(5),
  recommendations: z.array(z.string()).max(5),
  overallScore: z.number().min(0).max(10),
  competitorAnalysis: z.string(),
  marketPosition: z.string(),
  trendsAnalysis: z.string(),
})

export class OpenAIService {
  private static instance: OpenAIService
  
  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  async analyzeReview(reviewText: string, businessType: string = ''): Promise<any> {
    try {
      const prompt = `
Aşağıdaki Türkçe işletme yorumunu analiz et ve JSON formatında yanıt ver:

Yorum: "${reviewText}"
İşletme Türü: "${businessType}"

Analiz et ve şu JSON formatında yanıt ver:
{
  "sentiment": "VERY_POSITIVE|POSITIVE|NEUTRAL|NEGATIVE|VERY_NEGATIVE",
  "sentimentScore": 0-10 arası sayı,
  "tags": ["anahtar", "kelimeler", "listesi"],
  "categories": {
    "taste": 0-10 arası puan (lezzet/kalite),
    "service": 0-10 arası puan (hizmet),
    "cleanliness": 0-10 arası puan (temizlik),
    "price": 0-10 arası puan (fiyat),
    "atmosphere": 0-10 arası puan (atmosfer)
  },
  "insights": ["önemli", "bulgular", "listesi"],
  "summary": "Yorumun kısa özeti",
  "confidence": 0-1 arası güven skoru,
  "language": "tr",
  "wordCount": kelime sayısı
}

Sadece JSON yanıtı ver, başka açıklama ekleme.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Sen Türkçe işletme yorumlarını analiz eden bir AI asistanısın. Sadece JSON formatında yanıt veriyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('OpenAI response is empty')

      // Parse and validate the response
      const parsed = JSON.parse(content)
      return ReviewAnalysisSchema.parse(parsed)

    } catch (error) {
      console.error('OpenAI review analysis error:', error)
      throw new Error('Yorum analizi sırasında hata oluştu')
    }
  }

  async generateBusinessInsights(
    reviews: any[], 
    businessData: any, 
    competitorData: any[] = []
  ): Promise<any> {
    try {
      const reviewsText = reviews.map(r => r.content).join('\n---\n')
      
      const prompt = `
İşletme: ${businessData.name} (${businessData.category})
Lokasyon: ${businessData.district}, ${businessData.city}
Ortalama Puan: ${businessData.avgRating}/5
Toplam Yorum: ${businessData.totalReviews}

Yorumlar:
${reviewsText}

Bu işletme hakkında detaylı analiz yap ve JSON formatında yanıt ver:
{
  "strengths": ["güçlü yönler listesi"],
  "weaknesses": ["zayıf yönler listesi"], 
  "recommendations": ["iyileştirme önerileri"],
  "overallScore": 0-10 arası genel puan,
  "competitorAnalysis": "rakip analizi metni",
  "marketPosition": "pazar konumu analizi",
  "trendsAnalysis": "trend analizi"
}

Sadece JSON yanıtı ver.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Sen işletme danışmanı olan bir AI asistanısın. İşletmelerin performansını analiz ediyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500,
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('OpenAI response is empty')

      const parsed = JSON.parse(content)
      return BusinessInsightSchema.parse(parsed)

    } catch (error) {
      console.error('OpenAI business insights error:', error)
      throw new Error('İşletme analizi sırasında hata oluştu')
    }
  }

  async generatePersonalizedRecommendations(
    userProfile: any,
    userHistory: any[],
    availableBusinesses: any[]
  ): Promise<any[]> {
    try {
      const prompt = `
Kullanıcı Profili:
- Seviye: ${userProfile.level}
- Favori Kategoriler: ${userProfile.favoriteCategories || 'Belirtilmemiş'}
- Geçmiş Yorumlar: ${userHistory.length} adet
- Konum: ${userProfile.location || 'Belirtilmemiş'}

Geçmiş Aktiviteler:
${userHistory.map(h => `- ${h.business?.name}: ${h.rating}/5 - "${h.content}"`).join('\n')}

Mevcut İşletmeler: ${availableBusinesses.length} adet

Bu kullanıcıya özelleştirilmiş işletme önerileri oluştur. Kullanıcının geçmiş tercihleri, puanları ve yorumlarına göre en uygun 5 işletmeyi öner.

JSON formatında yanıt ver:
[
  {
    "businessId": "işletme_id",
    "reason": "neden önerildiği",
    "matchScore": 0-100 arası uyum puanı,
    "personalizedMessage": "kişiselleştirilmiş mesaj"
  }
]
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Sen kişiselleştirilmiş öneri sistemi olan bir AI asistanısın.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1200,
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('OpenAI response is empty')

      return JSON.parse(content)

    } catch (error) {
      console.error('OpenAI recommendations error:', error)
      throw new Error('Öneri oluşturma sırasında hata oluştu')
    }
  }

  async analyzeAudio(audioBase64: string): Promise<any> {
    try {
      // Note: OpenAI Whisper API kullanımı için
      // Bu bir placeholder implementasyondur
      // Gerçek implementasyonda audio file'ı Whisper API'ye gönderilmeli
      
      return {
        transcription: 'Ses analizi henüz aktif değil',
        sentiment: 'NEUTRAL',
        confidence: 0.5,
        language: 'tr'
      }
    } catch (error) {
      console.error('OpenAI audio analysis error:', error)
      throw new Error('Ses analizi sırasında hata oluştu')
    }
  }

  async analyzeImage(imageBase64: string): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Bu işletme fotoğrafını analiz et ve şu bilgileri JSON formatında ver: {"description": "fotoğraf açıklaması", "tags": ["anahtar","kelimeler"], "quality": 0-10, "atmosphere": "atmosfer değerlendirmesi"}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('OpenAI response is empty')

      return JSON.parse(content)

    } catch (error) {
      console.error('OpenAI image analysis error:', error)
      throw new Error('Fotoğraf analizi sırasında hata oluştu')
    }
  }

  async generateSEOContent(business: any): Promise<any> {
    try {
      const prompt = `
İşletme: ${business.name}
Kategori: ${business.category}
Lokasyon: ${business.district}, ${business.city}
Özellikler: ${business.description}

Bu işletme için SEO optimizasyonlu içerik oluştur:
{
  "title": "SEO başlığı",
  "metaDescription": "meta açıklama",
  "h1": "ana başlık",
  "h2Tags": ["alt başlıklar"],
  "keywords": ["anahtar kelimeler"],
  "content": "SEO dostu içerik paragrafı"
}
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Sen SEO uzmanı olan bir AI asistanısın. Türkçe SEO içerikleri oluşturuyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('OpenAI response is empty')

      return JSON.parse(content)

    } catch (error) {
      console.error('OpenAI SEO content error:', error)
      throw new Error('SEO içerik oluşturma sırasında hata oluştu')
    }
  }
}

export const openaiService = OpenAIService.getInstance()