'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { geminiApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Brain, Calendar, Loader2, FileText, Clock } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AI Haber Özetleme</h1>
        </div>

        {/* Summary Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Özet Oluştur</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={setLastWeek}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Son 7 Gün
            </button>
            <button
              onClick={setLastMonth}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Son 30 Gün
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Özel Prompt (İsteğe bağlı)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Örn: Ekonomi haberlerine odaklan, spor haberlerini özetle..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={3}
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={summarizeMutation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {summarizeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Özet Oluşturuluyor...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Özet Oluştur
              </>
            )}
          </button>
        </div>

        {/* Current Summary */}
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              AI Özeti
            </h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{summary}</div>
            </div>
          </div>
        )}

        {/* Previous Summaries */}
        {summariesData?.data?.summaries && summariesData.data.summaries.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Geçmiş Özetler
            </h2>
            
            <div className="space-y-4">
              {summariesData.data.summaries.map((item: any) => (
                <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{item._count.articles} haber</span>
                  </div>
                  <p className="text-gray-700 line-clamp-3">{item.content}</p>
                  <button
                    onClick={() => setSummary(item.content)}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                  >
                    Tamamını Göster
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
