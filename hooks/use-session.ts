import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  role: string;
  email: string;
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // セッション情報の確認
    const checkSession = () => {
      const role = localStorage.getItem('userRole');
      const email = localStorage.getItem('userEmail');
      const lastActivity = localStorage.getItem('lastActivity');

      if (!role || !email) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // セッションタイムアウトチェック（30分）
      if (lastActivity) {
        const now = Date.now();
        const lastActivityTime = parseInt(lastActivity);
        const timeout = 30 * 60 * 1000; // 30分

        if (now - lastActivityTime > timeout) {
          // セッションタイムアウト
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('lastActivity');
          setUser(null);
          setIsLoading(false);
          router.push('/?timeout=true');
          return;
        }
      }

      // アクティビティ時刻を更新
      localStorage.setItem('lastActivity', Date.now().toString());
      setUser({ role, email });
      setIsLoading(false);
    };

    checkSession();

    // アクティビティ監視
    const updateActivity = () => {
      if (user) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    // ユーザーアクティビティを監視
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // 定期的なセッションチェック
    const interval = setInterval(checkSession, 60000); // 1分ごと

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(interval);
    };
  }, [user, router]);

  const login = (role: string, email: string) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('lastActivity', Date.now().toString());
    setUser({ role, email });
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastActivity');
    setUser(null);
    router.push('/');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const hasRole = (requiredRole: string) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const hasAnyRole = (requiredRoles: string[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasAnyRole,
  };
}
