import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk-utils'
import { prisma } from '@/lib/prisma'
import { openaiService } from '@/lib/openai'

const createReviewSchema = z.object({
  businessId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  content: z.string().min(10).max(2000),
  photos: z.array(z.string()).optional(),
  visitDate: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
  categories: z.object({
    food: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    atmosphere: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
    cleanliness: z.number().min(1).max(5).optional()
  }).optional()
})

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(10).max(2000).optional(),
  photos: z.array(z.string()).optional(),
  visitDate: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
  categories: z.object({
    food: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    atmosphere: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
    cleanliness: z.number().min(1).max(5).optional()
  }).optional()
})

const querySchema = z.object({
  businessId: z.string().optional(),
  userId: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful']).default('newest'),
  minRating: z.number().min(1).max(5).optional(),
  withAiAnalysis: z.boolean().default(false)
})

// GET /api/reviews - Get reviews with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const queryData = {
      businessId: searchParams.get('businessId') || undefined,
      userId: searchParams.get('userId') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: searchParams.get('sortBy') as any || 'newest',
      minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined,
      withAiAnalysis: searchParams.get('withAiAnalysis') === 'true'
    }

    const validatedQuery = querySchema.parse(queryData)

    // Build where clause
    const where: any = {}
    
    if (validatedQuery.businessId) {
      where.businessId = validatedQuery.businessId
    }
    
    if (validatedQuery.userId) {
      where.userId = validatedQuery.userId
    }
    
    if (validatedQuery.minRating) {
      where.rating = { gte: validatedQuery.minRating }
    }

    // Build order by clause
    let orderBy: any
    switch (validatedQuery.sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'rating_high':
        orderBy = { rating: 'desc' }
        break
      case 'rating_low':
        orderBy = { rating: 'asc' }
        break
      case 'helpful':
        orderBy = { helpfulVotes: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      skip: validatedQuery.offset,
      take: validatedQuery.limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            level: true,
            totalReviews: true,
            experiencePoints: true
          }
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            subcategory: true,
            city: true,
            district: true
          }
        },
        _count: {
          select: {
            helpfulVotes: true,
            reportedBy: true
          }
        }
      }
    })

    // Get total count
    const total = await prisma.review.count({ where })

    // Add AI analysis if requested
    let reviewsWithAnalysis = reviews
    if (validatedQuery.withAiAnalysis) {
      reviewsWithAnalysis = await Promise.all(
        reviews.map(async (review: any) => {
          if (review.aiAnalysis && review.aiAnalysisDate) {
            return review
          }
          
          // Generate AI analysis for reviews that don't have it
          try {
            const aiAnalysis = await analyzeReviewWithAI(review.content, review.rating)
            
            // Update review with AI analysis
            await prisma.review.update({
              where: { id: review.id },
              data: {
                aiAnalysis,
                aiAnalysisDate: new Date()
              }
            })
            
            return { ...review, aiAnalysis }
          } catch (error) {
            console.error('Error generating AI analysis:', error)
            return review
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      data: reviewsWithAnalysis,
      meta: {
        total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < total,
        filters: {
          businessId: validatedQuery.businessId,
          userId: validatedQuery.userId,
          minRating: validatedQuery.minRating,
          sortBy: validatedQuery.sortBy
        }
      }
    })

  } catch (error) {
    console.error('Get reviews API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Yorumlar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulaması gerekli' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if user already reviewed this business
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        businessId: validatedData.businessId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Bu işletme için zaten yorum yapmışsınız' },
        { status: 400 }
      )
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: validatedData.businessId }
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // Generate AI analysis
    const aiAnalysis = await analyzeReviewWithAI(validatedData.content, validatedData.rating)

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        businessId: validatedData.businessId,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        photos: validatedData.photos || [],
        visitDate: validatedData.visitDate ? new Date(validatedData.visitDate) : null,
        wouldRecommend: validatedData.wouldRecommend,
        categoryRatings: validatedData.categories || {},
        aiAnalysis,
        aiAnalysisDate: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            level: true
          }
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Update user statistics
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalReviews: { increment: 1 },
        experiencePoints: { increment: 10 }
      }
    })

    // Update business statistics
    await updateBusinessStats(validatedData.businessId)

    // Trigger gamification action
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gamification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          businessId: validatedData.businessId
        })
      })
    } catch (error) {
      console.error('Error triggering gamification:', error)
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Yorum başarıyla eklendi'
    })

  } catch (error) {
    console.error('Create review API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Yorum eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Helper functions
async function analyzeReviewWithAI(content: string, rating: number) {
  try {
    // Use the OpenAI service to analyze the review
    const analysisResult = await openaiService.analyzeReview(content, '')
    
    return {
      sentiment: analysisResult.sentiment.toLowerCase(),
      confidence: analysisResult.confidence,
      keywords: analysisResult.tags,
      categories: {
        food: Math.round(analysisResult.categories.taste / 2), // Convert 0-10 to 0-5
        service: Math.round(analysisResult.categories.service / 2),
        atmosphere: Math.round(analysisResult.categories.atmosphere / 2),
        value: Math.round(analysisResult.categories.price / 2),
        cleanliness: Math.round(analysisResult.categories.cleanliness / 2)
      },
      emotions: rating >= 4 ? ['happy', 'satisfied'] : rating >= 3 ? ['neutral'] : ['disappointed'],
      summary: analysisResult.summary,
      helpfulScore: analysisResult.confidence
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return {
      sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative',
      confidence: 0.5,
      keywords: [],
      categories: {},
      emotions: [],
      summary: 'Analiz yapılamadı',
      helpfulScore: 0.5
    }
  }
}

async function updateBusinessStats(businessId: string) {
  try {
    // Calculate new average rating and total reviews
    const stats = await prisma.review.aggregate({
      where: { businessId },
      _avg: { rating: true },
      _count: { id: true }
    })

    await prisma.business.update({
      where: { id: businessId },
      data: {
        avgRating: stats._avg.rating || 0,
        totalReviews: stats._count.id
      }
    })
  } catch (error) {
    console.error('Error updating business stats:', error)
  }
}