'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { articleApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Calendar, User, Tag, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getArticle(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana Sayfaya Dön
        </Link>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {article.imageUrl && (
            <div className="relative h-96 w-full">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4 text-black">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              {article.pubDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.pubDate)}</span>
                </div>
              )}
              
              {article.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
              )}
              
              {article.source && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">{article.source.name}</span>
                </div>
              )}
            </div>

            {article.categories && article.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.categories.map((category: any) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    <Tag className="h-3 w-3" />
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {article.description && (
              <div className="text-lg text-gray-700 mb-6 font-medium">
                {article.description}
              </div>
            )}

            {article.content && (
              <div className="prose max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Haberin Kaynağına Git
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
