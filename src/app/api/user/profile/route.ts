import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulaması gerekli' },
        { status: 401 }
      )
    }

    // Check if user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatar: user.imageUrl || '',
          level: 'BEGINNER',
          experiencePoints: 0,
          totalReviews: 0,
          helpfulVotes: 0,
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: dbUser
    })

  } catch (error) {
    console.error('User profile API error:', error)
    return NextResponse.json(
      { success: false, error: 'Kullanıcı profili yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulaması gerekli' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bio, location, website, socialLinks } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        bio,
        location,
        website,
        ...(socialLinks && { socialLinks })
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profil başarıyla güncellendi'
    })

  } catch (error) {
    console.error('User profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}