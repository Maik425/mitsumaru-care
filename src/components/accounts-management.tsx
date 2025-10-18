'use client';

import { ArrowLeft, Edit, Eye, EyeOff, Plus, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { api } from '@/lib/trpc';

export function AccountsManagement() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    position: '',
  });

  // tRPCクエリ
  const { data: users, refetch: refetchUsers } = api.users.getUsers.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: positions, refetch: refetchPositions } =
    api.positions.getPositions.useQuery({});

  // tRPCミューテーション
  const createUserMutation = api.users.createUser.useMutation({
    onSuccess: () => {
      toast.success('アカウントが作成されました');
      refetchUsers();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        position: '',
      });
    },
    onError: (error: any) => {
      toast.error(`アカウント作成に失敗しました: ${error.message}`);
    },
  });

  const updateUserMutation = api.users.updateUser.useMutation({
    onSuccess: () => {
      toast.success('アカウントが更新されました');
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(`アカウント更新に失敗しました: ${error.message}`);
    },
  });

  const deleteUserMutation = api.users.deleteUser.useMutation({
    onSuccess: () => {
      toast.success('アカウントが削除されました');
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(`アカウント削除に失敗しました: ${error.message}`);
    },
  });

  const toggleUserStatusMutation = api.users.updateUser.useMutation({
    onSuccess: () => {
      toast.success('アカウントステータスが更新されました');
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(`ステータス更新に失敗しました: ${error.message}`);
    },
  });

  const roles = ['facility_admin', 'user', 'system_admin'];
  const roleLabels = {
    facility_admin: '施設管理者',
    user: '一般ユーザー',
    system_admin: 'システム管理者',
  };

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
      case 'facility_admin':
        return <Badge className='bg-blue-100 text-blue-800'>施設管理者</Badge>;
      case 'user':
        return (
          <Badge className='bg-orange-100 text-orange-800'>一般ユーザー</Badge>
        );
      case 'system_admin':
        return (
          <Badge className='bg-purple-100 text-purple-800'>
            システム管理者
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      toast.error('必須項目を入力してください');
      return;
    }

    createUserMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role as 'facility_admin' | 'user' | 'system_admin',
      facility_id: undefined, // TODO: 施設IDを設定
    });
  };

  const handleDelete = (userId: string) => {
    if (confirm('このアカウントを削除しますか？')) {
      deleteUserMutation.mutate({ id: userId });
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({
      id: userId,
      is_active: !currentStatus,
    });
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
                            {roleLabels[role as keyof typeof roleLabels]}
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
                        {positions?.map((position: any) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name}
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
                  {users?.users?.map((user: any) => (
                    <div
                      key={user.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <h3 className='font-medium'>{user.name}</h3>
                          <p className='text-sm text-gray-600'>{user.email}</p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getStatusBadge(
                            user.is_active ? 'active' : 'inactive'
                          )}
                          <div className='flex space-x-1'>
                            <Button size='sm' variant='ghost'>
                              <Edit className='h-3 w-3' />
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='text-red-600'
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {getRoleBadge(user.role)}
                          {user.position && (
                            <Badge variant='outline'>
                              {user.position.name}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            handleToggleStatus(user.id, user.is_active)
                          }
                          className={
                            user.is_active
                              ? 'text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                              : 'text-green-600 border-green-600 hover:bg-green-50 bg-transparent'
                          }
                        >
                          {user.is_active ? '無効化' : '有効化'}
                        </Button>
                      </div>
                      <p className='text-xs text-gray-500 mt-2'>
                        最終ログイン:{' '}
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString('ja-JP')
                          : '未ログイン'}
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
