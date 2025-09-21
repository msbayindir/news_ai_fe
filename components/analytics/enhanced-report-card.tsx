"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  TrendingUp,
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Report } from "@/lib/api";

interface EnhancedReportCardProps {
  report: Report;
}

interface ParsedSummary {
  reportTitle?: string;
  period?: {
    type: string;
    startDate: string;
    endDate: string;
    totalArticles: number;
  };
  summary?: {
    generalOverview?: string;
    keyTopics?: string;
    positiveNegativeAnalysis?: string;
    trendAnalysis?: string;
    importantEvents?: string;
  };
  statistics?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  highlights?: string[];
  categories?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  conclusion?: string;
}

export function EnhancedReportCard({ report }: EnhancedReportCardProps) {
  const parsedSummary: ParsedSummary | null = React.useMemo(() => {
    try {
      return JSON.parse(report.summary || "{}");
    } catch {
      return null;
    }
  }, [report.summary]);

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "daily":
        return "Günlük Rapor";
      case "weekly":
        return "Haftalık Rapor";
      case "monthly":
        return "Aylık Rapor";
      default:
        return "Rapor";
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "weekly":
        return "bg-green-50 text-green-700 border-green-200";
      case "monthly":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getSentimentColor = (type: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalSentiments = parsedSummary?.statistics
    ? parsedSummary.statistics.positive +
      parsedSummary.statistics.negative +
      parsedSummary.statistics.neutral
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Report Header */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {parsedSummary?.reportTitle || getReportTypeLabel(report.type)}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                AI destekli haber analizi ve trend raporu
              </p>
            </div>
            <div
              className={`px-3 py-2 rounded-lg border font-medium ${getReportTypeColor(
                report.type
              )}`}
            >
              {getReportTypeLabel(report.type)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Rapor Dönemi</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(report.startDate), "d MMM", { locale: tr })}{" "}
                  -{" "}
                  {format(new Date(report.endDate), "d MMM yyyy", {
                    locale: tr,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Analiz Edilen Haber</p>
                <p className="font-semibold text-gray-900 text-xl">
                  {report.articleCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Kategori Sayısı</p>
                <p className="font-semibold text-gray-900 text-xl">
                  {parsedSummary?.categories?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Overview */}
      {parsedSummary?.summary?.generalOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-black">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Genel Değerlendirme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {parsedSummary.summary.generalOverview}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Topics & Sentiment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Topics */}
        {parsedSummary?.summary?.keyTopics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-black">
                <Target className="h-5 w-5 text-green-600" />
                Anahtar Konular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-sm">
                {parsedSummary.summary.keyTopics}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sentiment Statistics */}
        {parsedSummary?.statistics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-black">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Duygu Analizi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pozitif</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${
                            totalSentiments > 0
                              ? (parsedSummary.statistics.positive /
                                  totalSentiments) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(
                        "positive"
                      )}`}
                    >
                      {parsedSummary.statistics.positive}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Negatif</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${
                            totalSentiments > 0
                              ? (parsedSummary.statistics.negative /
                                  totalSentiments) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(
                        "negative"
                      )}`}
                    >
                      {parsedSummary.statistics.negative}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nötr</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-500 rounded-full"
                        style={{
                          width: `${
                            totalSentiments > 0
                              ? (parsedSummary.statistics.neutral /
                                  totalSentiments) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(
                        "neutral"
                      )}`}
                    >
                      {parsedSummary.statistics.neutral}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Highlights */}
      {parsedSummary?.highlights && parsedSummary.highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-black">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Öne Çıkan Başlıklar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parsedSummary.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                >
                  <MessageSquare className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{highlight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis & Positive/Negative Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {parsedSummary?.summary?.trendAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-black">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Trend Analizi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-sm">
                {parsedSummary.summary.trendAnalysis}
              </p>
            </CardContent>
          </Card>
        )}

        {parsedSummary?.summary?.positiveNegativeAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-black">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Pozitif/Negatif Analiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-sm">
                {parsedSummary.summary.positiveNegativeAnalysis}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Categories */}
      {parsedSummary?.categories && parsedSummary.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-black">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Kategori Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parsedSummary.categories.map((category, index) => (
                <div key={index} className="p-4 bg-teal-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {category.name}
                    </h4>
                    <span className="text-xs text-gray-600">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-teal-700">
                      {category.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Events */}
      {parsedSummary?.summary?.importantEvents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-black">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Önemli Olaylar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {parsedSummary.summary.importantEvents}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conclusion */}
      {parsedSummary?.conclusion && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <Target className="h-5 w-5" />
              Sonuç ve Değerlendirme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 leading-relaxed font-medium">
              {parsedSummary.conclusion}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
