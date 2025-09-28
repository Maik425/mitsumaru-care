'use client';

import { supabase } from '@/lib/supabase';
import type { AuthUser, UserRole } from '@/lib/types/auth';
import type { PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type RpcUserRecord = {
  id: string;
  email: string | null;
  name: string;
  role: UserRole;
  facility_id: string | null;
  is_active: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    void checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = (await (supabase as any).rpc(
        'public_get_current_user_with_email',
        {
          target_id: userId,
        }
      )) as {
        data: RpcUserRecord[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        console.error('ユーザーデータ取得エラー:', error);
        setUser(null);
        return;
      }

      const userRecord = data?.[0];

      if (userRecord && userRecord.is_active) {
        const authUser: AuthUser = {
          id: userRecord.id,
          email: userRecord.email || '',
          name: userRecord.name,
          role: userRecord.role,
          facility_id: userRecord.facility_id || undefined,
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('ユーザーデータ取得中にエラー:', error);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await fetchUserData(data.user.id);
        return { success: true, user };
      }

      return { success: false, error: 'ログインに失敗しました' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('ログアウト開始');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabaseログアウトエラー:', error);
        throw error;
      }
      console.log('ログアウト成功');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      // エラーが発生してもユーザー状態をクリアしてログインページにリダイレクト
      setUser(null);
      router.push('/login');
    }
  };

  const requireAuth = (requiredRole?: string) => {
    if (loading) return false;
    if (!user) return false;
    if (requiredRole && user.role !== requiredRole) return false;
    return true;
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    requireAuth,
  };
}
