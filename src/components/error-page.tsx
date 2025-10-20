'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorPageProps {
  title: string;
  description: string;
  errorCode: string;
  errorMessage: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorPage({
  title,
  description,
  errorCode,
  errorMessage,
  showRetry = false,
  onRetry,
}: ErrorPageProps) {
  useEffect(() => {
    // エラーログをコンソールに出力
    console.error('Error Page:', {
      title,
      description,
      errorCode,
      errorMessage,
    });
  }, [title, description, errorCode, errorMessage]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
              <AlertTriangle className='w-8 h-8 text-red-600' />
            </div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              {title}
            </CardTitle>
            <p className='text-gray-600 mt-2'>{description}</p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center'>
              <div className='text-6xl font-bold text-gray-300 mb-2'>
                {errorCode}
              </div>
              <p className='text-sm text-gray-500'>{errorMessage}</p>
            </div>

            <div className='space-y-3'>
              {showRetry && onRetry && (
                <Button className='w-full' size='lg' onClick={onRetry}>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  再試行
                </Button>
              )}

              <Link href='/' className='block'>
                <Button variant='outline' className='w-full' size='lg'>
                  <Home className='w-4 h-4 mr-2' />
                  ホームに戻る
                </Button>
              </Link>

              <Button
                variant='outline'
                className='w-full'
                size='lg'
                onClick={() => window.history.back()}
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                前のページに戻る
              </Button>
            </div>

            <div className='text-center pt-4 border-t'>
              <p className='text-xs text-gray-500'>
                問題が解決しない場合は、システム管理者にお問い合わせください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
