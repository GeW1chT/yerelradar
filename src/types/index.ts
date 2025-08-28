export interface BusinessAmenity {
  id: string
  businessId: string
  amenity: Amenity
  createdAt: Date
}

export interface ReviewImage {
  id: string
  reviewId: string
  url: string
  caption?: string
  aiTags: string[]
  aiAnalysis?: AIPhotoAnalysis
  createdAt: Date
}

// Core Business Types
export interface Business {
  id: string
  name: string
  slug: string
  description?: string
  category: string
  subcategory?: string
  city: string
  district: string
  neighborhood?: string
  address: string
  lat: number
  lng: number
  phone?: string
  website?: string
  email?: string
  verified: boolean
  isPremium: boolean
  avgRating: number
  totalReviews: number
  totalCheckIns: number
  healthScore: number
  hygieneScore: number
  serviceScore: number
  valueScore: number
  trendScore: number
  aiSummary?: string
  priceRange?: PriceRange
  accessibility?: AccessibilityFeatures
  covidSafety: number
  createdAt: Date
  updatedAt: Date
  ownerId?: string
  
  // Relations
  reviews?: Review[]
  images?: BusinessImage[]
  workingHours?: WorkingHours[]
  amenities?: BusinessAmenity[]
  analytics?: BusinessAnalytics[]
}

export interface Review {
  id: string
  businessId: string
  userId: string
  rating: number
  title: string
  content: string
  aiSentiment: Sentiment
  aiScore: number
  tasteScore?: number
  serviceScore?: number
  cleanlinessScore?: number
  priceScore?: number
  atmosphereScore?: number
  aiTags: string[]
  aiSummary?: string
  helpfulCount: number
  isVerifiedVisit: boolean
  visitDate?: Date
  audioUrl?: string
  audioSentiment?: AudioAnalysis
  isMysteryReview: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relations
  business?: Business
  user?: User
  images?: ReviewImage[]
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  city: string
  district?: string
  phone?: string
  bio?: string
  level: UserLevel
  totalReviews: number
  helpfulVotes: number
  streakDays: number
  lastReviewDate?: Date
  isLocalHero: boolean
  isMysteryDiner: boolean
  experiencePoints: number
  createdAt: Date
  updatedAt: Date
  
  // Relations
  reviews?: Review[]
  businesses?: Business[]
  followings?: UserFollow[]
  followers?: UserFollow[]
  lists?: UserList[]
  achievements?: UserAchievement[]
}

// AI Analysis Types
export interface AIReviewAnalysis {
  sentiment: Sentiment
  score: number
  categories: {
    taste: number
    service: number
    cleanliness: number
    price: number
    atmosphere: number
  }
  summary: string
  tags: string[]
  suggestions?: string
  authenticity: number
  emotionalTone: string
}

export interface AIPhotoAnalysis {
  dishType?: string
  ambiance: string
  crowdLevel: 'empty' | 'quiet' | 'moderate' | 'busy' | 'packed'
  qualityScore: number
  detectedItems: string[]
  colorPalette: string[]
  lighting: 'poor' | 'dim' | 'good' | 'bright' | 'excellent'
  cleanliness: number
}

export interface AudioAnalysis {
  sentiment: Sentiment
  enthusiasm: number
  authenticity: number
  tone: 'excited' | 'satisfied' | 'neutral' | 'disappointed' | 'angry'
  speechClarity: number
  backgroundNoise: number
}

// Gamification Types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  category: AchievementCategory
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  earnedAt: Date
  achievement?: Achievement
}

// Smart Features Types
export interface PersonalizedRecommendation {
  business: Business
  score: number
  reasons: string[]
  type: 'taste_match' | 'location_convenience' | 'social_proof' | 'trending' | 'discovery'
  confidence: number
}

export interface BusinessInsights {
  overview: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  competitorComparison: string
  trendAnalysis: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    period: string
  }
  monthlyStats: {
    totalReviews: number
    avgRating: number
    positivePercentage: number
    responseRate: number
  }
}

export interface CityInsights {
  city: string
  risingCategories: string[]
  peakHours: Record<string, Record<string, string>>
  averagePrices: Record<string, number>
  seasonalTrends: string
  totalBusinesses: number
  activeUsers: number
  totalReviews: number
  popularDistricts: Array<{
    name: string
    businessCount: number
    avgRating: number
  }>
}

// Social Features Types
export interface UserList {
  id: string
  userId: string
  name: string
  description?: string
  isPublic: boolean
  category: ListCategory
  createdAt: Date
  updatedAt: Date
  items?: ListItem[]
  itemCount?: number
}

export interface ListItem {
  id: string
  listId: string
  businessId: string
  note?: string
  order: number
  createdAt: Date
  business?: Business
}

export interface CheckIn {
  id: string
  userId: string
  businessId: string
  note?: string
  photo?: string
  createdAt: Date
  user?: User
  business?: Business
}

export interface UserFollow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
  follower?: User
  following?: User
}

// Business Management Types
export interface BusinessAnalytics {
  id: string
  businessId: string
  date: Date
  profileViews: number
  phoneClicks: number
  websiteClicks: number
  directionClicks: number
  searchAppearances: number
  averageRating: number
  totalReviews: number
  newReviews: number
  checkIns: number
}

export interface WorkingHours {
  id: string
  businessId: string
  day: DayOfWeek
  openTime?: string
  closeTime?: string
  isClosed: boolean
}

export interface BusinessImage {
  id: string
  businessId: string
  url: string
  caption?: string
  order: number
  aiTags: string[]
  aiAnalysis?: AIPhotoAnalysis
  createdAt: Date
}

// Notification & Alert Types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

export interface HealthAlert {
  id: string
  businessId: string
  type: 'food_poisoning' | 'hygiene_issue' | 'covid_outbreak'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  reportCount: number
  verifiedReports: number
  createdAt: Date
  resolvedAt?: Date
}

// Search & Filter Types
export interface SearchFilters {
  query?: string
  category?: string
  subcategory?: string
  city: string
  district?: string
  priceRange?: PriceRange[]
  rating?: number
  amenities?: Amenity[]
  isOpen?: boolean
  hasDelivery?: boolean
  accessibility?: boolean
  sortBy?: 'rating' | 'distance' | 'reviews' | 'trending' | 'newest'
  radius?: number // in kilometers
}

export interface SearchResult {
  businesses: Business[]
  total: number
  filters: SearchFilters
  suggestions?: string[]
  relatedSearches?: string[]
}

// Accessibility Types
export interface AccessibilityFeatures {
  wheelchairAccessible: boolean
  blindFriendly: boolean
  deafFriendly: boolean
  accessibleParking: boolean
  accessibleRestroom: boolean
  brailleMenu: boolean
  signLanguage: boolean
  notes?: string
}

// Mystery Diner Types
export interface MysteryMission {
  id: string
  businessId: string
  userId: string
  title: string
  description: string
  requirements: string[]
  reward: number // points or money
  deadline: Date
  status: 'assigned' | 'in_progress' | 'completed' | 'expired'
  completedAt?: Date
  business?: Business
}

// Enums
export enum UserLevel {
  BEGINNER = 'BEGINNER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  REVIEWER = 'REVIEWER',
  EXPERT = 'EXPERT',
  GURU = 'GURU',
  LOCAL_HERO = 'LOCAL_HERO'
}

export enum Sentiment {
  VERY_NEGATIVE = 'VERY_NEGATIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  POSITIVE = 'POSITIVE',
  VERY_POSITIVE = 'VERY_POSITIVE'
}

export enum PriceRange {
  BUDGET = 'BUDGET',
  MODERATE = 'MODERATE',
  EXPENSIVE = 'EXPENSIVE',
  LUXURY = 'LUXURY'
}

export enum ListCategory {
  GENERAL = 'GENERAL',
  ROMANTIC = 'ROMANTIC',
  FAMILY = 'FAMILY',
  BUSINESS = 'BUSINESS',
  CASUAL = 'CASUAL',
  SPECIAL_OCCASION = 'SPECIAL_OCCASION',
  BUDGET_FRIENDLY = 'BUDGET_FRIENDLY',
  LUXURY = 'LUXURY',
  QUICK_BITE = 'QUICK_BITE',
  DATE_NIGHT = 'DATE_NIGHT'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export enum Amenity {
  WIFI = 'WIFI',
  PARKING = 'PARKING',
  WHEELCHAIR_ACCESSIBLE = 'WHEELCHAIR_ACCESSIBLE',
  OUTDOOR_SEATING = 'OUTDOOR_SEATING',
  LIVE_MUSIC = 'LIVE_MUSIC',
  ACCEPTS_CARDS = 'ACCEPTS_CARDS',
  DELIVERY = 'DELIVERY',
  TAKEOUT = 'TAKEOUT',
  RESERVATIONS = 'RESERVATIONS',
  KIDS_FRIENDLY = 'KIDS_FRIENDLY',
  PET_FRIENDLY = 'PET_FRIENDLY',
  VEGAN_OPTIONS = 'VEGAN_OPTIONS',
  HALAL = 'HALAL',
  ALCOHOL = 'ALCOHOL',
  SMOKING_AREA = 'SMOKING_AREA',
  AIR_CONDITIONING = 'AIR_CONDITIONING',
  VALET_PARKING = 'VALET_PARKING'
}

export enum NotificationType {
  NEW_REVIEW = 'NEW_REVIEW',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  REVIEW_HELPFUL = 'REVIEW_HELPFUL',
  ACHIEVEMENT_EARNED = 'ACHIEVEMENT_EARNED',
  BUSINESS_RESPONSE = 'BUSINESS_RESPONSE',
  RECOMMENDATION = 'RECOMMENDATION',
  TREND_ALERT = 'TREND_ALERT',
  MYSTERY_MISSION = 'MYSTERY_MISSION',
  HEALTH_ALERT = 'HEALTH_ALERT'
}

export enum AchievementCategory {
  REVIEWER = 'REVIEWER',
  EXPLORER = 'EXPLORER',
  SOCIAL = 'SOCIAL',
  EXPERT = 'EXPERT',
  PIONEER = 'PIONEER'
}