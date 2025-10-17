'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROLE_LABELS } from '@/lib/auth/config';
import type { UserRole } from '@/lib/auth/types';
import type { UserResponseDto } from '@/lib/dto/user.dto';
import { trpc } from '@/lib/trpc';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);

  // tRPCクエリ
  const {
    data: users,
    isLoading,
    refetch,
  } = trpc.users.getUsers.useQuery({
    limit: 50,
    offset: 0,
    role: selectedRole === 'all' ? undefined : selectedRole,
  });

  // ユーザー作成ミューテーション
  const createUserMutation = trpc.users.createUser.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  // ユーザー更新ミューテーション
  const updateUserMutation = trpc.users.updateUser.useMutation({
    onSuccess: () => {
      setEditingUser(null);
      refetch();
    },
  });

  // ユーザー削除ミューテーション
  const deleteUserMutation = trpc.users.deleteUser.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // フィルタリングされたユーザー
  const filteredUsers =
    users?.users?.filter(
      user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleCreateUser = (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (
    id: string,
    data: {
      name?: string;
      role?: UserRole;
      is_active?: boolean;
    }
  ) => {
    updateUserMutation.mutate({ id, ...data });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('このユーザーを削除しますか？')) {
      deleteUserMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className='space-y-6'>
      {/* ヘッダーとアクション */}
      <div className='flex justify-between items-center'>
        <div className='flex space-x-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='ユーザーを検索...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 w-64'
            />
          </div>
          <Select
            value={selectedRole}
            onValueChange={value => setSelectedRole(value as UserRole | 'all')}
          >
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='ロールでフィルター' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>すべてのロール</SelectItem>
              <SelectItem value='system_admin'>システム管理者</SelectItem>
              <SelectItem value='facility_admin'>施設管理者</SelectItem>
              <SelectItem value='user'>一般ユーザー</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              ユーザー追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいユーザーを作成</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreateUser}
              isLoading={createUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* ユーザー一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧 ({filteredUsers.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{ROLE_LABELS[user.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'アクティブ' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <div className='flex space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザーを編集</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserEditForm
              user={editingUser}
              onSubmit={data => handleUpdateUser(editingUser.id, data)}
              isLoading={updateUserMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ユーザー作成フォーム
function UserForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>名前</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='email'>メールアドレス</Label>
        <Input
          id='email'
          type='email'
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='password'>パスワード</Label>
        <Input
          id='password'
          type='password'
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='role'>ロール</Label>
        <Select
          value={formData.role}
          onValueChange={value =>
            setFormData({ ...formData, role: value as UserRole })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='system_admin'>システム管理者</SelectItem>
            <SelectItem value='facility_admin'>施設管理者</SelectItem>
            <SelectItem value='user'>一般ユーザー</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? '作成中...' : 'ユーザーを作成'}
      </Button>
    </form>
  );
}

// ユーザー編集フォーム
function UserEditForm({
  user,
  onSubmit,
  isLoading,
}: {
  user: UserResponseDto;
  onSubmit: (data: {
    name?: string;
    role?: UserRole;
    is_active?: boolean;
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    is_active: user.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='edit-name'>名前</Label>
        <Input
          id='edit-name'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='edit-role'>ロール</Label>
        <Select
          value={formData.role}
          onValueChange={value =>
            setFormData({ ...formData, role: value as UserRole })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='system_admin'>システム管理者</SelectItem>
            <SelectItem value='facility_admin'>施設管理者</SelectItem>
            <SelectItem value='user'>一般ユーザー</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='flex items-center space-x-2'>
        <input
          type='checkbox'
          id='edit-active'
          checked={formData.is_active}
          onChange={e =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
        />
        <Label htmlFor='edit-active'>アクティブ</Label>
      </div>
      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? '更新中...' : 'ユーザーを更新'}
      </Button>
    </form>
  );
}
