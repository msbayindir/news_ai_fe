import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Types
export interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  link: string;
  imageUrl?: string;
  author?: string;
  pubDate?: string;
  guid?: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
  source?: FeedSource;
  categories?: Category[];
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastCheck?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  id: string;
  content: string;
  startDate: string;
  endDate: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

// Old SearchResult interface - keeping for backward compatibility
export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  displayLink: string;
  imageUrl?: string;
  publishedDate?: string;
}

// New Gemini Search interfaces matching backend
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GeminiSearchResult {
  text: string;
  sources: GroundingChunk[];
  searchQueries: string[];
  textWithCitations?: string;
  sourcesCount: number;
}

export interface Statistics {
  totalArticles: number;
  totalSources: number;
  totalCategories: number;
  articlesLast24h: number;
  articlesLast7days: number;
}

export interface PaginatedResponse<T> {
  articles?: T[];
  summaries?: T[];
  history?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleParams {
  page?: number;
  limit?: number;
  sourceId?: string;
  categoryId?: string;
  categoryNames?: string[];
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Article APIs
export const articleApi = {
  getArticles: async (params?: ArticleParams) => {
    // Convert categoryNames array to comma-separated string for query param
    const queryParams = {
      ...params,
      categoryNames: params?.categoryNames?.join(","),
    };
    const response = await api.get("/articles", { params: queryParams });
    return response.data;
  },

  getArticle: async (id: string) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  getLatestArticles: async (limit?: number) => {
    const response = await api.get("/articles/latest", { params: { limit } });
    // Ensure the response format matches the expected structure
    return {
      data: {
        articles: response.data.data || response.data,
        pagination: null,
      },
    };
  },

  getTrendingArticles: async (limit?: number) => {
    const response = await api.get("/articles/trending", { params: { limit } });
    return response.data;
  },

  searchArticles: async (query: string, limit?: number) => {
    const response = await api.get("/articles/search", {
      params: { q: query, limit },
    });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get("/articles/statistics");
    return response.data;
  },
};

// Feed APIs
export const feedApi = {
  getFeedSources: async () => {
    const response = await api.get("/feeds");
    return response.data;
  },

  addFeedSource: async (data: { name: string; url: string }) => {
    const response = await api.post("/feeds", data);
    return response.data;
  },

  updateFeedSource: async (id: string, data: Partial<FeedSource>) => {
    const response = await api.put(`/feeds/${id}`, data);
    return response.data;
  },

  deleteFeedSource: async (id: string) => {
    const response = await api.delete(`/feeds/${id}`);
    return response.data;
  },

  checkFeeds: async () => {
    const response = await api.post("/feeds/check");
    return response.data;
  },

  checkSingleFeed: async (id: string) => {
    const response = await api.post(`/feeds/${id}/check`);
    return response.data;
  },
};

// Gemini APIs
export const geminiApi = {
  summarizeArticles: async (data: {
    startDate: string;
    endDate: string;
    prompt?: string;
  }) => {
    const response = await api.post("/gemini/summarize", data);
    return response.data;
  },

  searchWeb: async (query: string, maxDaysOld: number = 7): Promise<{ success: boolean; data: GeminiSearchResult }> => {
    const response = await api.post("/gemini/search", { query, maxDaysOld });
    return response.data;
  },

  getSummaries: async (page?: number, limit?: number) => {
    const response = await api.get("/gemini/summaries", {
      params: { page, limit },
    });
    return response.data;
  },

  getSearchHistory: async (page?: number, limit?: number) => {
    const response = await api.get("/gemini/search-history", {
      params: { page, limit },
    });
    return response.data;
  },
};

export default api;
