'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  const [timeoutMessage, setTimeoutMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // URLパラメータからメッセージを確認
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('timeout') === 'true') {
      setTimeoutMessage('セッションが期限切れです。再度ログインしてください。');
    }
    if (urlParams.get('error') === 'insufficient_permissions') {
      setError(
        'アクセス権限がありません。適切な権限を持つアカウントでログインしてください。'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            みつまるケア
          </h1>
          <p className="text-gray-600">介護業務効率化サービス</p>
        </div>

        {timeoutMessage && (
          <div className="text-blue-600 text-sm text-center mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md" data-testid="session-timeout-message">
            {timeoutMessage}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center mb-4 p-3 bg-red-50 border border-red-200 rounded-md" data-testid="permission-error-message">
            {error}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
