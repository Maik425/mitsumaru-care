'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TwoFactorAuth() {
  const [authCode, setAuthCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // テスト用の簡単な2FA認証
      if (authCode === '123456') {
        // 認証成功
        router.push('/admin/dashboard');
      } else {
        setError('認証コードが正しくありません。');
      }
    } catch (err) {
      setError('認証処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            二要素認証
          </h1>
          <h2 className="mt-6 text-center text-xl font-medium text-gray-900">
            認証コードを入力してください
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            認証アプリに表示される6桁のコードを入力してください
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="auth-code" className="sr-only">
              認証コード
            </label>
            <input
              id="auth-code"
              name="auth-code"
              type="text"
              autoComplete="off"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || authCode.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '認証中...' : '認証'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              別のアカウントでログイン
            </button>
          </div>
        </form>

        {/* テスト用情報 */}
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">テスト用認証コード</h3>
          <div className="text-xs text-gray-600">
            <div>認証コード: 123456</div>
          </div>
        </div>
      </div>
    </div>
  );
}
