"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { articleApi, Article } from "@/lib/api";
import { ArticleCard } from "@/components/article-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { SidebarWordCloud } from "@/components/sidebar-word-cloud";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Newspaper,
  Clock,
  Menu,
  X,
  Check,
  Globe,
  Briefcase,
  Heart,
  Zap,
  Users,
  Building,
  Car,
  Gamepad2,
  Palette,
  Music,
  Plane,
  GraduationCap,
  Activity,
  MapPin,
  TrendingUp,
  Landmark,
  Trophy,
  Home as HomeIcon,
  Shield,
} from "lucide-react";
import { STANDARD_CATEGORIES } from "@/lib/constants";
import { SentimentChart } from "@/components/sentiment-chart";

export default function Home() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLatest, setShowLatest] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if we should open sidebar on mount (for mobile category link)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("showCategories") === "true" && window.innerWidth < 1024) {
        setSidebarOpen(true);
        // Remove the query param after opening
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  // Fetch articles based on selected category, latest, or default search
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["articles", page, selectedCategory, showLatest],
    queryFn: () => {
      if (showLatest) {
        return articleApi.getLatestArticles(50);
      }
      if (selectedCategory) {
        return articleApi.getArticles({
          page,
          limit: 18,
          categoryNames: [selectedCategory],
        });
      }
      // Default: search for "gaziantep" instead of using default categories
      return articleApi.getArticles({
        page,
        limit: 18,
        search: "gaziantep",
      });
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["statistics"],
    queryFn: articleApi.getStatistics,
  });


  const handleCategoryClick = (category: string) => {
    setShowLatest(false);
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    setPage(1);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLatestClick = () => {
    setSelectedCategory(null);
    setShowLatest(true);
    setPage(1);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar
          deneyin.
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Kategoriler</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Latest Articles Button */}
            <button
              onClick={handleLatestClick}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center gap-3 transition-all ${
                showLatest
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">En Son Haberler</span>
              {showLatest && <Check className="h-4 w-4 ml-auto" />}
            </button>
    {/* Sentiment Chart */}
    <SentimentChart />
            
          

            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-4">
                Kategoriler
              </p>
              {STANDARD_CATEGORIES.map((category) => {
                const categoryIcons: {
                  [key: string]: React.ComponentType<{ className?: string }>;
                } = {
                  Dünya: Globe,
                  Ekonomi: TrendingUp,
                  Siyaset: Landmark,
                  Spor: Trophy,
                  Teknoloji: Zap,
                  Sağlık: Heart,
                  Eğitim: GraduationCap,
                  "Kültür-Sanat": Users,
                  Magazin: Newspaper,
                  Otomobil: Car,
                  Emlak: HomeIcon,
                  Güvenlik: Shield,
                  "İş Dünyası": Briefcase,
                };
                const Icon = categoryIcons[category] || Newspaper;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg mb-1 flex items-center justify-between transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white shadow-md"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{category}</span>
                    </div>
                    {selectedCategory === category && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </div>
           
            {/* Word Cloud */}
            <SidebarWordCloud />
              {/* Statistics */}
              {statsData && (
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {statsData.data.totalArticles}
                  </div>
                  <div className="text-xs text-gray-600">Toplam Haber</div>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {statsData.data.totalCategories}
                  </div>
                  <div className="text-xs text-gray-600">Kategori</div>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {statsData.data.totalSources}
                  </div>
                  <div className="text-xs text-gray-600">Haber Kaynağı</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-gray-900 text-white rounded-full shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              {showLatest
                ? "En Son Haberler"
                : selectedCategory
                ? selectedCategory
                : "Gaziantep Haberleri"}
            </h1>

          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {isLoading
              ? // Show skeleton cards while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : data?.data?.articles?.map((article: Article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
          </div>

          {/* No Results */}
          {data?.data?.articles?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {showLatest
                  ? "En son haber bulunamadı"
                  : selectedCategory
                  ? `${selectedCategory} kategorisinde haber bulunamadı`
                  : "Gaziantep ile ilgili haber bulunamadı"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {data?.data?.pagination && !showLatest && (
            <div className="flex justify-center items-center gap-2 text-black">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>

              <span className="px-4 py-2">
                Sayfa {page} / {data.data.pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(data.data.pagination.totalPages, p + 1)
                  )
                }
                disabled={page === data.data.pagination.totalPages}
                className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
