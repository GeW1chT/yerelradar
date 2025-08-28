import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk-utils'
import { prisma } from '@/lib/prisma'

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

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/reviews/[id] - Get specific review
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const reviewId = params.id

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
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
        helpfulVotes: {
          select: {
            userId: true,
            isHelpful: true
          }
        },
        reportedBy: {
          select: {
            userId: true,
            reason: true,
            createdAt: true
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

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Yorum bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: review
    })

  } catch (error) {
    console.error('Get review API error:', error)
    return NextResponse.json(
      { success: false, error: 'Yorum alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - Update review
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulaması gerekli' },
        { status: 401 }
      )
    }

    const params = await context.params
    const reviewId = params.id

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: true }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Yorum bulunamadı' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bu yorumu düzenleme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Check if review is too old to edit (7 days)
    const reviewAge = Date.now() - existingReview.createdAt.getTime()
    const maxEditAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    
    if (reviewAge > maxEditAge) {
      return NextResponse.json(
        { success: false, error: 'Yorum düzenleme süresi geçmiş (7 gün)' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateReviewSchema.parse(body)

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (validatedData.rating !== undefined) updateData.rating = validatedData.rating
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.content !== undefined) updateData.content = validatedData.content
    if (validatedData.photos !== undefined) updateData.photos = validatedData.photos
    if (validatedData.visitDate !== undefined) {
      updateData.visitDate = validatedData.visitDate ? new Date(validatedData.visitDate) : null
    }
    if (validatedData.wouldRecommend !== undefined) updateData.wouldRecommend = validatedData.wouldRecommend
    if (validatedData.categories !== undefined) updateData.categoryRatings = validatedData.categories

    // Re-analyze with AI if content or rating changed
    if (validatedData.content !== undefined || validatedData.rating !== undefined) {
      try {
        const newContent = validatedData.content || existingReview.content
        const newRating = validatedData.rating || existingReview.rating
        
        const aiAnalysis = await analyzeReviewWithAI(newContent, newRating)
        updateData.aiAnalysis = aiAnalysis
        updateData.aiAnalysisDate = new Date()
      } catch (error) {
        console.error('AI re-analysis error:', error)
      }
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
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

    // Update business statistics if rating changed
    if (validatedData.rating !== undefined) {
      await updateBusinessStats(existingReview.businessId)
    }

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Yorum başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Update review API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Yorum güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulaması gerekli' },
        { status: 401 }
      )
    }

    const params = await context.params
    const reviewId = params.id

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: true }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Yorum bulunamadı' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bu yorumu silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Delete review (this will cascade delete related records)
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Update user statistics
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalReviews: { decrement: 1 },
        experiencePoints: { decrement: 10 }
      }
    })

    // Update business statistics
    await updateBusinessStats(existingReview.businessId)

    return NextResponse.json({
      success: true,
      message: 'Yorum başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete review API error:', error)
    return NextResponse.json(
      { success: false, error: 'Yorum silinirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Helper functions
async function analyzeReviewWithAI(content: string, rating: number) {
  // Placeholder AI analysis - replace with actual AI service call
  return {
    sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative',
    confidence: 0.8,
    keywords: content.split(' ').slice(0, 5),
    categories: {
      food: rating,
      service: rating,
      atmosphere: rating,
      value: rating,
      cleanliness: rating
    },
    emotions: rating >= 4 ? ['happy', 'satisfied'] : rating >= 3 ? ['neutral'] : ['disappointed'],
    summary: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
    helpfulScore: Math.random()
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