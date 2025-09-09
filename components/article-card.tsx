import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { Article } from '@/lib/api';
import { timeAgo, truncateText } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {article.imageUrl && (
        <div className="relative h-48 w-full">
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
      
      <div className="p-4">
        <Link href={`/article/${article.id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
        
        {article.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {truncateText(article.description, 150)}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {article.pubDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{timeAgo(article.pubDate)}</span>
            </div>
          )}
          
          {article.source && (
            <div className="flex items-center gap-1">
              <span className="font-medium">{article.source.name}</span>
            </div>
          )}
        </div>
        
        {article.categories && article.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                <Tag className="h-3 w-3" />
                {category.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Link
            href={`/article/${article.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Devamını Oku
          </Link>
          
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Kaynak</span>
          </a>
        </div>
      </div>
    </div>
  );
}
