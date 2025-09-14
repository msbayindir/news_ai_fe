"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { BarChart3, Loader2 } from "lucide-react";

export function SidebarWordCloud() {
  const { data: wordFrequency, isLoading } = useQuery({
    queryKey: ['wordFrequency'],
    queryFn: analyticsApi.getLatestWordFrequency,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Trend Kelimeler</h3>
        </div>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!wordFrequency?.data || !wordFrequency.data.words.length) {
    return (
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Trend Kelimeler</h3>
        </div>
        <p className="text-xs text-gray-500">Henüz analiz yapılmamış</p>
      </div>
    );
  }

  // Take top 15 words for sidebar
  const topWords = wordFrequency.data.words.slice(0, 15);
  const maxCount = Math.max(...topWords.map(w => w.count));
  const minCount = Math.min(...topWords.map(w => w.count));
  const range = maxCount - minCount || 1;

  const getFontSize = (count: number) => {
    const normalized = (count - minCount) / range;
    return 0.7 + normalized * 0.4; // Font size between 0.7rem and 1.1rem
  };

  const getColor = (count: number) => {
    const normalized = (count - minCount) / range;
    if (normalized > 0.7) return "text-blue-600";
    if (normalized > 0.4) return "text-indigo-600";
    return "text-gray-600";
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Trend Kelimeler</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {topWords.map((item, index) => (
          <span
            key={index}
            className={`inline-block px-2 py-1 rounded-md transition-all hover:scale-105 cursor-default bg-gray-50 hover:bg-gray-100 ${getColor(item.count)}`}
            style={{
              fontSize: `${getFontSize(item.count)}rem`,
            }}
            title={`${item.word}: ${item.count} kez`}
          >
            {item.word}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {wordFrequency.data.articleCount} haberden analiz edildi
      </p>
    </div>
  );
}
