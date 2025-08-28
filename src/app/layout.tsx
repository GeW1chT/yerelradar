import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YerelRadar - Yapay Zeka ile Güçlendirilmiş Yerel İşletme Keşif Platformu',
  description: 'AI destekli yorumlar, akıllı öneriler ve yerel kahramanlarla şehrinizdeki en iyi işletmeleri keşfedin.',
  keywords: ['restoran', 'kafe', 'yerel işletme', 'yapay zeka', 'yorum', 'öneri', 'istanbul', 'ankara'],
  authors: [{ name: 'YerelRadar Team' }],
  openGraph: {
    title: 'YerelRadar - Akıllı Yerel İşletme Keşfi',
    description: 'AI destekli yorumlar ve akıllı önerilerle şehrinizdeki en iyi işletmeleri keşfedin.',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YerelRadar - Akıllı Yerel İşletme Keşfi',
    description: 'AI destekli yorumlar ve akıllı önerilerle şehrinizdeki en iyi işletmeleri keşfedin.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="tr">
        <body className={inter.className}>
          <Providers>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="pb-16">
                {children}
              </main>
            </div>
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}