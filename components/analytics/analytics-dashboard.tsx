"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { WordCloud } from "./word-cloud";
import { ReportCard } from "./report-card";
import { EnhancedReportCard } from "./enhanced-report-card";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Download, Calendar, Loader2 } from "lucide-react";

export function AnalyticsDashboard() {
  const [selectedReportType, setSelectedReportType] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Manual refresh için
  const queryClient = useQueryClient();

  // Fetch latest report
  const {
    data: latestReport,
    isLoading: reportLoading,
    refetch: refetchLatest,
  } = useQuery({
    queryKey: ["latestReport", selectedReportType, refreshKey],
    queryFn: () => analyticsApi.getLatestReport(selectedReportType),
    staleTime: 0, // Production için cache'i hemen stale yap
    gcTime: 1000 * 60 * 5, // 5 dakika garbage collection
    refetchOnWindowFocus: true, // Production'da window focus'ta refetch
    refetchOnMount: true, // Mount'ta her zaman refetch
  });

  // Fetch report history
  const { isLoading: historyLoading } = useQuery({
    queryKey: ["reportHistory", selectedReportType],
    queryFn: () => analyticsApi.getReportHistory(selectedReportType, 10),
    staleTime: 1000 * 60 * 2, // 2 dakika fresh
    gcTime: 1000 * 60 * 10, // 10 dakika garbage collection
  });

  // Fetch specific report details
  const { data: reportDetails } = useQuery({
    queryKey: ["reportDetails", selectedReportId],
    queryFn: () =>
      selectedReportId ? analyticsApi.getReportById(selectedReportId) : null,
    enabled: !!selectedReportId,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (type: "daily" | "weekly" | "monthly") =>
      analyticsApi.generateReport(type),
    onSuccess: async (data, variables) => {
      // variables = generate edilen rapor türü
      const reportType = variables;

      console.log("🚀 Report generated successfully for:", reportType);

      // 1. Refresh key'i değiştir - bu query'i yeniden çalıştırır
      setRefreshKey((prev) => prev + 1);

      // 2. Manuel refetch de tetikle
      setTimeout(() => {
        refetchLatest();
      }, 500);

      console.log("✅ Manual refresh triggered");
    },
    onError: (error) => {
      console.error("❌ Report generation failed:", error);
    },
  });

  const handleGenerateReport = async (type: "daily" | "weekly" | "monthly") => {
    console.log("🎯 Generating report for type:", type);
    console.log("🎯 Current selectedReportType:", selectedReportType);

    // Eğer farklı bir tip seçilmişse, önce onu güncelle
    if (type !== selectedReportType) {
      setSelectedReportType(type);
      console.log("🔄 Report type updated to:", type);
    }

    generateReportMutation.mutate(type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Haber analizleri ve raporlar</p>
        </div>
      </div>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-black">
              <TabsList>
                <TabsTrigger value="daily">Günlük</TabsTrigger>
                <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                <TabsTrigger value="monthly">Aylık</TabsTrigger>
              </TabsList>
              <Button
                onClick={() => handleGenerateReport(selectedReportType)}
                disabled={generateReportMutation.isPending}
                size="sm"
                className="w-full sm:w-auto"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-black" />
                    <span className="hidden sm:inline">
                      Rapor Oluşturuluyor...
                    </span>
                    <span className="sm:hidden">Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2 text-black" />
                    <span className="hidden sm:inline">Yeni Rapor Oluştur</span>
                    <span className="sm:hidden">Yeni Rapor</span>
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
                      <h3 className="text-lg font-semibold mb-3 text-black">
                        En Son Rapor
                      </h3>
                      <EnhancedReportCard report={latestReport.data} />
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
            <EnhancedReportCard report={reportDetails.data} />
            {reportDetails.data.wordCloud && (
              <div className="mt-6">
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
