'use client';

import { ArrowLeft, Plus, Edit, Trash2, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AccountsManagement() {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: '田中 太郎',
      email: 'tanaka@mitsumaru.com',
      role: '管理者',
      position: '介護福祉士',
      status: 'active',
      lastLogin: '2024-02-01 09:30',
    },
    {
      id: 2,
      name: '佐藤 花子',
      email: 'sato@mitsumaru.com',
      role: '一般ユーザー',
      position: '看護師',
      status: 'active',
      lastLogin: '2024-02-01 08:45',
    },
    {
      id: 3,
      name: '鈴木 次郎',
      email: 'suzuki@mitsumaru.com',
      role: '一般ユーザー',
      position: '介護士',
      status: 'inactive',
      lastLogin: '2024-01-28 17:20',
    },
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    position: '',
  });

  const roles = ['管理者', '一般ユーザー'];
  const positions = ['介護福祉士', '看護師', '介護士', '管理者'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800'>有効</Badge>;
      case 'inactive':
        return <Badge className='bg-gray-100 text-gray-800'>無効</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case '管理者':
        return <Badge className='bg-blue-100 text-blue-800'>管理者</Badge>;
      case '一般ユーザー':
        return (
          <Badge className='bg-orange-100 text-orange-800'>一般ユーザー</Badge>
        );
      default:
        return null;
    }
  };

  const handleSave = () => {
    // 実際の実装では、ここでAPIを呼び出してデータを保存
    setFormData({ name: '', email: '', password: '', role: '', position: '' });
  };

  const toggleAccountStatus = (id: number) => {
    setAccounts(
      accounts.map(account =>
        account.id === id
          ? {
              ...account,
              status: account.status === 'active' ? 'inactive' : 'active',
            }
          : account
      )
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16'>
            <Link href='/facility/dashboard'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className='text-xl font-semibold text-gray-900 ml-4'>
              ログインアカウント登録
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Plus className='h-5 w-5 mr-2' />
                  新しいアカウント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='name'>氏名</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='例: 田中 太郎'
                    />
                  </div>
                  <div>
                    <Label htmlFor='email'>メールアドレス</Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder='例: tanaka@mitsumaru.com'
                    />
                  </div>
                  <div>
                    <Label htmlFor='password'>パスワード</Label>
                    <div className='relative'>
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder='パスワードを入力'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='role'>権限</Label>
                    <Select
                      value={formData.role}
                      onValueChange={value =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='権限を選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='position'>役職</Label>
                    <Select
                      value={formData.position}
                      onValueChange={value =>
                        setFormData({ ...formData, position: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='役職を選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map(position => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSave} className='w-full'>
                    アカウント作成
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <User className='h-5 w-5 mr-2' />
                  登録済みアカウント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {accounts.map(account => (
                    <div
                      key={account.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <h3 className='font-medium'>{account.name}</h3>
                          <p className='text-sm text-gray-600'>
                            {account.email}
                          </p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getStatusBadge(account.status)}
                          <div className='flex space-x-1'>
                            <Button size='sm' variant='ghost'>
                              <Edit className='h-3 w-3' />
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='text-red-600'
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {getRoleBadge(account.role)}
                          <Badge variant='outline'>{account.position}</Badge>
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => toggleAccountStatus(account.id)}
                          className={
                            account.status === 'active'
                              ? 'text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                              : 'text-green-600 border-green-600 hover:bg-green-50 bg-transparent'
                          }
                        >
                          {account.status === 'active' ? '無効化' : '有効化'}
                        </Button>
                      </div>
                      <p className='text-xs text-gray-500 mt-2'>
                        最終ログイン: {account.lastLogin}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
