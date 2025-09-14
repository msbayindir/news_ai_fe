"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { WordCloud } from "./word-cloud";
import { ReportCard } from "./report-card";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  BarChart3,
  RefreshCw,
  Download,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function AnalyticsDashboard() {
  const [selectedReportType, setSelectedReportType] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch word frequency
  const {
    data: wordFrequency,
    isLoading: wordFreqLoading,
    refetch: refetchWordFreq,
  } = useQuery({
    queryKey: ["wordFrequency"],
    queryFn: analyticsApi.getLatestWordFrequency,
  });

  // Fetch latest report
  const {
    data: latestReport,
    isLoading: reportLoading,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ["latestReport", selectedReportType],
    queryFn: () => analyticsApi.getLatestReport(selectedReportType),
  });

  // Fetch report history
  const { data: reportHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["reportHistory", selectedReportType],
    queryFn: () => analyticsApi.getReportHistory(selectedReportType, 10),
  });

  // Fetch specific report details
  const { data: reportDetails } = useQuery({
    queryKey: ["reportDetails", selectedReportId],
    queryFn: () =>
      selectedReportId ? analyticsApi.getReportById(selectedReportId) : null,
    enabled: !!selectedReportId,
  });

  // Generate word frequency mutation
  const generateWordFreqMutation = useMutation({
    mutationFn: () => analyticsApi.generateWordFrequency(50),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wordFrequency"] });
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (type: "daily" | "weekly" | "monthly") =>
      analyticsApi.generateReport(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latestReport"] });
      queryClient.invalidateQueries({ queryKey: ["reportHistory"] });
    },
  });

  const handleGenerateWordFrequency = () => {
    generateWordFreqMutation.mutate(); // Use 50 articles for Gemini xanalysis
  };

  const handleGenerateReport = (type: "daily" | "weekly" | "monthly") => {
    generateReportMutation.mutate(type);
  };

  const handleViewReportDetails = (id: string) => {
    setSelectedReportId(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Haber analizleri ve raporlar
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetchWordFreq()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Word Frequency Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gemini AI Kelime Analizi
            </CardTitle>
            <Button
              onClick={handleGenerateWordFrequency}
              disabled={generateWordFreqMutation.isPending}
              size="sm"
            >
              {generateWordFreqMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yeni Analiz
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {wordFreqLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : wordFrequency?.data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {wordFrequency.data.articleCount} haber Gemini AI ile analiz
                  edildi
                </span>
                <span>
                  {format(
                    new Date(wordFrequency.data.createdAt),
                    "d MMMM yyyy HH:mm",
                    { locale: tr }
                  )}
                </span>
              </div>
              <WordCloud
                words={wordFrequency.data.words}
                title="Gemini AI Kelime Analizi"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>Henüz kelime frekansı analizi yapılmamış</p>
              <Button
                onClick={handleGenerateWordFrequency}
                className="mt-4"
                size="sm"
              >
                İlk Analizi Başlat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            AI Raporları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedReportType}
            onValueChange={(v) =>
              setSelectedReportType(v as "daily" | "weekly" | "monthly")
            }
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="daily">Günlük</TabsTrigger>
                <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                <TabsTrigger value="monthly">Aylık</TabsTrigger>
              </TabsList>
              <Button
                onClick={() => handleGenerateReport(selectedReportType)}
                disabled={generateReportMutation.isPending}
                size="sm"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rapor Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Yeni Rapor Oluştur
                  </>
                )}
              </Button>
            </div>

            <TabsContent value={selectedReportType} className="space-y-4">
              {reportLoading || historyLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Latest Report */}
                  {latestReport?.data && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        En Son Rapor
                      </h3>
                      <ReportCard
                        report={latestReport.data}
                        onViewDetails={handleViewReportDetails}
                        showFullContent={true}
                      />
                    </div>
                  )}

                  {/* Report History */}
                  {reportHistory?.data && reportHistory.data.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Rapor Geçmişi
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {reportHistory.data.map((report) => (
                          <ReportCard
                            key={report.id}
                            report={report}
                            onViewDetails={handleViewReportDetails}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!latestReport?.data &&
                    (!reportHistory?.data ||
                      reportHistory.data.length === 0) && (
                      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <AlertCircle className="h-12 w-12 mb-4" />
                        <p>
                          Henüz{" "}
                          {selectedReportType === "daily"
                            ? "günlük"
                            : selectedReportType === "weekly"
                            ? "haftalık"
                            : "aylık"}{" "}
                          rapor oluşturulmamış
                        </p>
                        <Button
                          onClick={() =>
                            handleGenerateReport(selectedReportType)
                          }
                          className="mt-4"
                          size="sm"
                        >
                          İlk Raporu Oluştur
                        </Button>
                      </div>
                    )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Details Modal/Dialog */}
      {selectedReportId && reportDetails?.data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rapor Detayları</CardTitle>
              <Button
                onClick={() => setSelectedReportId(null)}
                variant="ghost"
                size="sm"
              >
                Kapat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ReportCard report={reportDetails.data} showFullContent={true} />
            {reportDetails.data.wordCloud && (
              <div className="mt-4">
                <WordCloud
                  words={reportDetails.data.wordCloud}
                  title="Dönem Kelime Bulutu"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
