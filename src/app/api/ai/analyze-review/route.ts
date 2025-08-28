import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const analyzeReviewSchema = z.object({
  reviewText: z.string().min(10),
  businessType: z.string().optional(),
  audioUrl: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewText, businessType, audioUrl } = analyzeReviewSchema.parse(body)

    // Simulate OpenAI analysis (replace with actual OpenAI call)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

    // Mock AI analysis based on review content
    const mockAnalysis = generateMockAnalysis(reviewText, businessType)

    return NextResponse.json({
      success: true,
      data: mockAnalysis
    })

  } catch (error) {
    console.error('AI Analysis Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri formatı', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'AI analizi sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

function generateMockAnalysis(reviewText: string, businessType = '') {
  const text = reviewText.toLowerCase()
  
  // Sentiment analysis based on keywords
  const positiveWords = ['harika', 'mükemmel', 'güzel', 'lezzetli', 'temiz', 'hızlı', 'kaliteli', 'başarılı', 'beğendim', 'tavsiye']
  const negativeWords = ['kötü', 'berbat', 'yavaş', 'pahalı', 'kirli', 'soğuk', 'tatsız', 'başarısız', 'beğenmedim']
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  
  let sentiment = 'NEUTRAL'
  let sentimentScore = 5.0
  
  if (positiveCount > negativeCount + 1) {
    sentiment = positiveCount > 3 ? 'VERY_POSITIVE' : 'POSITIVE'
    sentimentScore = Math.min(8.5, 6 + positiveCount * 0.5)
  } else if (negativeCount > positiveCount + 1) {
    sentiment = negativeCount > 3 ? 'VERY_NEGATIVE' : 'NEGATIVE'
    sentimentScore = Math.max(2.0, 5 - negativeCount * 0.7)
  }

  // Extract keywords/tags
  const tags = []
  if (text.includes('lezzet') || text.includes('lezzetli') || text.includes('tat')) tags.push('lezzet')
  if (text.includes('servis') || text.includes('hizmet') || text.includes('personel')) tags.push('servis')
  if (text.includes('temiz') || text.includes('hijyen')) tags.push('temizlik')
  if (text.includes('fiyat') || text.includes('ücret') || text.includes('pahalı') || text.includes('ucuz')) tags.push('fiyat')
  if (text.includes('atmosfer') || text.includes('ortam') || text.includes('dekor')) tags.push('atmosfer')
  if (text.includes('hızlı') || text.includes('yavaş')) tags.push('hız')
  if (text.includes('kalite') || text.includes('kaliteli')) tags.push('kalite')

  // Category scores based on content analysis
  const categories = {
    taste: extractCategoryScore(text, ['lezzet', 'tat', 'lezzetli', 'tat', 'yemek'], sentimentScore),
    service: extractCategoryScore(text, ['servis', 'hizmet', 'personel', 'garson'], sentimentScore),
    cleanliness: extractCategoryScore(text, ['temiz', 'hijyen', 'kirli'], sentimentScore),
    price: extractCategoryScore(text, ['fiyat', 'ücret', 'pahalı', 'ucuz', 'değer'], sentimentScore),
    atmosphere: extractCategoryScore(text, ['atmosfer', 'ortam', 'dekor', 'müzik'], sentimentScore)
  }

  // Generate insights
  const insights = []
  if (sentiment === 'VERY_POSITIVE') {
    insights.push('Müşteri deneyiminden çok memnun')
  } else if (sentiment === 'VERY_NEGATIVE') {
    insights.push('Müşteri ciddi sorunlar yaşamış')
  }
  
  if (tags.includes('lezzet') && sentimentScore > 7) {
    insights.push('Lezzet konusunda övgü aldı')
  }
  if (tags.includes('servis') && sentimentScore > 7) {
    insights.push('Servis kalitesi takdir edildi')
  }

  return {
    sentiment,
    sentimentScore: Math.round(sentimentScore * 10) / 10,
    tags: tags.slice(0, 5), // Max 5 tags
    categories,
    insights,
    summary: generateSummary(sentiment, tags, insights),
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    language: 'tr',
    wordCount: reviewText.split(' ').length
  }
}

function extractCategoryScore(text: string, keywords: string[], baseSentiment: number): number {
  const mentioned = keywords.some(keyword => text.includes(keyword))
  if (!mentioned) return 0
  
  // Adjust score based on context
  let score = baseSentiment
  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      if (text.includes(`${keyword} güzel`) || text.includes(`${keyword} iyi`)) {
        score += 1
      } else if (text.includes(`${keyword} kötü`) || text.includes(`${keyword} berbat`)) {
        score -= 2
      }
    }
  })
  
  return Math.max(0, Math.min(10, Math.round(score)))
}

function generateSummary(sentiment: string, tags: string[], insights: string[]): string {
  const sentimentTexts = {
    VERY_POSITIVE: 'Çok olumlu',
    POSITIVE: 'Olumlu',
    NEUTRAL: 'Nötr',
    NEGATIVE: 'Olumsuz',
    VERY_NEGATIVE: 'Çok olumsuz'
  }
  
  let summary = `${sentimentTexts[sentiment as keyof typeof sentimentTexts]} bir yorum. `
  
  if (tags.length > 0) {
    summary += `Odak noktaları: ${tags.join(', ')}. `
  }
  
  if (insights.length > 0) {
    summary += insights[0]
  }
  
  return summary
}