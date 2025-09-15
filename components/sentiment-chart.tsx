"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function SentimentChart() {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["latest-report"],
    queryFn: () => analyticsApi.getLatestReport("daily"),
  });

  // Extract sentiment data from report summary using regex
  const extractSentimentData = (summary: string) => {
    const jsonRegex = /```json\s*\n?\s*{\s*"positive":\s*(\d+),\s*"negative":\s*(\d+),\s*"nötr":\s*(\d+)\s*}\s*```/;
    const match = summary?.match(jsonRegex);
    
    if (match) {
      return {
        positive: parseInt(match[1]),
        negative: parseInt(match[2]),
        neutral: parseInt(match[3])
      };
    }
    return null;
  };

  const sentimentData = reportData?.data?.summary 
    ? extractSentimentData(reportData.data.summary)
    : null;

  const chartData = sentimentData ? [
    { name: "Pozitif", value: sentimentData.positive, color: "#10B981" },
    { name: "Negatif", value: sentimentData.negative, color: "#EF4444" },
    { name: "Nötr", value: sentimentData.neutral, color: "#6B7280" }
  ] : [];

  const total = sentimentData 
    ? sentimentData.positive + sentimentData.negative + sentimentData.neutral
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Haber Duygu Analizi</h3>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sentimentData || total === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Haber Duygu Analizi</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Veri bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Haber Duygu Analizi
      </h3>
      
      {/* Chart */}
      <div className="h-32 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} haber`, 'Miktar']}
              labelFormatter={(label) => `${label} Haberler`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Pozitif</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="font-medium text-gray-900">{sentimentData.positive}</span>
            <span className="text-gray-500">({Math.round((sentimentData.positive / total) * 100)}%)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Negatif</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-500" />
            <span className="font-medium text-gray-900">{sentimentData.negative}</span>
            <span className="text-gray-500">({Math.round((sentimentData.negative / total) * 100)}%)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-600">Nötr</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-gray-500" />
            <span className="font-medium text-gray-900">{sentimentData.neutral}</span>
            <span className="text-gray-500">({Math.round((sentimentData.neutral / total) * 100)}%)</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-500 text-center">
          Toplam {total} haber analiz edildi
        </div>
      </div>
    </div>
  );
}
