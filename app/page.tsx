'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { articleApi } from '@/lib/api';
import { ArticleCard } from '@/components/article-card';
import { Loader2, Filter, RefreshCw } from 'lucide-react';

export default function Home() {
  const [page, setPage] = useState(1);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['articles', page, selectedSource, selectedCategory],
    queryFn: () => articleApi.getArticles({
      page,
      limit: 12,
      sourceId: selectedSource || undefined,
      categoryId: selectedCategory || undefined,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['statistics'],
    queryFn: articleApi.getStatistics,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Statistics */}
      {statsData?.data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{statsData.data.totalArticles}</div>
            <div className="text-sm text-gray-600">Toplam Haber</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{statsData.data.articlesLast24h}</div>
            <div className="text-sm text-gray-600">Son 24 Saat</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{statsData.data.articlesLast7days}</div>
            <div className="text-sm text-gray-600">Son 7 Gün</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{statsData.data.totalSources}</div>
            <div className="text-sm text-gray-600">Haber Kaynağı</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{statsData.data.totalCategories}</div>
            <div className="text-sm text-gray-600">Kategori</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Son Haberler</h1>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data?.data?.articles?.map((article: any) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {data?.data?.pagination && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Önceki
          </button>
          <span className="px-4 py-2">
            Sayfa {page} / {data.data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.data.pagination.totalPages}
            className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
