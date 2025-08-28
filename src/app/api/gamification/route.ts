import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser, updateUserExperience, checkAndAwardAchievements } from '@/lib/clerk-utils'

const gamificationActionSchema = z.object({
  action: z.enum(['review', 'photo', 'checkin', 'helpful_vote', 'follow', 'share', 'first_visit']),
  businessId: z.string().optional(),
  reviewId: z.string().optional(),
  points: z.number().min(1).max(100).optional()
})

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_REVIEW: {
    id: 'FIRST_REVIEW',
    name: 'İlk Yorum',
    description: 'İlk yorumunu yazdın!',
    icon: '🎉',
    points: 50,
    type: 'milestone',
    requirement: { reviews: 1 }
  },
  REVIEW_VETERAN: {
    id: 'REVIEW_VETERAN',
    name: 'Yorum Veteranı',
    description: '10 yorum yazdın',
    icon: '📝',
    points: 100,
    type: 'milestone',
    requirement: { reviews: 10 }
  },
  REVIEW_MASTER: {
    id: 'REVIEW_MASTER',
    name: 'Yorum Ustası',
    description: '50 yorum yazdın',
    icon: '🏆',
    points: 250,
    type: 'milestone',
    requirement: { reviews: 50 }
  },
  REVIEW_LEGEND: {
    id: 'REVIEW_LEGEND',
    name: 'Yorum Efsanesi',
    description: '100 yorum yazdın',
    icon: '👑',
    points: 500,
    type: 'milestone',
    requirement: { reviews: 100 }
  },
  PHOTO_ENTHUSIAST: {
    id: 'PHOTO_ENTHUSIAST',
    name: 'Fotoğraf Meraklısı',
    description: '10 fotoğraf paylaştın',
    icon: '📸',
    points: 75,
    type: 'activity',
    requirement: { photos: 10 }
  },
  EXPLORER: {
    id: 'EXPLORER',
    name: 'Kaşif',
    description: '25 farklı işletmeyi keşfettin',
    icon: '🗺️',
    points: 150,
    type: 'exploration',
    requirement: { businesses: 25 }
  },
  SOCIAL_BUTTERFLY: {
    id: 'SOCIAL_BUTTERFLY',
    name: 'Sosyal Kelebek',
    description: '50 kişiyi takip ettin',
    icon: '🦋',
    points: 100,
    type: 'social',
    requirement: { following: 50 }
  },
  HELPFUL_HERO: {
    id: 'HELPFUL_HERO',
    name: 'Faydalı Kahraman',
    description: '100 faydalı oy aldın',
    icon: '🦸',
    points: 200,
    type: 'community',
    requirement: { helpfulVotes: 100 }
  },
  STREAK_WARRIOR: {
    id: 'STREAK_WARRIOR',
    name: 'Seri Savaşçısı',
    description: '30 gün üst üste aktif oldun',
    icon: '🔥',
    points: 300,
    type: 'engagement',
    requirement: { streak: 30 }
  },
  LOCAL_HERO: {
    id: 'LOCAL_HERO',
    name: 'Yerel Kahraman',
    description: 'Şehrinin uzmanı oldun',
    icon: '🏅',
    points: 1000,
    type: 'prestige',
    requirement: { reviews: 200, helpfulVotes: 500, experiencePoints: 5000 }
  }
}

// Point values for different actions
const ACTION_POINTS = {
  review: 10,
  photo: 5,
  checkin: 3,
  helpful_vote: 2,
  follow: 1,
  share: 2,
  first_visit: 5
}

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
    const { action, businessId, reviewId, points } = gamificationActionSchema.parse(body)

    // Calculate points for the action
    const actionPoints = points || ACTION_POINTS[action] || 0
    const levelMultiplier = getLevelMultiplier(user.level)
    const finalPoints = Math.round(actionPoints * levelMultiplier)

    // Update user experience
    await updateUserExperience(user.id, finalPoints)

    // Get updated user data
    const updatedUser = await getCurrentUser()
    if (!updatedUser) throw new Error('Failed to get updated user')

    // Check for new achievements
    const newAchievements = await checkForNewAchievements(updatedUser)

    // Calculate next level progress
    const levelProgress = calculateLevelProgress(updatedUser)

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: finalPoints,
        totalPoints: updatedUser.experiencePoints,
        level: updatedUser.level,
        levelProgress,
        newAchievements,
        nextLevelRequirement: levelProgress.nextLevelPoints
      },
      message: newAchievements.length > 0 
        ? `Tebrikler! ${newAchievements.length} yeni rozet kazandınız!`
        : `${finalPoints} puan kazandınız!`
    })

  } catch (error) {
    console.error('Gamification API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Gamification işlemi sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

// Get user achievements
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulaması gerekli' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'earned', 'available', 'all'

    // Get user's earned achievements
    const earnedAchievements = user.achievements || []
    
    // Get available achievements
    const availableAchievements = Object.values(ACHIEVEMENTS).filter(achievement => 
      !earnedAchievements.some((earned: any) => earned.achievement === achievement.id)
    )

    // Calculate progress for available achievements
    const availableWithProgress = availableAchievements.map(achievement => ({
      ...achievement,
      progress: calculateAchievementProgress(achievement, user),
      isUnlocked: checkAchievementRequirement(achievement, user)
    }))

    let responseData
    switch (type) {
      case 'earned':
        responseData = earnedAchievements.map((earned: any) => ({
          ...ACHIEVEMENTS[earned.achievement as keyof typeof ACHIEVEMENTS],
          earnedAt: earned.earnedAt
        }))
        break
      case 'available':
        responseData = availableWithProgress
        break
      default:
        responseData = {
          earned: earnedAchievements.map((earned: any) => ({
            ...ACHIEVEMENTS[earned.achievement as keyof typeof ACHIEVEMENTS],
            earnedAt: earned.earnedAt
          })),
          available: availableWithProgress
        }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        totalEarned: earnedAchievements.length,
        totalAvailable: availableAchievements.length,
        completionRate: Math.round((earnedAchievements.length / Object.keys(ACHIEVEMENTS).length) * 100)
      }
    })

  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { success: false, error: 'Rozetler yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

function getLevelMultiplier(level: string): number {
  const multipliers = {
    BEGINNER: 1.0,
    CONTRIBUTOR: 1.2,
    REVIEWER: 1.5,
    EXPERT: 1.8,
    GURU: 2.0,
    LOCAL_HERO: 2.5
  }
  return multipliers[level as keyof typeof multipliers] || 1.0
}

function calculateLevelProgress(user: any) {
  const levelRequirements = {
    BEGINNER: { min: 0, max: 100 },
    CONTRIBUTOR: { min: 100, max: 500 },
    REVIEWER: { min: 500, max: 2000 },
    EXPERT: { min: 2000, max: 5000 },
    GURU: { min: 5000, max: 10000 },
    LOCAL_HERO: { min: 10000, max: null }
  }

  const currentLevel = levelRequirements[user.level as keyof typeof levelRequirements]
  if (!currentLevel) return { progress: 100, nextLevelPoints: null }

  if (currentLevel.max === null) {
    return { progress: 100, nextLevelPoints: null }
  }

  const progress = ((user.experiencePoints - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100
  return {
    progress: Math.min(Math.max(progress, 0), 100),
    nextLevelPoints: currentLevel.max
  }
}

async function checkForNewAchievements(user: any): Promise<any[]> {
  const newAchievements: any[] = []
  
  for (const achievement of Object.values(ACHIEVEMENTS)) {
    // Check if user already has this achievement
    const hasAchievement = user.achievements?.some(
      (earned: any) => earned.achievement === achievement.id
    )
    
    if (!hasAchievement && checkAchievementRequirement(achievement, user)) {
      newAchievements.push(achievement)
      
      // Award the achievement (in real app, this would update the database)
      console.log(`User ${user.id} earned achievement: ${achievement.id}`)
    }
  }
  
  return newAchievements
}

function checkAchievementRequirement(achievement: any, user: any): boolean {
  const req = achievement.requirement
  
  // Check each requirement
  if (req.reviews && user.totalReviews < req.reviews) return false
  if (req.photos && (user.totalPhotos || 0) < req.photos) return false
  if (req.businesses && (user.visitedBusinesses || 0) < req.businesses) return false
  if (req.following && (user.followingCount || 0) < req.following) return false
  if (req.helpfulVotes && user.helpfulVotes < req.helpfulVotes) return false
  if (req.streak && (user.streakDays || 0) < req.streak) return false
  if (req.experiencePoints && user.experiencePoints < req.experiencePoints) return false
  
  return true
}

function calculateAchievementProgress(achievement: any, user: any): number {
  const req = achievement.requirement
  let progress = 0
  let total = 0
  
  if (req.reviews) {
    progress += Math.min(user.totalReviews, req.reviews)
    total += req.reviews
  }
  if (req.photos) {
    progress += Math.min(user.totalPhotos || 0, req.photos)
    total += req.photos
  }
  if (req.businesses) {
    progress += Math.min(user.visitedBusinesses || 0, req.businesses)
    total += req.businesses
  }
  if (req.helpfulVotes) {
    progress += Math.min(user.helpfulVotes, req.helpfulVotes)
    total += req.helpfulVotes
  }
  
  return total > 0 ? Math.round((progress / total) * 100) : 0
}