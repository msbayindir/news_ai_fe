"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, FileText, TrendingUp, Eye } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Report, ReportHistory } from "@/lib/api";

interface ReportCardProps {
  report: Report | ReportHistory;
  onViewDetails?: (id: string) => void;
  showFullContent?: boolean;
}

export function ReportCard({ report, onViewDetails, showFullContent = false }: ReportCardProps) {
  const isFullReport = 'summary' in report;
  
  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Günlük Rapor';
      case 'weekly':
        return 'Haftalık Rapor';
      case 'monthly':
        return 'Aylık Rapor';
      default:
        return 'Rapor';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'weekly':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'monthly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {getReportTypeLabel(report.type)}
          </CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}>
            {report.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Başlangıç</p>
              <p className="font-medium">
                {format(new Date(report.startDate), "d MMMM yyyy", { locale: tr })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Bitiş</p>
              <p className="font-medium">
                {format(new Date(report.endDate), "d MMMM yyyy", { locale: tr })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            <span className="font-semibold">{report.articleCount}</span> haber analiz edildi
          </span>
        </div>

        {isFullReport && showFullContent && (
          <>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Özeti
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {(report as Report).summary}
              </div>
            </div>

            {(report as Report).analysis && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Kaynak Dağılımı</h4>
                <div className="space-y-2">
                  {Object.entries((report as Report).analysis.sourceDistribution).map(([source, count]) => (
                    <div key={source} className="flex justify-between text-sm">
                      <span>{source}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {onViewDetails && (
          <Button
            onClick={() => onViewDetails(report.id)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Detayları Görüntüle
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
