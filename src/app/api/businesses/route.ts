import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk-utils'
import { prisma } from '@/lib/prisma'

const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  neighborhood: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  priceRange: z.enum(['BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY']),
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

const querySchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  district: z.string().optional(),
  search: z.string().optional(),
  verified: z.boolean().optional(),
  premium: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  priceRange: z.array(z.enum(['BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY'])).optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['name', 'rating', 'reviews', 'distance', 'trending']).default('rating')
})

// Mock businesses for development
const mockBusinesses = [
  {
    id: '1',
    name: 'Köşe Pizza',
    slug: 'kose-pizza-besiktas',
    description: '25 yıldır aynı lezzet...',
    category: 'Restoran',
    subcategory: 'Pizza',
    city: 'İstanbul',
    district: 'Beşiktaş',
    neighborhood: 'Levent',
    address: 'Barbaros Bulvarı No:45',
    lat: 41.0431,
    lng: 29.0099,
    phone: '02122341234',
    website: 'kosepizza.com',
    verified: true,
    isPremium: false,
    avgRating: 4.2,
    totalReviews: 128,
    totalCheckIns: 45,
    healthScore: 8.5,
    hygieneScore: 9.0,
    serviceScore: 8.2,
    valueScore: 7.8,
    trendScore: 8.8,
    aiSummary: 'Müşteriler lezzetini ve hızlı servisini övüyor...',
    priceRange: 'MODERATE',
    covidSafety: 8.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      { id: '1', url: '/business/pizza-1.jpg', caption: 'İmza pizza', aiTags: ['pizza', 'cheese'] }
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
    phone: '02122341235',
    website: 'starbucks.com.tr',
    verified: true,
    isPremium: true,
    avgRating: 4.0,
    totalReviews: 89,
    totalCheckIns: 156,
    healthScore: 7.8,
    hygieneScore: 8.5,
    serviceScore: 7.5,
    valueScore: 6.8,
    trendScore: 7.2,
    aiSummary: 'Kaliteli kahve ve çalışma ortamı sunuyor...',
    priceRange: 'EXPENSIVE',
    covidSafety: 8.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      { id: '2', url: '/business/starbucks-1.jpg', caption: 'Modern kafe', aiTags: ['coffee', 'modern'] }
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
    phone: '02122341236',
    verified: true,
    isPremium: false,
    avgRating: 4.7,
    totalReviews: 67,
    totalCheckIns: 234,
    healthScore: 9.2,
    hygieneScore: 9.5,
    serviceScore: 9.0,
    valueScore: 8.5,
    trendScore: 8.9,
    aiSummary: 'Usta ellerde kaliteli berberlik hizmeti...',
    priceRange: 'BUDGET',
    covidSafety: 9.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      { id: '3', url: '/business/berber-1.jpg', caption: 'Geleneksel berber', aiTags: ['barber', 'traditional'] }
    ]
  }
]

// GET /api/businesses - Get businesses with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const queryData = {
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      district: searchParams.get('district') || undefined,
      search: searchParams.get('search') || undefined,
      verified: searchParams.get('verified') === 'true',
      premium: searchParams.get('premium') === 'true',
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      priceRange: searchParams.get('priceRange')?.split(',') as any,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: searchParams.get('sortBy') as any || 'rating'
    }

    const validatedQuery = querySchema.parse(queryData)

    // For now, use mock data. Replace with Prisma when database is ready
    let filteredBusinesses = mockBusinesses.filter(business => {
      // City filter
      if (validatedQuery.city && business.city.toLowerCase() !== validatedQuery.city.toLowerCase()) {
        return false
      }
      
      // Category filter
      if (validatedQuery.category && business.category.toLowerCase() !== validatedQuery.category.toLowerCase()) {
        return false
      }
      
      // District filter
      if (validatedQuery.district && business.district.toLowerCase() !== validatedQuery.district.toLowerCase()) {
        return false
      }
      
      // Search filter
      if (validatedQuery.search) {
        const searchTerm = validatedQuery.search.toLowerCase()
        const searchableText = `${business.name} ${business.description} ${business.category}`.toLowerCase()
        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }
      
      // Rating filter
      if (validatedQuery.minRating && business.avgRating < validatedQuery.minRating) {
        return false
      }
      
      // Price range filter
      if (validatedQuery.priceRange && validatedQuery.priceRange.length > 0 && !validatedQuery.priceRange.includes(business.priceRange as any)) {
        return false
      }
      
      // Verified filter
      if (validatedQuery.verified && !business.verified) {
        return false
      }
      
      // Premium filter
      if (validatedQuery.premium && !business.isPremium) {
        return false
      }
      
      return true
    })

    // Sort businesses
    filteredBusinesses.sort((a, b) => {
      switch (validatedQuery.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr')
        case 'rating':
          return b.avgRating - a.avgRating
        case 'reviews':
          return b.totalReviews - a.totalReviews
        case 'trending':
          return b.trendScore - a.trendScore
        default:
          return b.avgRating - a.avgRating
      }
    })

    // Pagination
    const paginatedBusinesses = filteredBusinesses.slice(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit)

    return NextResponse.json({
      success: true,
      data: paginatedBusinesses,
      meta: {
        total: filteredBusinesses.length,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < filteredBusinesses.length,
        filters: {
          city: validatedQuery.city,
          category: validatedQuery.category,
          district: validatedQuery.district,
          search: validatedQuery.search,
          verified: validatedQuery.verified,
          premium: validatedQuery.premium,
          minRating: validatedQuery.minRating,
          priceRange: validatedQuery.priceRange
        }
      }
    })

  } catch (error) {
    console.error('Get businesses API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'İşletmeler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST /api/businesses - Create new business
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
    const validatedData = createBusinessSchema.parse(body)

    // Generate slug from name
    const slug = generateSlug(validatedData.name, validatedData.city)

    // For development, add to mock data. Replace with Prisma when database is ready
    const newBusiness = {
      id: Date.now().toString(),
      name: validatedData.name,
      slug,
      description: validatedData.description,
      category: validatedData.category,
      subcategory: validatedData.subcategory,
      city: validatedData.city,
      district: validatedData.district,
      neighborhood: validatedData.neighborhood || '',
      address: validatedData.address,
      lat: validatedData.lat,
      lng: validatedData.lng,
      phone: validatedData.phone || '',
      website: validatedData.website || '',
      verified: false, // Will be verified by admin
      isPremium: false,
      avgRating: 0,
      totalReviews: 0,
      totalCheckIns: 0,
      healthScore: 0,
      hygieneScore: 0,
      serviceScore: 0,
      valueScore: 0,
      trendScore: 0,
      aiSummary: 'Yeni eklenen işletme...',
      priceRange: validatedData.priceRange,
      covidSafety: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: []
    }

    // TODO: Replace with actual database operation
    // const business = await prisma.business.create({
    //   data: {
    //     name: validatedData.name,
    //     slug,
    //     description: validatedData.description,
    //     category: validatedData.category,
    //     subcategory: validatedData.subcategory,
    //     address: validatedData.address,
    //     city: validatedData.city,
    //     district: validatedData.district,
    //     neighborhood: validatedData.neighborhood,
    //     lat: validatedData.lat,
    //     lng: validatedData.lng,
    //     phone: validatedData.phone,
    //     website: validatedData.website,
    //     email: validatedData.email,
    //     ownerId: user.id,
    //     verified: false,
    //     isPremium: false,
    //     avgRating: 0,
    //     totalReviews: 0,
    //     priceRange: validatedData.priceRange,
    //     amenities: validatedData.amenities || [],
    //     workingHours: validatedData.workingHours || {},
    //     photos: validatedData.photos || []
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: newBusiness,
      message: 'İşletme başarıyla eklendi. Doğrulama için incelenecek.'
    })

  } catch (error) {
    console.error('Create business API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'İşletme eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Helper function to generate slug
function generateSlug(name: string, city: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  }
  
  const slug = (name + '-' + city)
    .toLowerCase()
    .replace(/[çğıöşü]/g, (char) => turkishMap[char] || char)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  return slug
}