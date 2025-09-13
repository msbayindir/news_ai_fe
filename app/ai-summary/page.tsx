'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { geminiApi, Summary } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Brain, Calendar, Loader2, FileText, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AISummaryPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');

  const { data: summariesData, refetch: refetchSummaries } = useQuery({
    queryKey: ['summaries'],
    queryFn: () => geminiApi.getSummaries(1, 10),
  });

  const summarizeMutation = useMutation({
    mutationFn: (data: { startDate: string; endDate: string; prompt?: string }) =>
      geminiApi.summarizeArticles(data),
    onSuccess: (data) => {
      setSummary(data.data.summary);
      refetchSummaries();
    },
  });

  const handleSummarize = () => {
    if (!startDate || !endDate) {
      alert('Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }
    
    summarizeMutation.mutate({
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      prompt: customPrompt || undefined,
    });
  };

  // Set default dates (last 7 days)
  const setLastWeek = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setLastMonth = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">AI Haber Özetleme</h1>

          {/* Summary Form */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-800">Yeni Özet Oluştur</h2>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={setLastWeek}
              className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Son 7 Gün
            </button>
            <button
              onClick={setLastMonth}
              className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Son 30 Gün
            </button>
            </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Özel Prompt (Opsiyonel)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Örn: Ekonomi haberlerine odaklan, pozitif gelişmeleri vurgula..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              rows={3}
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={summarizeMutation.isPending}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {summarizeMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Özet Oluşturuluyor...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Özet Oluştur
              </>
            )}
          </button>
        </div>

        {/* Current Summary */}
        {summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5" />
              Oluşturulan Özet
            </h2>
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          </div>
        )}

        {/* Previous Summaries */}
        {summariesData?.data?.summaries && summariesData.data.summaries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Clock className="h-5 w-5" />
              Önceki Özetler
            </h2>
            <div className="space-y-4">
              {summariesData.data.summaries.map((sum: Summary) => (
                <div key={sum.id} className="border-l-2 border-gray-200 pl-4 py-2 hover:border-gray-400 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(sum.createdAt)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{(sum as Summary & { articleCount?: number }).articleCount || sum._count?.articles || 0} haber</span>
                  </div>
                  <div className="text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: (sum.content || '').substring(0, 200) + '...' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
