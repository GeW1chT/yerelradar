import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Database seeding başlıyor...')

  // Demo şehirler
  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa']
  
  // Demo işletmeler
  const businesses = [
    {
      name: 'Köşe Pizza',
      slug: 'kose-pizza-besiktas',
      description: '25 yıldır aynı lezzet ile hizmet veren aile işletmesi. Özel hamur ve doğal malzemelerle hazırlanan pizzalarımızla damak zevkinizi şaşırtıyoruz.',
      category: 'Restoran',
      subcategory: 'Pizza',
      city: 'İstanbul',
      district: 'Beşiktaş',
      neighborhood: 'Levent',
      address: 'Barbaros Bulvarı No:45 Beşiktaş/İstanbul',
      lat: 41.0431,
      lng: 29.0099,
      phone: '+90 212 234 12 34',
      website: 'https://kosepizza.com',
      email: 'info@kosepizza.com',
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
      aiSummary: 'Müşteriler lezzetini ve hızlı servisini övüyor. Özellikle sucuklu pizza ve acılı pizza çok beğenilen ürünler.',
      priceRange: 'MODERATE',
      covidSafety: 8.5
    },
    {
      name: 'Starbucks Zorlu Center',
      slug: 'starbucks-zorlu-besiktas',
      description: 'Dünyaca ünlü kahve zincirinin Zorlu Center şubesi. Premium kahve deneyimi ve çalışma dostu ortam.',
      category: 'Kafe',
      subcategory: 'Kahve',
      city: 'İstanbul',
      district: 'Beşiktaş',
      neighborhood: 'Zorlu Center',
      address: 'Zorlu Center AVM, Levazım Mahallesi',
      lat: 41.0431,
      lng: 29.0099,
      phone: '+90 212 234 12 35',
      website: 'https://starbucks.com.tr',
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
      aiSummary: 'Kaliteli kahve ve çalışma ortamı sunuyor. Fiyatlar yüksek ancak kalite tatmin edici.',
      priceRange: 'EXPENSIVE',
      covidSafety: 8.0
    },
    {
      name: 'Berber Ali',
      slug: 'berber-ali-besiktas',
      description: 'Geleneksel berberlik sanatını modern tekniklerle birleştiren deneyimli ustalar. 20 yıllık tecrübe.',
      category: 'Güzellik & Bakım',
      subcategory: 'Erkek Berber',
      city: 'İstanbul',
      district: 'Beşiktaş',
      neighborhood: 'Çarşı',
      address: 'Beşiktaş Çarşı, Yıldız Caddesi No:12',
      lat: 41.0431,
      lng: 29.0099,
      phone: '+90 212 234 12 36',
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
      aiSummary: 'Usta ellerde kaliteli berberlik hizmeti. Müşteriler hijyen ve ilgiyi çok övüyor.',
      priceRange: 'BUDGET',
      covidSafety: 9.0
    },
    {
      name: 'Cafe Nero Ankara',
      slug: 'cafe-nero-kizilay-ankara',
      description: 'İtalyan tarzı kahve kültürü ve özel blend kahveler. Ankara\'nın kalbinde keyifli bir mola.',
      category: 'Kafe',
      subcategory: 'Kahve',
      city: 'Ankara',
      district: 'Çankaya',
      neighborhood: 'Kızılay',
      address: 'Kızılay Meydanı No:8 Çankaya/Ankara',
      lat: 39.9208,
      lng: 32.8541,
      phone: '+90 312 456 78 90',
      website: 'https://caffenero.com.tr',
      verified: true,
      isPremium: true,
      avgRating: 4.1,
      totalReviews: 156,
      totalCheckIns: 89,
      healthScore: 8.0,
      hygieneScore: 8.2,
      serviceScore: 7.8,
      valueScore: 7.5,
      trendScore: 8.1,
      aiSummary: 'Kaliteli kahve ve merkezi konum. Öğrenciler ve çalışanlar tarafından tercih ediliyor.',
      priceRange: 'MODERATE',
      covidSafety: 8.3
    },
    {
      name: 'Deniz Restaurant',
      slug: 'deniz-restaurant-konak-izmir',
      description: 'Ege\'nin en taze deniz ürünleri ve geleneksel İzmir lezzetleri. Kordon manzaralı keyifli yemek deneyimi.',
      category: 'Restoran',
      subcategory: 'Deniz Ürünleri',
      city: 'İzmir',
      district: 'Konak',
      neighborhood: 'Kordon',
      address: 'Kordon Boyu, Atatürk Caddesi No:156',
      lat: 38.4192,
      lng: 27.1287,
      phone: '+90 232 123 45 67',
      verified: true,
      isPremium: false,
      avgRating: 4.5,
      totalReviews: 203,
      totalCheckIns: 78,
      healthScore: 8.8,
      hygieneScore: 9.1,
      serviceScore: 8.7,
      valueScore: 8.2,
      trendScore: 9.0,
      aiSummary: 'Taze balık ve meze çeşitleri mükemmel. Manzara ve hizmet kalitesi övülüyor.',
      priceRange: 'EXPENSIVE',
      covidSafety: 8.7
    }
  ]

  // İşletmeleri oluştur
  const createdBusinesses = []
  for (const business of businesses) {
    const created = await prisma.business.create({
      data: business
    })
    createdBusinesses.push(created)
    console.log(`✅ ${business.name} işletmesi oluşturuldu`)
  }

  // Demo çalışma saatleri ekle
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  
  for (const business of createdBusinesses) {
    for (const day of days) {
      await prisma.workingHours.create({
        data: {
          businessId: business.id,
          day: day as any,
          openTime: business.category === 'Kafe' ? '07:00' : '11:00',
          closeTime: business.category === 'Kafe' ? '22:00' : '23:00',
          isClosed: day === 'SUNDAY' && business.category === 'Güzellik & Bakım'
        }
      })
    }
  }
  console.log('✅ Çalışma saatleri eklendi')

  // Demo amenities ekle
  const amenities = ['WIFI', 'PARKING', 'OUTDOOR_SEATING', 'ACCEPTS_CARDS', 'DELIVERY']
  for (const business of createdBusinesses) {
    // Her işletmeye 2-3 amenity ekle
    const businessAmenities = amenities.slice(0, Math.floor(Math.random() * 3) + 2)
    for (const amenity of businessAmenities) {
      await prisma.businessAmenity.create({
        data: {
          businessId: business.id,
          amenity: amenity as any
        }
      })
    }
  }
  console.log('✅ Amenities eklendi')

  // Demo fotoğraflar ekle
  const businessImages = [
    { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', caption: 'İç mekan' },
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop', caption: 'Dış görünüm' },
    { url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop', caption: 'Yemek' }
  ]

  for (const business of createdBusinesses.slice(0, 3)) {
    for (const [index, image] of businessImages.entries()) {
      await prisma.businessImage.create({
        data: {
          businessId: business.id,
          url: image.url,
          caption: image.caption,
          order: index,
          aiTags: JSON.stringify(['interior', 'restaurant', 'food'])
        }
      })
    }
  }
  console.log('✅ İşletme fotoğrafları eklendi')

  console.log('🎉 Database seeding tamamlandı!')
  console.log(`📊 Toplam ${businesses.length} işletme oluşturuldu`)
  console.log(`🏢 Şehirler: ${cities.join(', ')}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })