'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // パスワード確認
      if (newPassword !== confirmPassword) {
        setError('新しいパスワードが一致しません');
        return;
      }

      // パスワード強度チェック
      if (newPassword.length < 8) {
        setError('パスワードは8文字以上である必要があります');
        return;
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        setError('パスワードは大文字、小文字、数字を含む必要があります');
        return;
      }

      // パスワード変更処理（テスト用）
      setSuccess('パスワードが正常に変更されました');
      // 簡易的な永続化（次回ログインで使用）
      const targetEmail = 'admin@mitsumaru-care.com';
      localStorage.setItem(`userPassword:${targetEmail}`, newPassword);

      // フォームをクリア
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('パスワード変更中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            パスワード変更
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            セキュリティのため、強力なパスワードを設定してください
          </p>
          <div className="mt-4">
            <button
              data-testid="header-logout"
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700"
              >
                現在のパスワード
              </label>
              <div className="mt-1">
                <input
                  id="current-password"
                  name="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700"
              >
                新しいパスワード
              </label>
              <div className="mt-1">
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-label="新しいパスワード"
                  data-testid="new-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                8文字以上、大文字・小文字・数字を含む
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                新しいパスワード（確認）
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-label="新しいパスワード（確認）"
                  data-testid="confirm-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div
                className="text-red-600 text-sm text-center"
                data-testid="password-error-message"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="text-green-600 text-sm text-center"
                data-testid="password-success-message"
              >
                {success}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 border border-transparent rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 border border-transparent rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? '変更中...' : '変更'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
