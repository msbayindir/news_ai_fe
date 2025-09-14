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


  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (type: "daily" | "weekly" | "monthly") =>
      analyticsApi.generateReport(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latestReport"] });
      queryClient.invalidateQueries({ queryKey: ["reportHistory"] });
    },
  });


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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Haber analizleri ve raporlar
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetchReport()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
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
                      <h3 className="text-lg font-semibold mb-3 text-black">
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
                      <h3 className="text-lg font-semibold mb-3 text-black">
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
