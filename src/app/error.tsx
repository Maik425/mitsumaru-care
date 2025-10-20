'use client';

import { ErrorPage } from '@/components/error-page';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログをコンソールに出力
    console.error('Global Error:', error);
  }, [error]);

  return (
    <ErrorPage
      title='予期しないエラーが発生しました'
      description='システムで予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。'
      errorCode='500'
      errorMessage='Internal Server Error'
      showRetry={true}
      onRetry={reset}
    />
  );
}
