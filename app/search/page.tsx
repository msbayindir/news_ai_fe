"use client";

import { useState, useEffect, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { geminiApi, articleApi, Article, SearchResult, GeminiSearchResult } from "@/lib/api";
import { ArticleCard } from "@/components/article-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { Search, Loader2, Globe, Database, ArrowLeft } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"local" | "web">("local");
  const [maxDaysOld, setMaxDaysOld] = useState(2);
  const [localResults, setLocalResults] = useState<Article[]>([]);
  const [webResults, setWebResults] = useState<GeminiSearchResult | null>(null);

  // Local search mutation
  const localSearchMutation = useMutation({
    mutationFn: (query: string) => articleApi.searchArticles(query, 20),
    onSuccess: (data) => {
      setLocalResults(data.data || []);
    },
  });

  // Web search mutation - Gaziantep/Şehitkamil odaklı
  const webSearchMutation = useMutation({
    mutationFn: ({
      query,
      maxDaysOld,
    }: {
      query: string;
      maxDaysOld: number;
    }) => geminiApi.searchWeb(query, maxDaysOld),
    onSuccess: (data) => {
      setWebResults(data.data || null);
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Lütfen bir arama terimi girin");
      return;
    }

    if (searchType === "local") {
      localSearchMutation.mutate(searchQuery);
    } else {
      webSearchMutation.mutate({ query: searchQuery, maxDaysOld });
    }
  };

  // Auto search when coming from navbar with query params
  useEffect(() => {
    const query = searchParams.get("q");
    const autoSearch = searchParams.get("auto");

    if (query && autoSearch === "true" && query !== searchQuery) {
      setSearchQuery(query);
      // Automatically perform local search
      localSearchMutation.mutate(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Haber Ara</h1>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Arama terimi girin..."
                className="flex-1 px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={
                  localSearchMutation.isPending || webSearchMutation.isPending
                }
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {localSearchMutation.isPending ||
                webSearchMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                Ara
              </button>
            </div>

            {/* Search Type Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="local"
                  checked={searchType === "local"}
                  onChange={(e) =>
                    setSearchType(e.target.value as "local" | "web")
                  }
                  className="text-gray-600"
                />
                <Database className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Veritabanında Ara
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="web"
                  checked={searchType === "web"}
                  onChange={(e) =>
                    setSearchType(e.target.value as "local" | "web")
                  }
                  className="text-gray-600"
                />
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Web&apos;de Ara (AI)
                </span>
              </label>
              {searchType === "web" && (
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-sm text-gray-500">Son</label>
                  <input
                    type="number"
                    value={maxDaysOld}
                    onChange={(e) => setMaxDaysOld(parseInt(e.target.value))}
                    min="1"
                    max="30"
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <span className="text-sm text-gray-500">gün</span>
                </div>
              )}
            </div>
          </div>

          {/* Local Search Results */}
          {searchType === "local" && (
            <div>
              {localSearchMutation.isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : localResults.length > 0 ? (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Veritabanı Sonuçları ({localResults.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {localResults.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </>
              ) : (
                searchQuery &&
                !localSearchMutation.isPending && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Sonuç bulunamadı</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Web Search Results */}
          {searchType === "web" && (
            <div>
              {webSearchMutation.isPending ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                    >
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : webResults && webResults.text ? (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Web Sonuçları ({webResults.sourcesCount} kaynak)
                  </h2>
                  
                  {/* AI Generated Content */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">AI Özeti</span>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {webResults.textWithCitations || webResults.text}
                      </p>
                    </div>
                    
                    {/* Search Queries Used */}
                    {webResults.searchQueries.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-medium">Arama sorguları: </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {webResults.searchQueries.map((query, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {query}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sources */}
                  {webResults.sources.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Kaynaklar</h3>
                      {webResults.sources.map((source, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 border-blue-500"
                        >
                          <a
                            href={source.web?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium text-gray-900 hover:text-blue-600 mb-1 block transition-colors"
                          >
                            {source.web?.title || `Kaynak ${index + 1}`}
                          </a>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">[{index + 1}]</span>
                            <span className="ml-2">{source.web?.uri}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                searchQuery &&
                !webSearchMutation.isPending && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Sonuç bulunamadı</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
