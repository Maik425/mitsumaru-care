'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InlineLoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './auth-provider';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  // 開発用テストアカウント情報
  const testAccounts = [
    {
      role: 'システム管理者',
      email: 'admin@mitsumaru-care.com',
      password: 'password123',
      description: '全システムの管理、ユーザー管理が可能',
    },
    {
      role: '施設管理者',
      email: 'facility1@mitsumaru-care.com',
      password: 'password123',
      description: '施設内の業務管理が可能',
    },
    {
      role: '一般ユーザー',
      email: 'user1@mitsumaru-care.com',
      password: 'password123',
      description: '基本的な利用者機能のみ利用可能',
    },
  ];

  const fillTestAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Login form: Starting login process for:', email);
      const result = await signIn(email, password);
      console.log('Login form: Sign in result:', result);

      if (result.success && result.user) {
        console.log(
          'Login form: Login successful, redirecting to:',
          result.user.role
        );
        // ロールに基づいてリダイレクト
        switch (result.user.role) {
          case 'system_admin':
            console.log('Login form: Redirecting to system dashboard');
            router.push('/system/dashboard');
            break;
          case 'facility_admin':
            console.log('Login form: Redirecting to facility dashboard');
            router.push('/facility/dashboard');
            break;
          case 'user':
            console.log('Login form: Redirecting to user dashboard');
            router.push('/user/dashboard');
            break;
          default:
            console.log('Login form: Redirecting to default user dashboard');
            router.push('/user/dashboard');
        }
      } else {
        console.error('Login form: Login failed:', result.error);
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login form error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'ログイン中にエラーが発生しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl text-center'>ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='email'>メールアドレス</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>パスワード</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <InlineLoadingSpinner size='sm' />
                ログイン中
              </div>
            ) : (
              'ログイン'
            )}
          </Button>
        </form>

        {/* 開発用テストアカウント情報 */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Separator className='my-6' />
            <div className='space-y-4'>
              <div className='text-center'>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  開発用テストアカウント
                </h3>
                <p className='text-xs text-gray-500'>
                  クリックで自動入力されます
                </p>
              </div>

              <div className='space-y-3'>
                {testAccounts.map((account, index) => (
                  <div
                    key={index}
                    className='p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors'
                    onClick={() =>
                      fillTestAccount(account.email, account.password)
                    }
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-sm font-medium text-gray-900'>
                            {account.role}
                          </span>
                          <span className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full'>
                            {account.email}
                          </span>
                        </div>
                        <p className='text-xs text-gray-600'>
                          {account.description}
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='ml-2 text-xs'
                        onClick={e => {
                          e.stopPropagation();
                          fillTestAccount(account.email, account.password);
                        }}
                      >
                        選択
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className='text-center'>
                <p className='text-xs text-gray-500'>パスワード: password123</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
