import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PriceRange, UserLevel, Sentiment } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price range display
export function formatPriceRange(priceRange: PriceRange): string {
  const ranges = {
    BUDGET: '₺',
    MODERATE: '₺₺',
    EXPENSIVE: '₺₺₺',
    LUXURY: '₺₺₺₺'
  }
  return ranges[priceRange]
}

// Format user level display
export function formatUserLevel(level: UserLevel): string {
  const levels = {
    BEGINNER: 'Yeni Üye',
    CONTRIBUTOR: 'Katkıda Bulunan',
    REVIEWER: 'Yorumcu',
    EXPERT: 'Uzman',
    GURU: 'Guru',
    LOCAL_HERO: 'Yerel Kahraman'
  }
  return levels[level]
}

// Format sentiment for display
export function formatSentiment(sentiment: Sentiment): { text: string; color: string; emoji: string } {
  const sentiments = {
    VERY_NEGATIVE: { text: 'Çok Olumsuz', color: 'text-red-600', emoji: '😡' },
    NEGATIVE: { text: 'Olumsuz', color: 'text-red-500', emoji: '😞' },
    NEUTRAL: { text: 'Nötr', color: 'text-gray-500', emoji: '😐' },
    POSITIVE: { text: 'Olumlu', color: 'text-green-500', emoji: '😊' },
    VERY_POSITIVE: { text: 'Çok Olumlu', color: 'text-green-600', emoji: '🤩' }
  }
  return sentiments[sentiment]
}

// Calculate distance between two coordinates
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

// Generate business slug
export function generateSlug(name: string, district: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  const cleanDistrict = district
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

  return `${cleanName}-${cleanDistrict}`
}

// Format rating display
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

// Generate star rating component props
export function generateStarRating(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  
  return { full, half, empty }
}

// Format review count
export function formatReviewCount(count: number): string {
  if (count === 0) return 'Henüz yorum yok'
  if (count === 1) return '1 yorum'
  return `${count} yorum`
}

// Format time ago
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} önce` : `${interval} ${unit} önce`
    }
  }
  
  return 'Az önce'
}

// Validate Turkish phone number
export function validatePhoneNumber(phone: string): boolean {
  const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{9}$/
  return turkishPhoneRegex.test(phone.replace(/\s/g, ''))
}

// Format Turkish phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('90')) {
    const number = cleaned.slice(2)
    return `+90 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8)}`
  }
  if (cleaned.startsWith('0')) {
    const number = cleaned.slice(1)
    return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8)}`
  }
  return phone
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Check if business is open now
export function isBusinessOpen(workingHours: any[]): boolean {
  const now = new Date()
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  
  const todayHours = workingHours.find(wh => wh.day === currentDay)
  
  if (!todayHours || todayHours.isClosed) return false
  if (!todayHours.openTime || !todayHours.closeTime) return false
  
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
}

// Calculate business health score
export function calculateHealthScore(
  hygieneScore: number,
  serviceScore: number,
  recentReviews: number,
  averageRating: number
): number {
  const weights = {
    hygiene: 0.4,
    service: 0.3,
    popularity: 0.2,
    rating: 0.1
  }
  
  const popularityScore = Math.min(recentReviews / 10, 10) // Max 10 points for 10+ recent reviews
  
  return (
    hygieneScore * weights.hygiene +
    serviceScore * weights.service +
    popularityScore * weights.popularity +
    averageRating * weights.rating
  )
}

// Generate achievement points based on action
export function calculateAchievementPoints(action: string, level: UserLevel): number {
  const basePoints = {
    review: 10,
    photo: 5,
    checkin: 3,
    helpful_vote: 2,
    follow: 1
  }
  
  const levelMultiplier = {
    BEGINNER: 1,
    CONTRIBUTOR: 1.2,
    REVIEWER: 1.5,
    EXPERT: 1.8,
    GURU: 2,
    LOCAL_HERO: 2.5
  }
  
  const base = basePoints[action as keyof typeof basePoints] || 0
  const multiplier = levelMultiplier[level]
  
  return Math.round(base * multiplier)
}

// Check if user qualifies for level upgrade
export function checkLevelUpgrade(totalReviews: number, helpfulVotes: number, experiencePoints: number): UserLevel {
  if (experiencePoints >= 10000 && totalReviews >= 500 && helpfulVotes >= 1000) return UserLevel.LOCAL_HERO
  if (experiencePoints >= 5000 && totalReviews >= 200 && helpfulVotes >= 500) return UserLevel.GURU
  if (experiencePoints >= 2000 && totalReviews >= 100 && helpfulVotes >= 200) return UserLevel.EXPERT
  if (experiencePoints >= 500 && totalReviews >= 25 && helpfulVotes >= 50) return UserLevel.REVIEWER
  if (experiencePoints >= 100 && totalReviews >= 5) return UserLevel.CONTRIBUTOR
  return UserLevel.BEGINNER
}