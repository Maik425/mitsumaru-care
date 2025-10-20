'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, LogIn, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center'>
              <Shield className='w-8 h-8 text-yellow-600' />
            </div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              アクセス権限がありません
            </CardTitle>
            <p className='text-gray-600 mt-2'>
              このページにアクセスするには適切な権限が必要です。
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center'>
              <div className='text-6xl font-bold text-gray-300 mb-2'>403</div>
              <p className='text-sm text-gray-500'>Forbidden</p>
            </div>

            <div className='space-y-3'>
              <Link href='/login' className='block'>
                <Button className='w-full' size='lg'>
                  <LogIn className='w-4 h-4 mr-2' />
                  ログインする
                </Button>
              </Link>

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
                権限についてご不明な点がございましたら、システム管理者にお問い合わせください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
