'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import { validateEmail, validatePassword } from '@/src/lib/validation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // バリデーション
      if (!validateEmail(email)) {
        setError('有効なメールアドレスを入力してください');
        setIsLoading(false);
        return;
      }

      if (!validatePassword(password)) {
        setError('パスワードは8文字以上で入力してください');
        setIsLoading(false);
        return;
      }

      // 認証実行
      const result = await signIn(email, password);

      if (result.success) {
        // 認証成功時のリダイレクト
        if (result.user?.permissions?.includes('SYSTEM_SETTINGS')) {
          router.push('/admin/dashboard');
        } else if (result.user?.permissions?.includes('SHIFT_MANAGEMENT')) {
          router.push('/facility-admin/dashboard');
        } else {
          router.push('/staff/dashboard');
        }
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mitsumaru.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>テスト用アカウント:</p>
          <p>システム管理者: admin@mitsumaru.com</p>
          <p>施設管理者: facility-admin@mitsumaru.com</p>
          <p>一般職員: staff@mitsumaru.com</p>
        </div>
      </CardContent>
    </Card>
  );
}
