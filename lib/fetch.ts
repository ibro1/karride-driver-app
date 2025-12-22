import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const fullUrl = url.startsWith("/") ? `${API_URL}${url}` : url;

    // Get session token for authenticated requests
    const token = await SecureStore.getItemAsync("session_token");
    console.log("fetchAPI: Token exists:", !!token);

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

    console.log("fetchAPI: Making request to", fullUrl);
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log("fetchAPI: Response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
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
