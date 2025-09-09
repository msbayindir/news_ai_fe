'use client';

import { useQuery } from '@tanstack/react-query';
import { articleApi } from '@/lib/api';
import { ArticleCard } from '@/components/article-card';
import { TrendingUp, Loader2, Clock } from 'lucide-react';

export default function TrendingPage() {
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => articleApi.getTrendingArticles(12),
  });

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ['latest'],
    queryFn: () => articleApi.getLatestArticles(12),
  });

  const isLoading = trendingLoading || latestLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Trending Articles */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold">Trend Haberler</h2>
          <span className="text-sm text-gray-500">Son 24 saat</span>
        </div>
        
        {trendingData?.data && trendingData.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingData.data.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Henüz trend haber bulunmuyor</p>
          </div>
        )}
      </div>

      {/* Latest Articles */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">En Son Haberler</h2>
        </div>
        
        {latestData?.data && latestData.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestData.data.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Henüz haber bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}
