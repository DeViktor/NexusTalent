'use client';

import { useEffect, useState } from 'react';

export type AppUser = {
  id: string;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
};

type SessionResponse =
  | { ok: true; user: { id: string; email: string; displayName?: string | null; photoURL?: string | null; role?: string } }
  | { ok: false; error?: string };

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsUserLoading(true);
        setUserError(null);
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!mounted) return;
        if (!res.ok) {
          setUser(null);
          return;
        }
        const payload = (await res.json()) as SessionResponse;
        if (!mounted) return;
        if (!payload || payload.ok !== true || !('user' in payload) || !payload.user?.id) {
          setUser(null);
          return;
        }
        const u = payload.user;
        setUser({
          id: u.id,
          uid: u.id,
          email: u.email,
          displayName: u.displayName ?? null,
          photoURL: u.photoURL ?? null,
          role: u.role,
        });
      } catch (e: any) {
        if (!mounted) return;
        setUser(null);
        setUserError(e?.message || 'Erro ao carregar sessão');
      } finally {
        if (mounted) setIsUserLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, isUserLoading, userError };
}

