"use client";

import { ProtectedRoute } from "@/components/protected-route";

import { useState, useEffect, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { geminiApi, articleApi, Article, GeminiSearchResult } from "@/lib/api";
import { ArticleCard } from "@/components/article-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { Search, Loader2, Globe, Database, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Format AI response with proper HTML styling
const formatAIResponse = (text: string): string => {
  if (!text) return "";

  return (
    text
      // Convert markdown headers to HTML
      .replace(
        /^#### (.*$)/gm,
        '<h4 class="text-lg font-semibold text-gray-900 mt-6 mb-3 border-l-4 border-blue-400 pl-3">$1</h4>'
      )
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">$1</h3>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6 border-b-2 border-blue-200 pb-3">$1</h2>'
      )
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-3xl font-bold text-gray-900 mt-12 mb-8">$1</h1>'
      )

      // Convert bold text
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900">$1</strong>'
      )

      // Convert paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-800 leading-relaxed">')

      // Add opening paragraph tag
      .replace(/^/, '<p class="mb-4 text-gray-800 leading-relaxed">')

      // Add closing paragraph tag
      .replace(/$/, "</p>")

      // Fix empty paragraphs
      .replace(/<p class="mb-4 text-gray-800 leading-relaxed"><\/p>/g, "")

      // Convert numbered lists
      .replace(/^\d+\.\s+(.*$)/gm, '<li class="mb-2 ml-4">$1</li>')

      // Convert bullet points
      .replace(/^[-•]\s+(.*$)/gm, '<li class="mb-2 ml-4 list-disc">$1</li>')

      // Wrap consecutive list items in ul tags
      .replace(
        /(<li class="mb-2 ml-4[^"]*">.*?<\/li>\s*)+/g,
        '<ul class="mb-4 ml-6 space-y-1">$&</ul>'
      )

      // Add spacing for better readability
      .replace(/(<h[1-3][^>]*>)/g, '<div class="mt-6">$1')
      .replace(/(<\/h[1-3]>)/g, "$1</div>")
  );
};

function SearchContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"local" | "web">("local");
  const [maxDaysOld, setMaxDaysOld] = useState(2);
  const [localResults, setLocalResults] = useState<Article[]>([]);
  const [webResults, setWebResults] = useState<GeminiSearchResult | null>(null);

  // Local search mutation
  const localSearchMutation = useMutation({
    mutationFn: (query: string) => articleApi.searchArticles(query, 100),
    onSuccess: (data) => {
      console.log("Search API Response:", data);
      // searchArticles fonksiyonu zaten response.data.data döndürüyor
      setLocalResults(data || []);
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

  // Check if this is an auto search from navbar (hide search form)
  const isAutoSearch = searchParams.get("auto") === "true";

  return (
    <ProtectedRoute>
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

            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">
              {isAutoSearch ? "Şehitkamil Haberleri" : "Haber Ara"}
            </h1>

            {/* Search Form - Only show if not auto search */}
            {!isAutoSearch && (
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
                      localSearchMutation.isPending ||
                      webSearchMutation.isPending
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
                        onChange={(e) =>
                          setMaxDaysOld(parseInt(e.target.value))
                        }
                        min="1"
                        max="30"
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                      <span className="text-sm text-gray-500">gün</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              AI Araştırma Raporu
                            </h3>
                            <p className="text-sm text-gray-600">
                              Google Search ile desteklenen kapsamlı analiz
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="prose prose-lg max-w-none">
                          <div
                            className="text-gray-800 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatAIResponse(
                                webResults.textWithCitations || webResults.text
                              ),
                            }}
                          />
                        </div>
                      </div>

                      {/* Search Queries Used */}
                      {webResults.searchQueries.length > 0 && (
                        <div className="px-6 pb-4 border-t border-gray-100">
                          <div className="pt-4">
                            <span className="text-xs text-gray-500 font-medium">
                              Kullanılan arama sorguları:{" "}
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {webResults.searchQueries.map((query, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                                >
                                  {query}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sources */}
                    {webResults.sources.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Kaynaklar ({webResults.sources.length})
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Bu raporda kullanılan haber kaynakları
                          </p>
                        </div>
                        <div className="p-6">
                          <div className="grid gap-4">
                            {webResults.sources.map((source, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={source.web?.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors block mb-1"
                                  >
                                    {source.web?.title || `Kaynak ${index + 1}`}
                                  </a>
                                  <p className="text-sm text-gray-500 break-all">
                                    {source.web?.uri}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
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
    </ProtectedRoute>
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
