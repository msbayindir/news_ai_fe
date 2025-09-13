'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedApi, FeedSource } from '@/lib/api';
import { Rss, Plus, Trash2, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function FeedsPage() {
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const queryClient = useQueryClient();

  const { data: feedsData, isLoading } = useQuery({
    queryKey: ['feeds'],
    queryFn: feedApi.getFeedSources,
  });

  const addFeedMutation = useMutation({
    mutationFn: feedApi.addFeedSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      setNewFeedName('');
      setNewFeedUrl('');
    },
  });

  const deleteFeedMutation = useMutation({
    mutationFn: feedApi.deleteFeedSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });

  const checkFeedMutation = useMutation({
    mutationFn: feedApi.checkSingleFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });

  const checkAllFeedsMutation = useMutation({
    mutationFn: feedApi.checkFeeds,
  });

  const handleAddFeed = () => {
    if (!newFeedName || !newFeedUrl) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }
    addFeedMutation.mutate({ name: newFeedName, url: newFeedUrl });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Rss className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">RSS Kaynakları</h1>
          </div>
          <button
            onClick={() => checkAllFeedsMutation.mutate()}
            disabled={checkAllFeedsMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {checkAllFeedsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kontrol Ediliyor...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Tümünü Kontrol Et
              </>
            )}
          </button>
        </div>

        {/* Add New Feed */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Kaynak Ekle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              placeholder="Kaynak adı (örn: Hürriyet)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
            />
            <input
              type="url"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              placeholder="RSS URL (örn: https://site.com/rss)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
            />
          </div>
          <button
            onClick={handleAddFeed}
            disabled={addFeedMutation.isPending}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addFeedMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ekleniyor...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Kaynak Ekle
              </>
            )}
          </button>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          {feedsData?.data?.map((feed: FeedSource) => (
            <div key={feed.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{feed.name}</h3>
                    {feed.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feed.url}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{feed._count?.articles || 0} haber</span>
                    {feed.lastCheck && (
                      <span>Son kontrol: {formatDate(feed.lastCheck)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => checkFeedMutation.mutate(feed.id)}
                    disabled={checkFeedMutation.isPending}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Kontrol Et"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu kaynağı silmek istediğinize emin misiniz?')) {
                        deleteFeedMutation.mutate(feed.id);
                      }
                    }}
                    disabled={deleteFeedMutation.isPending}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!feedsData?.data || feedsData.data.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Rss className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz RSS kaynağı eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
}
