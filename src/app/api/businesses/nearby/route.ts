import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const locationSearchSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().min(0.1).max(50).default(5), // radius in km
  category: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['distance', 'rating', 'reviews', 'name']).default('distance'),
  minRating: z.number().min(0).max(5).optional(),
  priceRange: z.array(z.enum(['BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY'])).optional(),
  verified: z.boolean().optional(),
  openNow: z.boolean().optional()
})

// Mock businesses with more detailed location data
const mockBusinesses = [
  {
    id: '1',
    name: 'Köşe Pizza',
    slug: 'kose-pizza-besiktas',
    category: 'Restoran',
    subcategory: 'Pizza',
    lat: 41.0431,
    lng: 29.0099,
    address: 'Barbaros Bulvarı No:45, Beşiktaş',
    city: 'İstanbul',
    district: 'Beşiktaş',
    avgRating: 4.2,
    totalReviews: 128,
    priceRange: 'MODERATE',
    verified: true,
    isPremium: false,
    phone: '+90 212 234 12 34',
    workingHours: {
      monday: { open: '11:00', close: '23:00', isClosed: false },
      tuesday: { open: '11:00', close: '23:00', isClosed: false },
      wednesday: { open: '11:00', close: '23:00', isClosed: false },
      thursday: { open: '11:00', close: '23:00', isClosed: false },
      friday: { open: '11:00', close: '24:00', isClosed: false },
      saturday: { open: '11:00', close: '24:00', isClosed: false },
      sunday: { open: '12:00', close: '23:00', isClosed: false }
    },
    amenities: ['WIFI', 'PARKING', 'DELIVERY', 'TAKEOUT', 'ACCEPTS_CARDS']
  },
  {
    id: '2',
    name: 'Starbucks Zorlu Center',
    slug: 'starbucks-zorlu-besiktas',
    category: 'Kafe',
    subcategory: 'Kahve',
    lat: 41.0420,
    lng: 29.0110,
    address: 'Zorlu Center AVM, Beşiktaş',
    city: 'İstanbul',
    district: 'Beşiktaş',
    avgRating: 4.0,
    totalReviews: 89,
    priceRange: 'EXPENSIVE',
    verified: true,
    isPremium: true,
    phone: '+90 212 234 12 35',
    workingHours: {
      monday: { open: '07:00', close: '22:00', isClosed: false },
      tuesday: { open: '07:00', close: '22:00', isClosed: false },
      wednesday: { open: '07:00', close: '22:00', isClosed: false },
      thursday: { open: '07:00', close: '22:00', isClosed: false },
      friday: { open: '07:00', close: '22:00', isClosed: false },
      saturday: { open: '08:00', close: '22:00', isClosed: false },
      sunday: { open: '08:00', close: '22:00', isClosed: false }
    },
    amenities: ['WIFI', 'ACCEPTS_CARDS', 'WHEELCHAIR_ACCESSIBLE']
  },
  {
    id: '3',
    name: 'Berber Ali',
    slug: 'berber-ali-besiktas',
    category: 'Berber',
    subcategory: 'Erkek Berber',
    lat: 41.0450,
    lng: 29.0080,
    address: 'Beşiktaş Çarşı, Beşiktaş',
    city: 'İstanbul',
    district: 'Beşiktaş',
    avgRating: 4.7,
    totalReviews: 67,
    priceRange: 'BUDGET',
    verified: true,
    isPremium: false,
    phone: '+90 212 234 12 36',
    workingHours: {
      monday: { open: '09:00', close: '19:00', isClosed: false },
      tuesday: { open: '09:00', close: '19:00', isClosed: false },
      wednesday: { open: '09:00', close: '19:00', isClosed: false },
      thursday: { open: '09:00', close: '19:00', isClosed: false },
      friday: { open: '09:00', close: '19:00', isClosed: false },
      saturday: { open: '09:00', close: '18:00', isClosed: false },
      sunday: { open: '', close: '', isClosed: true }
    },
    amenities: ['ACCEPTS_CARDS']
  },
  {
    id: '4',
    name: 'Sushico Nişantaşı',
    slug: 'sushico-nisantasi',
    category: 'Restoran',
    subcategory: 'Japon',
    lat: 41.0500,
    lng: 28.9950,
    address: 'Teşvikiye Cad., Şişli',
    city: 'İstanbul',
    district: 'Şişli',
    avgRating: 4.5,
    totalReviews: 201,
    priceRange: 'EXPENSIVE',
    verified: true,
    isPremium: true,
    phone: '+90 212 234 12 37',
    workingHours: {
      monday: { open: '12:00', close: '23:00', isClosed: false },
      tuesday: { open: '12:00', close: '23:00', isClosed: false },
      wednesday: { open: '12:00', close: '23:00', isClosed: false },
      thursday: { open: '12:00', close: '23:00', isClosed: false },
      friday: { open: '12:00', close: '24:00', isClosed: false },
      saturday: { open: '12:00', close: '24:00', isClosed: false },
      sunday: { open: '12:00', close: '23:00', isClosed: false }
    },
    amenities: ['WIFI', 'PARKING', 'ACCEPTS_CARDS', 'RESERVATIONS']
  },
  {
    id: '5',
    name: 'Kahve Dünyası Taksim',
    slug: 'kahve-dunyasi-taksim',
    category: 'Kafe',
    subcategory: 'Kahve',
    lat: 41.0370,
    lng: 28.9857,
    address: 'İstiklal Caddesi, Beyoğlu',
    city: 'İstanbul',
    district: 'Beyoğlu',
    avgRating: 4.1,
    totalReviews: 156,
    priceRange: 'MODERATE',
    verified: false,
    isPremium: false,
    phone: '+90 212 234 12 38',
    workingHours: {
      monday: { open: '08:00', close: '22:00', isClosed: false },
      tuesday: { open: '08:00', close: '22:00', isClosed: false },
      wednesday: { open: '08:00', close: '22:00', isClosed: false },
      thursday: { open: '08:00', close: '22:00', isClosed: false },
      friday: { open: '08:00', close: '23:00', isClosed: false },
      saturday: { open: '08:00', close: '23:00', isClosed: false },
      sunday: { open: '09:00', close: '22:00', isClosed: false }
    },
    amenities: ['WIFI', 'TAKEOUT', 'ACCEPTS_CARDS']
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const queryData = {
      lat: parseFloat(searchParams.get('lat') || '0'),
      lng: parseFloat(searchParams.get('lng') || '0'),
      radius: parseFloat(searchParams.get('radius') || '5'),
      category: searchParams.get('category') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') as any || 'distance',
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      priceRange: searchParams.get('priceRange')?.split(',') as any,
      verified: searchParams.get('verified') === 'true',
      openNow: searchParams.get('openNow') === 'true'
    }

    const validatedQuery = locationSearchSchema.parse(queryData)

    // Filter businesses by location and criteria
    let filteredBusinesses = mockBusinesses.filter(business => {
      // Calculate distance
      const distance = calculateDistance(
        validatedQuery.lat,
        validatedQuery.lng,
        business.lat,
        business.lng
      )

      // Check if within radius
      if (distance > validatedQuery.radius) return false

      // Category filter
      if (validatedQuery.category && business.category.toLowerCase() !== validatedQuery.category.toLowerCase()) {
        return false
      }

      // Rating filter
      if (validatedQuery.minRating && business.avgRating < validatedQuery.minRating) {
        return false
      }

      // Price range filter
      if (validatedQuery.priceRange && validatedQuery.priceRange.length > 0 && 
          !validatedQuery.priceRange.includes(business.priceRange as 'BUDGET' | 'MODERATE' | 'EXPENSIVE' | 'LUXURY')) {
        return false
      }

      // Verified filter
      if (validatedQuery.verified && !business.verified) {
        return false
      }

      // Open now filter
      if (validatedQuery.openNow && !isBusinessOpen(business.workingHours)) {
        return false
      }

      return true
    })

    // Add distance to each business and sort
    const businessesWithDistance = filteredBusinesses.map(business => ({
      ...business,
      distance: calculateDistance(
        validatedQuery.lat,
        validatedQuery.lng,
        business.lat,
        business.lng
      )
    }))

    // Sort businesses
    businessesWithDistance.sort((a, b) => {
      switch (validatedQuery.sortBy) {
        case 'distance':
          return a.distance - b.distance
        case 'rating':
          return b.avgRating - a.avgRating
        case 'reviews':
          return b.totalReviews - a.totalReviews
        case 'name':
          return a.name.localeCompare(b.name, 'tr')
        default:
          return a.distance - b.distance
      }
    })

    // Limit results
    const results = businessesWithDistance.slice(0, validatedQuery.limit)

    // Calculate search center info
    const centerInfo = await getLocationInfo(validatedQuery.lat, validatedQuery.lng)

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        center: {
          lat: validatedQuery.lat,
          lng: validatedQuery.lng,
          ...centerInfo
        },
        radius: validatedQuery.radius,
        filters: {
          category: validatedQuery.category,
          minRating: validatedQuery.minRating,
          priceRange: validatedQuery.priceRange,
          verified: validatedQuery.verified,
          openNow: validatedQuery.openNow
        },
        sortBy: validatedQuery.sortBy
      }
    })

  } catch (error) {
    console.error('Location search API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz konum parametreleri', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Konum araması sırasında hata oluştu' },
      { status: 500 }
    )
  }
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

function isBusinessOpen(workingHours: any): boolean {
  const now = new Date()
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  
  const todayHours = workingHours[currentDay]
  
  if (!todayHours || todayHours.isClosed) return false
  if (!todayHours.open || !todayHours.close) return false
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close
}

async function getLocationInfo(lat: number, lng: number) {
  // Mock location info - in real app, this would use reverse geocoding
  const mockLocationInfo = {
    address: 'İstanbul, Türkiye',
    city: 'İstanbul',
    district: 'Beşiktaş',
    country: 'Türkiye'
  }
  
  // In a real implementation, you would use Google Maps Geocoding API:
  // const geocoder = new google.maps.Geocoder()
  // const response = await geocoder.geocode({ location: { lat, lng } })
  
  return mockLocationInfo
}