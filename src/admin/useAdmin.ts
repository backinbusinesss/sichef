import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

export type AdminUser = { email: string; name: string };

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try {
      const data = await api.get<{ authenticated: boolean; user?: AdminUser }>("/api/auth");
      setUser(data.authenticated ? (data.user ?? null) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: AdminUser }>("/api/auth", { email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.delete("/api/auth").catch(() => {});
    setUser(null);
  };

  return { user, loading, login, logout, recheck: check };
}

export function errorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Errore imprevisto.";
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const { upload } = await import("@vercel/blob/client");
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
      const blob = await upload(`menu/${Date.now()}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      return blob.url;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
