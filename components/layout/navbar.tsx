'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, Search, Brain, Rss, Home, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/trending', label: 'Trendler', icon: TrendingUp },
  { href: '/search', label: 'Arama', icon: Search },
  { href: '/ai-summary', label: 'AI Özet', icon: Brain },
  { href: '/feeds', label: 'Kaynaklar', icon: Rss },
];

export function Navbar() {
  const pathname = usePathname();

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
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
