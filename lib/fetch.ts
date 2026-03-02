import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./config";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    if (!API_URL) {
      console.error("[FETCH_API] API_URL is not configured");
      throw new Error("Unable to connect to server. Please try again later.");
    }

    const fullUrl = url.startsWith("/") ? `${API_URL}${url}` : url;
    console.log(`[FETCH_API] URL: ${fullUrl}`);

    // Get session token for authenticated requests
    const token = await SecureStore.getItemAsync("session_token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add existing headers
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }

    // Add auth header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FETCH_API] HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("[FETCH_API] Error:", error.message);
    throw error;
  }
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      // Handle both { data: ... } and flat responses
      setData('data' in result ? result.data : result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
