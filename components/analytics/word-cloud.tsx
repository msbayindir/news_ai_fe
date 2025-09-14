"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface WordCloudProps {
  words: Array<{ word: string; count: number }>;
  title?: string;
  maxWords?: number;
}

export function WordCloud({ words, title = "Kelime Bulutu", maxWords = 30 }: WordCloudProps) {
  // Take only the specified number of words
  const displayWords = words.slice(0, maxWords);
  
  // Calculate font sizes based on count
  const maxCount = Math.max(...displayWords.map(w => w.count));
  const minCount = Math.min(...displayWords.map(w => w.count));
  const range = maxCount - minCount || 1;
  
  const getFontSize = (count: number) => {
    const normalized = (count - minCount) / range;
    return 0.75 + normalized * 2; // Font size between 0.75rem and 2.75rem
  };
  
  const getOpacity = (count: number) => {
    const normalized = (count - minCount) / range;
    return 0.6 + normalized * 0.4; // Opacity between 0.6 and 1
  };
  
  const getColor = (count: number) => {
    const normalized = (count - minCount) / range;
    if (normalized > 0.7) return "text-blue-600 dark:text-blue-400";
    if (normalized > 0.4) return "text-indigo-600 dark:text-indigo-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center items-center min-h-[200px] p-4">
          {displayWords.map((item, index) => (
            <span
              key={index}
              className={`inline-block px-2 py-1 transition-all hover:scale-110 cursor-default ${getColor(item.count)}`}
              style={{
                fontSize: `${getFontSize(item.count)}rem`,
                opacity: getOpacity(item.count),
              }}
              title={`${item.word}: ${item.count} kez`}
            >
              {item.word}
            </span>
          ))}
          {displayWords.length === 0 && (
            <p className="text-gray-500 text-center">Henüz kelime verisi bulunmuyor</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
