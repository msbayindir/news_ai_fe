'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Newspaper, Search, Brain, Rss, Home, MapPin, Menu, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/trending', label: 'Trend', icon: TrendingUp },
  { href: '/search', label: 'Arama', icon: Search },
  { href: '/ai-summary', label: 'AI Özet', icon: Brain },
  { href: '/feeds', label: 'Kaynaklar', icon: Rss },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSehitkamilSearch = () => {
    router.push('/search?q=Şehitkamil&auto=true');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">News AI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Şehitkamil Quick Search Button */}
            <button
              onClick={handleSehitkamilSearch}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Şehitkamil Haberleri</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Şehitkamil Quick Search Button for Mobile */}
              <button
                onClick={handleSehitkamilSearch}
                className="w-full flex items-center space-x-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MapPin className="h-5 w-5" />
                <span>Şehitkamil Haberleri</span>
              </button>
              
              {/* Categories Link for Mobile */}
              <Link
                href="/?showCategories=true"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center space-x-3 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
              >
                <Newspaper className="h-5 w-5" />
                <span>Kategoriler</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
