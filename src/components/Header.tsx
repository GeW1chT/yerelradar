'use client'

import Link from 'next/link'
import { Search, Menu, User, Bell, MapPin, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'

export function Header() {
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/kesfet" className="text-gray-700 hover:text-blue-600 transition-colors">
              Keşfet
            </Link>
            <Link href="/kategoriler" className="text-gray-700 hover:text-blue-600 transition-colors">
              Kategoriler
            </Link>
            <Link href="/trendler" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <TrendingUp className="w-4 h-4 mr-1" />
              Trendler
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
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
                  <Button variant="ghost" size="sm">
                    Giriş Yap
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link href="/kesfet" className="block py-2 text-gray-700 hover:text-blue-600">
              Keşfet
            </Link>
            <Link href="/kategoriler" className="block py-2 text-gray-700 hover:text-blue-600">
              Kategoriler
            </Link>
            <Link href="/trendler" className="flex items-center py-2 text-gray-700 hover:text-blue-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trendler
            </Link>
            {!isSignedIn && (
              <div className="pt-3 border-t">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full mb-2">
                    Giriş Yap
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full">
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