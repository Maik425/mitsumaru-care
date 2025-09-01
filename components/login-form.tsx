'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const router = useRouter();

  useEffect(() => {
    // ログイン試行回数を復元
    const attempts = localStorage.getItem('loginAttempts');
    if (attempts) {
      const count = parseInt(attempts);
      setLoginAttempts(count);
      if (count >= 5) {
        setIsLocked(true);
        setShowCaptcha(true);
        // 簡単なCAPTCHA問題を生成
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        setCaptchaAnswer((num1 + num2).toString());
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 空入力バリデーション
      const messages: string[] = [];
      if (!email) messages.push('メールアドレスを入力してください');
      if (!password) messages.push('パスワードを入力してください');
      if (messages.length > 0) {
        setError(messages.join('\n'));
        setIsLoading(false);
        return;
      }
      // アカウントロックチェック
      if (isLocked) {
        if (captchaInput !== captchaAnswer) {
          setError('CAPTCHAの答えが正しくありません。');
          setIsLoading(false);
          return;
        }
        // CAPTCHA成功時はロック解除
        setIsLocked(false);
        setShowCaptcha(false);
        setLoginAttempts(0);
        localStorage.removeItem('loginAttempts');
      }

      // テスト用の簡単な認証ロジック（上書き保存されたパスワードを優先）
      const override = localStorage.getItem(`userPassword:${email}`);
      const adminDefault = 'admin123';
      const ownerDefault = 'owner123';
      const employeeDefault = 'employee123';
      const nurseDefault = 'nurse123';

      if (
        email === 'admin@mitsumaru-care.com' &&
        (override ? password === override : password === adminDefault)
      ) {
        // 管理者としてログイン
        localStorage.setItem('userRole', 'ADMIN');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.removeItem('loginAttempts');
        setLoginAttempts(0);
        router.push('/admin/dashboard');
      } else if (
        email === 'employee@mitsumaru-care.com' &&
        (override ? password === override : password === employeeDefault)
      ) {
        // 一般職員としてログイン
        localStorage.setItem('userRole', 'MEMBER');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.removeItem('loginAttempts');
        setLoginAttempts(0);
        router.push('/user/dashboard');
      } else if (
        email === 'owner@mitsumaru-care.com' &&
        (override ? password === override : password === ownerDefault)
      ) {
        // 施設長としてログイン
        localStorage.setItem('userRole', 'OWNER');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.removeItem('loginAttempts');
        setLoginAttempts(0);
        router.push('/admin/dashboard');
      } else if (
        email === 'nurse@mitsumaru-care.com' &&
        (override ? password === override : password === nurseDefault)
      ) {
        // 看護師としてログイン
        localStorage.setItem('userRole', 'MEMBER');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.removeItem('loginAttempts');
        setLoginAttempts(0);
        router.push('/user/dashboard');
      } else {
        // ログイン失敗時の処理
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= 5) {
          setIsLocked(true);
          setShowCaptcha(true);
          // 新しいCAPTCHA問題を生成
          const num1 = Math.floor(Math.random() * 10);
          const num2 = Math.floor(Math.random() * 10);
          setCaptchaAnswer((num1 + num2).toString());
          setError(
            'アカウントが一時的にロックされました。CAPTCHAを完了してください。'
          );
        } else {
          setError(
            '認証に失敗しました。メールアドレスとパスワードを確認してください。'
          );
        }
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
              {error.split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
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
              disabled={isLoading}
            />
          </div>
          {/* CAPTCHA */}
          {showCaptcha && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="text-center mb-3">
                <p className="text-sm text-yellow-800 mb-2">
                  ロボットではないことを確認してください
                </p>
                <div className="text-lg font-mono text-yellow-900 bg-white p-2 rounded border">
                  {captchaAnswer.split('').join(' + ')} = ?
                </div>
              </div>
              <div>
                <Label htmlFor="captcha">CAPTCHA</Label>
                <Input
                  id="captcha"
                  name="captcha"
                  type="text"
                  required
                  className="mt-1"
                  placeholder="答えを入力してください"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>テスト用アカウント</p>
          <p>システム管理者: admin@mitsumaru-care.com / admin123</p>
          <p>施設管理者: owner@mitsumaru-care.com / owner123</p>
          <p>一般職員: employee@mitsumaru-care.com / employee123</p>
          <p>看護師: nurse@mitsumaru-care.com / nurse123</p>
        </div>
      </CardContent>
    </Card>
  );
}
