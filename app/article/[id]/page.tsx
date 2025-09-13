'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { articleApi, Category } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ExternalLink, ArrowLeft, Clock, Globe, User } from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/constants';

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getArticle(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-96 bg-gray-200"></div>
                <div className="p-8">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="flex gap-4 mb-6">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Haber yüklenirken bir hata oluştu.
        </div>
      </div>
    );
  }

  const article = data.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Geri</span>
          </Link>

          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {article.imageUrl && (
              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-contain bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              {/* Categories */}
              {article.categories && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.categories.map((category: Category) => (
                    <span
                      key={category.id}
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        CATEGORY_COLORS[category.name] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b">
                {article.pubDate && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(article.pubDate)}</span>
                  </div>
                )}
                
                {article.source && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">{article.source.name}</span>
                  </div>
                )}
                
                {article.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                )}
              </div>

              {article.description && (
                <div className="text-lg text-gray-700 my-6 font-medium leading-relaxed">
                  {article.description}
                </div>
              )}

              {article.content && (
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              )}

              <div className="mt-10 pt-8 border-t">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">Haberin Kaynağına Git</span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
