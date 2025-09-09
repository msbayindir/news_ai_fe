'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { geminiApi, articleApi } from '@/lib/api';
import { ArticleCard } from '@/components/article-card';
import { Search, Loader2, Globe, Database } from 'lucide-react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'local' | 'web'>('local');
  const [maxDaysOld, setMaxDaysOld] = useState(2);
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [webResults, setWebResults] = useState<any[]>([]);

  // Local search mutation
  const localSearchMutation = useMutation({
    mutationFn: (query: string) => articleApi.searchArticles(query, 20),
    onSuccess: (data) => {
      setLocalResults(data.data || []);
    },
  });

  // Web search mutation
  const webSearchMutation = useMutation({
    mutationFn: (data: { query: string; maxDaysOld: number }) =>
      geminiApi.searchWeb(data),
    onSuccess: (data) => {
      setWebResults(data.data.results || []);
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert('Lütfen bir arama terimi girin');
      return;
    }

    if (searchType === 'local') {
      localSearchMutation.mutate(searchQuery);
    } else {
      webSearchMutation.mutate({ query: searchQuery, maxDaysOld });
    }
  };

  const isSearching = localSearchMutation.isPending || webSearchMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Search className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Haber Arama</h1>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSearchType('local')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                searchType === 'local'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Database className="h-4 w-4" />
              Veritabanında Ara
            </button>
            <button
              onClick={() => setSearchType('web')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                searchType === 'web'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Globe className="h-4 w-4" />
              Web'de Ara (AI)
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Arama terimini girin..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {searchType === 'web' && (
              <select
                value={maxDaysOld}
                onChange={(e) => setMaxDaysOld(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Son 1 gün</option>
                <option value={2}>Son 2 gün</option>
                <option value={3}>Son 3 gün</option>
                <option value={7}>Son 7 gün</option>
              </select>
            )}
            
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Ara
                </>
              )}
            </button>
          </div>
        </div>

        {/* Local Search Results */}
        {searchType === 'local' && localResults.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {localResults.length} sonuç bulundu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localResults.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Web Search Results */}
        {searchType === 'web' && webResults.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {webResults.length} web sonucu bulundu
            </h2>
            <div className="space-y-4">
              {webResults.map((result, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
                  >
                    {result.title}
                  </a>
                  <p className="text-gray-600 mb-2">{result.snippet}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{result.displayLink}</span>
                    {result.publishedDate && (
                      <span>
                        {new Date(result.publishedDate).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {((searchType === 'local' && localResults.length === 0 && !localSearchMutation.isPending && localSearchMutation.isSuccess) ||
          (searchType === 'web' && webResults.length === 0 && !webSearchMutation.isPending && webSearchMutation.isSuccess)) && (
          <div className="text-center py-12">
            <p className="text-gray-500">Sonuç bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
