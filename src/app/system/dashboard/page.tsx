import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Building, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default function SystemDashboardPage() {
  return (
    <AuthGuard requiredRole='system_admin'>
      <div className='container mx-auto py-6'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>システム管理ダッシュボード</h1>
          <p className='text-gray-600 mt-2'>システム全体の管理を行います</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                総ユーザー数
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>156</div>
              <p className='text-xs text-muted-foreground'>+12% 先月比</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>登録施設数</CardTitle>
              <Building className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>8</div>
              <p className='text-xs text-muted-foreground'>+2 今月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                アクティブセッション
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>42</div>
              <p className='text-xs text-muted-foreground'>+8% 先月比</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                システム状態
              </CardTitle>
              <Settings className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>正常</div>
              <p className='text-xs text-muted-foreground'>稼働率 99.9%</p>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Link href='/system/users'>
                <Button className='w-full justify-start' variant='outline'>
                  <Users className='mr-2 h-4 w-4' />
                  ユーザー管理
                </Button>
              </Link>
              <Button className='w-full justify-start' variant='outline'>
                <Building className='mr-2 h-4 w-4' />
                施設管理
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Settings className='mr-2 h-4 w-4' />
                システム設定
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      新しいユーザーが登録されました
                    </p>
                    <p className='text-xs text-gray-500'>2時間前</p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      施設設定が更新されました
                    </p>
                    <p className='text-xs text-gray-500'>4時間前</p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      システムメンテナンスが完了しました
                    </p>
                    <p className='text-xs text-gray-500'>1日前</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
