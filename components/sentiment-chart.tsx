"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

export function SentimentChart() {
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["latest-report", reportType],
    queryFn: () => analyticsApi.getLatestReport(reportType),
  });

  // Extract sentiment data from report summary JSON
  const extractSentimentData = (summary: string) => {
    try {
      const parsed = JSON.parse(summary);
      if (parsed.statistics) {
        return {
          positive: parsed.statistics.positive || 0,
          negative: parsed.statistics.negative || 0,
          neutral: parsed.statistics.neutral || 0,
        };
      }
    } catch (error) {
      console.error("Summary parsing error:", error);
    }
    return null;
  };

  const sentimentData = reportData?.data?.summary
    ? extractSentimentData(reportData.data.summary)
    : null;

  const chartData = sentimentData
    ? [
        { name: "Pozitif", value: sentimentData.positive, color: "#10B981" },
        { name: "Negatif", value: sentimentData.negative, color: "#EF4444" },
        { name: "Nötr", value: sentimentData.neutral, color: "#6B7280" },
      ]
    : [];

  const total = sentimentData
    ? sentimentData.positive + sentimentData.negative + sentimentData.neutral
    : 0;

  const getReportTypeLabel = (type: "weekly" | "monthly") => {
    switch (type) {
      case "weekly":
        return "Haftalık";
      case "monthly":
        return "Aylık";
      default:
        return "Haftalık";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Duygu Analizi
          </h3>
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sentimentData || total === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Duygu Analizi
          </h3>
          <select
            value={reportType}
            onChange={(e) =>
              setReportType(e.target.value as "weekly" | "monthly")
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
          >
            <option value="weekly">Haftalık</option>
            <option value="monthly">Aylık</option>
          </select>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Henüz analiz edilmiş veri bulunmuyor
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Yeni rapor oluşturmayı deneyin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Haber Duygu Analizi
        </h3>
        <select
          value={reportType}
          onChange={(e) =>
            setReportType(e.target.value as "weekly" | "monthly")
          }
          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-black ml-1"
        >
          <option value="weekly">Haftalık</option>
          <option value="monthly">Aylık</option>
        </select>
      </div>

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
              formatter={(value: number) => [`${value} haber`, "Miktar"]}
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
            <span className="font-medium text-gray-900">
              {sentimentData.positive}
            </span>
            <span className="text-gray-500">
              ({Math.round((sentimentData.positive / total) * 100)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Negatif</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-500" />
            <span className="font-medium text-gray-900">
              {sentimentData.negative}
            </span>
            <span className="text-gray-500">
              ({Math.round((sentimentData.negative / total) * 100)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-600">Nötr</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-gray-500" />
            <span className="font-medium text-gray-900">
              {sentimentData.neutral}
            </span>
            <span className="text-gray-500">
              ({Math.round((sentimentData.neutral / total) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-500 text-center">
          {getReportTypeLabel(reportType)} - Toplam {total} haber analiz edildi
        </div>
      </div>
    </div>
  );
}
