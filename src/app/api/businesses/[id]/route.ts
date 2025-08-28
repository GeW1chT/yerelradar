import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk-utils'
import { prisma } from '@/lib/prisma'

const updateBusinessSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  priceRange: z.enum(['BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY']).optional(),
  amenities: z.array(z.string()).optional(),
  workingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }),
    tuesday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }),
    wednesday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }),
    thursday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }),
    friday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }),
    saturday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }),
    sunday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() })
  }).optional(),
  photos: z.array(z.string()).optional()
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// Mock business data for development
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
    website: 'https://kosepizza.com',
    email: 'info@kosepizza.com',
    ownerId: 'owner1',
    verified: true,
    isPremium: false,
    avgRating: 4.2,
    totalReviews: 128,
    priceRange: 'MODERATE',
    amenities: ['WIFI', 'PARKING', 'DELIVERY'],
    workingHours: {
      monday: { open: '11:00', close: '23:00', isClosed: false },
      tuesday: { open: '11:00', close: '23:00', isClosed: false },
      wednesday: { open: '11:00', close: '23:00', isClosed: false },
      thursday: { open: '11:00', close: '23:00', isClosed: false },
      friday: { open: '11:00', close: '24:00', isClosed: false },
      saturday: { open: '11:00', close: '24:00', isClosed: false },
      sunday: { open: '12:00', close: '23:00', isClosed: false }
    },
    photos: ['/business/pizza-1.jpg', '/business/pizza-2.jpg']
  }
]

// GET /api/businesses/[id] - Get specific business
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const businessId = params.id

    // For development, use mock data. Replace with Prisma when database is ready
    const business = mockBusinesses.find(b => b.id === businessId)

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // TODO: Replace with actual database query
    // const business = await prisma.business.findUnique({
    //   where: { id: businessId },
    //   include: {
    //     owner: {
    //       select: {
    //         id: true,
    //         firstName: true,
    //         lastName: true
    //       }
    //     },
    //     reviews: {
    //       take: 5,
    //       orderBy: { createdAt: 'desc' },
    //       include: {
    //         user: {
    //           select: {
    //             id: true,
    //             firstName: true,
    //             lastName: true,
    //             avatar: true,
    //             level: true
    //           }
    //         }
    //       }
    //     },
    //     _count: {
    //       select: {
    //         reviews: true,
    //         savedBy: true
    //       }
    //     }
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: business
    })

  } catch (error) {
    console.error('Get business API error:', error)
    return NextResponse.json(
      { success: false, error: 'İşletme bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT /api/businesses/[id] - Update business
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
    const businessId = params.id

    // Check if business exists and user is the owner
    const existingBusiness = mockBusinesses.find(b => b.id === businessId)

    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    if (existingBusiness.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bu işletmeyi düzenleme yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateBusinessSchema.parse(body)

    // TODO: Replace with actual database update
    // const updatedBusiness = await prisma.business.update({
    //   where: { id: businessId },
    //   data: {
    //     ...validatedData,
    //     updatedAt: new Date()
    //   },
    //   include: {
    //     owner: {
    //       select: {
    //         id: true,
    //         firstName: true,
    //         lastName: true
    //       }
    //     }
    //   }
    // })

    // Mock update for development
    const updatedBusiness = {
      ...existingBusiness,
      ...validatedData,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: updatedBusiness,
      message: 'İşletme bilgileri başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Update business API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'İşletme güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE /api/businesses/[id] - Delete business
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
    const businessId = params.id

    // Check if business exists and user is the owner
    const existingBusiness = mockBusinesses.find(b => b.id === businessId)

    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    if (existingBusiness.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bu işletmeyi silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // TODO: Replace with actual database deletion
    // await prisma.business.delete({
    //   where: { id: businessId }
    // })

    // Note: In a real implementation, you might want to soft delete instead
    // await prisma.business.update({
    //   where: { id: businessId },
    //   data: { 
    //     deletedAt: new Date(),
    //     isActive: false 
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'İşletme başarıyla silindi'
    })

  } catch (error) {
    console.error('Delete business API error:', error)
    return NextResponse.json(
      { success: false, error: 'İşletme silinirken hata oluştu' },
      { status: 500 }
    )
  }
}