'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, Flag, Filter, SortAsc, TrendingUp, Brain, MessageSquare, Camera, Clock, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface Review {
  id: string
  rating: number
  content: string
  photos?: string[]
  helpfulVotes: number
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    level: string
    totalReviews: number
  }
  aiAnalysis?: {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    confidence: number
    keywords: string[]
    categories: {
      service: number
      quality: number
      value: number
      atmosphere: number
    }
    summary: string
    isSpam: boolean
    helpfulnessScore: number
  }
}

interface ReviewSystemProps {
  businessId: string
  reviews: Review[]
  onReviewUpdate?: (reviewId: string, data: any) => void
  onReviewReport?: (reviewId: string) => void
}

export function ReviewSystem({ businessId, reviews, onReviewUpdate, onReviewReport }: ReviewSystemProps) {
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [filterBy, setFilterBy] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState<string>('reviews')
  const { toast } = useToast()

  // AI Insights calculation
  const aiInsights = React.useMemo(() => {
    const validReviews = reviews.filter(r => r.aiAnalysis && !r.aiAnalysis.isSpam)
    
    if (validReviews.length === 0) return null

    const totalReviews = validReviews.length
    const avgRating = validReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    
    const sentimentCounts = validReviews.reduce((acc, r) => {
      acc[r.aiAnalysis!.sentiment] = (acc[r.aiAnalysis!.sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoryScores = validReviews.reduce((acc, r) => {
      const analysis = r.aiAnalysis!
      acc.service += analysis.categories.service
      acc.quality += analysis.categories.quality
      acc.value += analysis.categories.value
      acc.atmosphere += analysis.categories.atmosphere
      return acc
    }, { service: 0, quality: 0, value: 0, atmosphere: 0 })

    Object.keys(categoryScores).forEach(key => {
      categoryScores[key as keyof typeof categoryScores] /= totalReviews
    })

    const topKeywords = validReviews
      .flatMap(r => r.aiAnalysis!.keywords)
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return {
      totalReviews,
      avgRating,
      sentimentCounts,
      categoryScores,
      topKeywords: Object.entries(topKeywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }))
    }
  }, [reviews])

  // Filter and sort reviews
  useEffect(() => {
    let filtered = [...reviews]

    // Apply filters
    switch (filterBy) {
      case 'positive':
        filtered = filtered.filter(r => r.rating >= 4)
        break
      case 'negative':
        filtered = filtered.filter(r => r.rating <= 2)
        break
      case 'with-photos':
        filtered = filtered.filter(r => r.photos && r.photos.length > 0)
        break
      case 'verified':
        filtered = filtered.filter(r => r.user.totalReviews >= 5)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'highest-rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest-rating':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'most-helpful':
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes)
        break
      case 'ai-score':
        filtered.sort((a, b) => (b.aiAnalysis?.helpfulnessScore || 0) - (a.aiAnalysis?.helpfulnessScore || 0))
        break
    }

    setFilteredReviews(filtered)
  }, [reviews, sortBy, filterBy])

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      })
      
      if (response.ok) {
        onReviewUpdate?.(reviewId, { helpfulVotes: 1 })
        toast({
          title: "Teşekkürler!",
          description: "Yorumu faydalı olarak işaretlediniz."
        })
      }
    } catch (error) {
      console.error('Error voting helpful:', error)
      toast({
        title: "Hata",
        description: "Oy verilirken bir hata oluştu.",
        variant: "destructive"
      })
    }
  }

  const handleReportReview = async (reviewId: string) => {
    onReviewReport?.(reviewId)
    toast({
      title: "Rapor edildi",
      description: "Yorum inceleme için raporlandı."
    })
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      {aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Analiz Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{aiInsights.avgRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Ortalama Puan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((aiInsights.sentimentCounts.POSITIVE / aiInsights.totalReviews) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Olumlu Yorum</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {aiInsights.categoryScores.service.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Hizmet Puanı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {aiInsights.categoryScores.quality.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Kalite Puanı</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Popüler Kelimeler</h4>
              <div className="flex flex-wrap gap-2">
                {aiInsights.topKeywords.slice(0, 8).map(({ keyword, count }) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Yorumlar</SelectItem>
              <SelectItem value="positive">Olumlu (4-5⭐)</SelectItem>
              <SelectItem value="negative">Olumsuz (1-2⭐)</SelectItem>
              <SelectItem value="with-photos">Fotoğraflı</SelectItem>
              <SelectItem value="verified">Doğrulanmış</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SortAsc className="w-4 h-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="highest-rating">En Yüksek Puan</SelectItem>
              <SelectItem value="lowest-rating">En Düşük Puan</SelectItem>
              <SelectItem value="most-helpful">En Faydalı</SelectItem>
              <SelectItem value="ai-score">AI Puanı</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-600">
          {filteredReviews.length} / {reviews.length} yorum gösteriliyor
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpfulVote={handleHelpfulVote}
              onReport={handleReportReview}
            />
          ))}
        </AnimatePresence>

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Seçilen kriterlere uygun yorum bulunamadı.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ReviewCard({ review, onHelpfulVote, onReport }: {
  review: Review
  onHelpfulVote: (id: string) => void
  onReport: (id: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = review.content.length > 200

  const getUserLevelColor = (level: string) => {
    const colors = {
      BEGINNER: 'bg-gray-100 text-gray-800',
      CONTRIBUTOR: 'bg-green-100 text-green-800',
      REVIEWER: 'bg-blue-100 text-blue-800',
      EXPERT: 'bg-purple-100 text-purple-800',
      GURU: 'bg-orange-100 text-orange-800',
      LOCAL_HERO: 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || colors.BEGINNER
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-green-600'
      case 'NEGATIVE': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          {/* User Info & Rating */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={review.user.avatar} />
                <AvatarFallback>
                  {review.user.firstName[0]}{review.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {review.user.firstName} {review.user.lastName}
                  </span>
                  <Badge className={`text-xs ${getUserLevelColor(review.user.level)}`}>
                    {review.user.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{review.user.totalReviews} yorum</span>
                  <span>•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Review Content */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {shouldTruncate && !isExpanded 
                ? `${review.content.substring(0, 200)}...` 
                : review.content
              }
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                {isExpanded ? 'Daha az göster' : 'Devamını oku'}
              </button>
            )}
          </div>

          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Yorum fotoğrafı ${index + 1}`}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {review.aiAnalysis && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">AI Analizi</span>
                <Badge variant="outline" className={getSentimentColor(review.aiAnalysis.sentiment)}>
                  {review.aiAnalysis.sentiment}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Hizmet:</span>
                  <span className="ml-1 font-medium">{review.aiAnalysis.categories.service}/10</span>
                </div>
                <div>
                  <span className="text-gray-600">Kalite:</span>
                  <span className="ml-1 font-medium">{review.aiAnalysis.categories.quality}/10</span>
                </div>
                <div>
                  <span className="text-gray-600">Değer:</span>
                  <span className="ml-1 font-medium">{review.aiAnalysis.categories.value}/10</span>
                </div>
                <div>
                  <span className="text-gray-600">Atmosfer:</span>
                  <span className="ml-1 font-medium">{review.aiAnalysis.categories.atmosphere}/10</span>
                </div>
              </div>

              {review.aiAnalysis.keywords.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {review.aiAnalysis.keywords.slice(0, 5).map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHelpfulVote(review.id)}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Faydalı ({review.helpfulVotes})
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReport(review.id)}
                className="flex items-center gap-2 text-gray-600"
              >
                <Flag className="w-4 h-4" />
                Raporla
              </Button>
            </div>

            {review.aiAnalysis && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                AI Puanı: {review.aiAnalysis.helpfulnessScore}/10
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}