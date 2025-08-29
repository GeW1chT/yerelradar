'use client'

import Link from 'next/link'
import { Search, Menu, User, Bell, MapPin, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'

// Check if Clerk is configured
const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'your_clerk_publishable_key_here'

// Component for when Clerk is not configured
function HeaderWithoutAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
              YR
            </div>
            <span className="font-bold text-xl text-gray-900">YerelRadar</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Restoran, kafe, berber... ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/kesfet" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Keşfet
            </Link>
            <Link href="/harita" className="flex items-center text-gray-900 hover:text-blue-600 transition-colors font-medium">
              <MapPin className="w-4 h-4 mr-1" />
              Harita
            </Link>
            <Link href="/kategoriler" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Kategoriler
            </Link>
            <Link href="/trendler" className="flex items-center text-gray-900 hover:text-blue-600 transition-colors font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              Trendler
            </Link>
          </nav>

          {/* Demo User Actions */}
          <div className="flex items-center space-x-4 ml-8">
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="bg-white text-gray-900 border-gray-600 hover:bg-gray-50 hover:border-gray-700 font-medium shadow-sm">
                Giriş Yap
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                Kayıt Ol
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Restoran, kafe, berber... ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link href="/kesfet" className="block py-2 text-gray-900 hover:text-blue-600 font-medium">
              Keşfet
            </Link>
            <Link href="/harita" className="flex items-center py-2 text-gray-900 hover:text-blue-600 font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              Harita
            </Link>
            <Link href="/kategoriler" className="block py-2 text-gray-900 hover:text-blue-600 font-medium">
              Kategoriler
            </Link>
            <Link href="/trendler" className="flex items-center py-2 text-gray-900 hover:text-blue-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trendler
            </Link>
            <div className="pt-3 border-t">
              <Button variant="outline" className="w-full mb-2 bg-white text-gray-900 border-gray-600 hover:bg-gray-50 hover:border-gray-700 font-medium shadow-sm">
                Giriş Yap
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                Kayıt Ol
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// Component for when Clerk is configured
function HeaderWithAuth() {
  const { isSignedIn, user } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')


  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
              YR
            </div>
            <span className="font-bold text-xl text-gray-900">YerelRadar</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Restoran, kafe, berber... ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/kesfet" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Keşfet
            </Link>
            <Link href="/harita" className="flex items-center text-gray-900 hover:text-blue-600 transition-colors font-medium">
              <MapPin className="w-4 h-4 mr-1" />
              Harita
            </Link>
            <Link href="/kategoriler" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Kategoriler
            </Link>
            <Link href="/trendler" className="flex items-center text-gray-900 hover:text-blue-600 transition-colors font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              Trendler
            </Link>
            {isSignedIn && (
              <>
                <Link href="/profil" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
                  Profilim
                </Link>
                <Link href="/dashboard" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
                  İşletme Paneli
                </Link>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4 ml-8">
            {isSignedIn ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    3
                  </Badge>
                </Button>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-gray-900">{user?.firstName}</div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      Uzman Yorumcu
                    </div>
                  </div>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="bg-white text-gray-900 border-gray-600 hover:bg-gray-50 hover:border-gray-700 font-medium shadow-sm">
                    Giriş Yap
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                    Kayıt Ol
                  </Button>
                </SignInButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Restoran, kafe, berber... ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link href="/kesfet" className="block py-2 text-gray-900 hover:text-blue-600 font-medium">
              Keşfet
            </Link>
            <Link href="/harita" className="flex items-center py-2 text-gray-900 hover:text-blue-600 font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              Harita
            </Link>
            <Link href="/kategoriler" className="block py-2 text-gray-900 hover:text-blue-600 font-medium">
              Kategoriler
            </Link>
            <Link href="/trendler" className="flex items-center py-2 text-gray-900 hover:text-blue-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trendler
            </Link>
            {isSignedIn && (
              <>
                <Link href="/profil" className="block py-2 text-gray-900 hover:text-blue-600 font-medium">
                  Profilim
                </Link>
                <Link href="/dashboard" className="block py-2 text-gray-900 hover:text-blue-600 font-medium">
                  İşletme Paneli
                </Link>
              </>
            )}
            {!isSignedIn && (
              <div className="pt-3 border-t">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full mb-2 bg-white text-gray-900 border-gray-600 hover:bg-gray-50 hover:border-gray-700 font-medium shadow-sm">
                    Giriş Yap
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                    Kayıt Ol
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// Main Header component that chooses which version to render
export function Header() {
  if (isClerkConfigured) {
    return <HeaderWithAuth />
  }
  return <HeaderWithoutAuth />
}