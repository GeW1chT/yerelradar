import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { User } from '@/types'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return null
    }

    // Check if user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        reviews: true,
        savedBusinesses: true,
        achievements: true,
        followedUsers: true,
        followers: true,
      }
    })

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          avatar: clerkUser.imageUrl || '',
          level: 'BEGINNER',
          experiencePoints: 0,
          totalReviews: 0,
          helpfulVotes: 0,
        },
        include: {
          reviews: true,
          savedBusinesses: true,
          achievements: true,
          followedUsers: true,
          followers: true,
        }
      })
    }

    return dbUser as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function updateUserExperience(userId: string, points: number): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return

    const newExperience = user.experiencePoints + points
    const newLevel = calculateUserLevel(newExperience, user.totalReviews, user.helpfulVotes)

    await prisma.user.update({
      where: { id: userId },
      data: {
        experiencePoints: newExperience,
        level: newLevel
      }
    })

    // Check for new achievements
    await checkAndAwardAchievements(userId, newExperience, user.totalReviews)
  } catch (error) {
    console.error('Error updating user experience:', error)
  }
}

export async function checkAndAwardAchievements(
  userId: string, 
  experiencePoints: number, 
  totalReviews: number
): Promise<void> {
  try {
    const achievements: string[] = []

    // Define achievement criteria
    if (totalReviews >= 1) achievements.push('FIRST_REVIEW')
    if (totalReviews >= 10) achievements.push('REVIEW_VETERAN')
    if (totalReviews >= 50) achievements.push('REVIEW_MASTER')
    if (totalReviews >= 100) achievements.push('REVIEW_LEGEND')
    if (experiencePoints >= 5000) achievements.push('LOCAL_HERO')

    // Award achievements that user doesn't have yet
    for (const achievement of achievements) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement
          }
        },
        update: {},
        create: {
          userId,
          achievementId: achievement,
          earnedAt: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

function calculateUserLevel(experiencePoints: number, totalReviews: number, helpfulVotes: number): 'BEGINNER' | 'CONTRIBUTOR' | 'REVIEWER' | 'EXPERT' | 'GURU' | 'LOCAL_HERO' {
  if (experiencePoints >= 10000 && totalReviews >= 500 && helpfulVotes >= 1000) return 'LOCAL_HERO'
  if (experiencePoints >= 5000 && totalReviews >= 200 && helpfulVotes >= 500) return 'GURU'
  if (experiencePoints >= 2000 && totalReviews >= 100 && helpfulVotes >= 200) return 'EXPERT'
  if (experiencePoints >= 500 && totalReviews >= 25 && helpfulVotes >= 50) return 'REVIEWER'
  if (experiencePoints >= 100 && totalReviews >= 5) return 'CONTRIBUTOR'
  return 'BEGINNER'
}

export async function isBusinessOwner(userId: string, businessId: string): Promise<boolean> {
  try {
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: userId
      }
    })
    return !!business
  } catch (error) {
    console.error('Error checking business ownership:', error)
    return false
  }
}

export async function getUserStats(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviews: {
          include: {
            business: true
          }
        },
        savedBusinesses: {
          include: {
            business: true
          }
        },
        achievements: true,
        _count: {
          select: {
            reviews: true,
            savedBusinesses: true,
            followedUsers: true,
            followers: true
          }
        }
      }
    })

    if (!user) return null

    return {
      ...user,
      stats: {
        reviewCount: user._count.reviews,
        savedBusinessCount: user._count.savedBusinesses,
        followingCount: user._count.followedUsers,
        followerCount: user._count.followers,
        averageRating: user.reviews.length > 0 
          ? user.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / user.reviews.length 
          : 0
      }
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return null
  }
}