'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
              <Search className='w-8 h-8 text-red-600' />
            </div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              ページが見つかりません
            </CardTitle>
            <p className='text-gray-600 mt-2'>
              お探しのページは存在しないか、移動または削除された可能性があります。
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center'>
              <div className='text-6xl font-bold text-gray-300 mb-2'>404</div>
              <p className='text-sm text-gray-500'>Not Found</p>
            </div>

            <div className='space-y-3'>
              <Link href='/' className='block'>
                <Button className='w-full' size='lg'>
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
