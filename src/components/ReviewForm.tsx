'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Star, Camera, Mic, MicOff, Upload, X, Zap, 
  AlertCircle, CheckCircle, Loader2, Send, Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
  content: z.string().min(10, 'Yorum en az 10 karakter olmalı'),
  visitDate: z.string().optional(),
  categories: z.object({
    taste: z.number().min(0).max(10).optional(),
    service: z.number().min(0).max(10).optional(),
    cleanliness: z.number().min(0).max(10).optional(),
    price: z.number().min(0).max(10).optional(),
    atmosphere: z.number().min(0).max(10).optional(),
  }).optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  businessId: string
  businessName: string
  businessType: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function ReviewForm({ 
  businessId, 
  businessName, 
  businessType, 
  onSubmit, 
  onCancel 
}: ReviewFormProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [analysisError, setAnalysisError] = useState<string>('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors, isSubmitting } 
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      categories: {
        taste: 0,
        service: 0,
        cleanliness: 0,
        price: 0,
        atmosphere: 0,
      }
    }
  })

  const watchedContent = watch('content', '')
  const watchedRating = watch('rating', 0)

  // Auto-analyze review as user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedContent.length > 20) {
        analyzeReviewContent()
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [watchedContent])

  const analyzeReviewContent = async () => {
    if (!watchedContent || watchedContent.length < 20) return

    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      const response = await fetch('/api/ai/analyze-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: watchedContent,
          businessType,
          audioUrl: audioUrl || undefined
        })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result = await response.json()
      if (result.success) {
        setAiAnalysis(result.data)
        
        // Auto-fill category scores if available
        if (result.data.categories) {
          setValue('categories.taste', result.data.categories.taste || 0)
          setValue('categories.service', result.data.categories.service || 0)
          setValue('categories.cleanliness', result.data.categories.cleanliness || 0)
          setValue('categories.price', result.data.categories.price || 0)
          setValue('categories.atmosphere', result.data.categories.atmosphere || 0)
        }
      }
    } catch (error) {
      setAnalysisError('AI analizi sırasında hata oluştu')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      const chunks: BlobPart[] = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording failed:', error)
      alert('Mikrofon erişimi reddedildi')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const removeAudio = () => {
    setAudioBlob(null)
    setAudioUrl('')
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedImages(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const onFormSubmit = async (data: ReviewFormData) => {
    const formData = new FormData()
    
    // Add form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    })
    
    // Add AI analysis
    if (aiAnalysis) {
      formData.append('aiAnalysis', JSON.stringify(aiAnalysis))
    }
    
    // Add audio
    if (audioBlob) {
      formData.append('audio', audioBlob, 'review-audio.wav')
    }
    
    // Add images
    uploadedImages.forEach((image, index) => {
      formData.append(`image-${index}`, image)
    })
    
    await onSubmit(formData)
  }

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={cn(
            "transition-colors",
            star <= value ? "text-yellow-400" : "text-gray-300"
          )}
        >
          <Star className={cn("w-8 h-8", star <= value && "fill-current")} />
        </button>
      ))}
    </div>
  )

  const CategorySlider = ({ label, value, onChange }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void 
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {businessName} için yorum yaz
        </h2>
        <p className="text-gray-600">Deneyimini paylaş, AI analizimizle daha değerli yorumlar oluştur</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Genel değerlendirmen *
          </label>
          <StarRating 
            value={watchedRating} 
            onChange={(rating) => setValue('rating', rating)} 
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Başlık *
          </label>
          <input
            {...register('title')}
            type="text"
            placeholder="Yorumun için kısa bir başlık"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Yorumun *
            </label>
            {isAnalyzing && (
              <div className="flex items-center text-blue-600 text-sm">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                AI analiz ediyor...
              </div>
            )}
          </div>
          <textarea
            {...register('content')}
            rows={4}
            placeholder="Deneyimini detaylı anlat..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* AI Analysis Result */}
        {aiAnalysis && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">AI Analiz Sonucu</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Duygu:</span>
                    <Badge className={cn("ml-2", 
                      aiAnalysis.sentiment === 'VERY_POSITIVE' ? 'bg-green-100 text-green-800' :
                      aiAnalysis.sentiment === 'POSITIVE' ? 'bg-blue-100 text-blue-800' :
                      aiAnalysis.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {aiAnalysis.sentiment}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Puan:</span>
                    <span className="ml-2 font-medium">{aiAnalysis.score}/10</span>
                  </div>
                </div>
                {aiAnalysis.summary && (
                  <p className="text-gray-700 mt-2">{aiAnalysis.summary}</p>
                )}
                {aiAnalysis.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {aiAnalysis.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {analysisError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{analysisError}</span>
            </div>
          </div>
        )}

        {/* Category Ratings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Detaylı Değerlendirme</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySlider 
              label="Lezzet" 
              value={watch('categories.taste', 0)} 
              onChange={(value) => setValue('categories.taste', value)}
            />
            <CategorySlider 
              label="Hizmet" 
              value={watch('categories.service', 0)} 
              onChange={(value) => setValue('categories.service', value)}
            />
            <CategorySlider 
              label="Temizlik" 
              value={watch('categories.cleanliness', 0)} 
              onChange={(value) => setValue('categories.cleanliness', value)}
            />
            <CategorySlider 
              label="Fiyat" 
              value={watch('categories.price', 0)} 
              onChange={(value) => setValue('categories.price', value)}
            />
            <CategorySlider 
              label="Atmosfer" 
              value={watch('categories.atmosphere', 0)} 
              onChange={(value) => setValue('categories.atmosphere', value)}
            />
          </div>
        </div>

        {/* Voice Recording */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sesli Yorum (İsteğe bağlı)</h4>
          <div className="flex items-center space-x-3">
            {!isRecording && !audioUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={startRecording}
                className="flex items-center"
              >
                <Mic className="w-4 h-4 mr-2" />
                Kayıt Başlat
              </Button>
            )}
            
            {isRecording && (
              <Button
                type="button"
                variant="destructive"
                onClick={stopRecording}
                className="flex items-center animate-pulse"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Kaydı Durdur
              </Button>
            )}
            
            {audioUrl && (
              <div className="flex items-center space-x-3">
                <audio ref={audioRef} controls src={audioUrl} className="h-10" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAudio}
                  className="text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Fotoğraflar (İsteğe bağlı)</h4>
          <div className="space-y-3">
            {uploadedImages.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-dashed"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Fotoğraf Ekle ({uploadedImages.length}/5)
              </Button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visit Date */}
        <div>
          <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-2">
            Ziyaret Tarihi (İsteğe bağlı)
          </label>
          <input
            {...register('visitDate')}
            type="date"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || watchedRating === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Yorumu Gönder
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}