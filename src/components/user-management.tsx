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
import { useEffect, useState } from 'react';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);

  // tRPCクエリ
  const {
    data: users,
    isLoading,
    refetch,
  } = trpc.users.getUsers.useQuery({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    role: selectedRole === 'all' ? undefined : selectedRole,
    facility_id: selectedFacility === 'all' ? undefined : selectedFacility,
  });

  // 施設一覧取得
  const { data: facilitiesData } = trpc.users.getFacilities.useQuery();

  // ユーザー統計取得
  const { data: userStats } = trpc.users.getUserStatsByFacility.useQuery({
    facility_id: selectedFacility === 'all' ? undefined : selectedFacility,
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

  // フィルタリングされたユーザー（クライアントサイド検索）
  const filteredUsers =
    users?.users?.filter(
      user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // ページネーション計算
  const totalPages = Math.ceil((users?.total || 0) / pageSize);

  // フィルタリングが変更されたときにページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, selectedFacility]);

  const handleCreateUser = (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    facility_id?: string;
  }) => {
    createUserMutation.mutate({
      ...data,
      facility_id:
        data.facility_id === 'unassigned' ? undefined : data.facility_id,
    });
  };

  const handleUpdateUser = (
    id: string,
    data: {
      name?: string;
      role?: UserRole;
      facility_id?: string;
      is_active?: boolean;
    }
  ) => {
    updateUserMutation.mutate({
      id,
      ...data,
      facility_id:
        data.facility_id === 'unassigned' ? undefined : data.facility_id,
    });
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
      {/* 統計情報 */}
      {userStats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold'>{userStats.total}</div>
              <p className='text-sm text-muted-foreground'>総ユーザー数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-green-600'>
                {userStats.active}
              </div>
              <p className='text-sm text-muted-foreground'>アクティブ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-red-600'>
                {userStats.inactive}
              </div>
              <p className='text-sm text-muted-foreground'>無効</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-blue-600'>
                {userStats.byRole.facility_admin}
              </div>
              <p className='text-sm text-muted-foreground'>施設管理者</p>
            </CardContent>
          </Card>
        </div>
      )}

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
          <Select
            value={selectedFacility}
            onValueChange={value => setSelectedFacility(value)}
          >
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='施設でフィルター' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>すべての施設</SelectItem>
              {facilitiesData?.facilities?.map(facility => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid='add-user'>
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
          <CardTitle>ユーザー一覧 ({users?.total || 0}件)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>施設</TableHead>
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
                    {user.facility_id ? (
                      facilitiesData?.facilities?.find(
                        f => f.id === user.facility_id
                      )?.name || '不明'
                    ) : (
                      <span className='text-muted-foreground'>未割り当て</span>
                    )}
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
                        data-testid='edit-user'
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        data-testid='delete-user'
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

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between mt-4'>
              <div className='text-sm text-muted-foreground'>
                {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, users?.total || 0)} /{' '}
                {users?.total || 0} 件
              </div>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                <span className='flex items-center px-3 py-1 text-sm'>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage(prev => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          )}
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
    facility_id?: string;
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as UserRole,
    facility_id: 'unassigned',
  });

  // 施設一覧取得
  const { data: facilitiesData } = trpc.users.getFacilities.useQuery();

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
      <div>
        <Label htmlFor='facility'>施設</Label>
        <Select
          value={formData.facility_id}
          onValueChange={value =>
            setFormData({ ...formData, facility_id: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='施設を選択（任意）' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='unassigned'>未割り当て</SelectItem>
            {facilitiesData?.facilities?.map(facility => (
              <SelectItem key={facility.id} value={facility.id}>
                {facility.name}
              </SelectItem>
            ))}
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
    facility_id?: string;
    is_active?: boolean;
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    facility_id: user.facility_id || 'unassigned',
    is_active: user.is_active,
  });

  // 施設一覧取得
  const { data: facilitiesData } = trpc.users.getFacilities.useQuery();

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
      <div>
        <Label htmlFor='edit-facility'>施設</Label>
        <Select
          value={formData.facility_id}
          onValueChange={value =>
            setFormData({ ...formData, facility_id: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='施設を選択（任意）' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='unassigned'>未割り当て</SelectItem>
            {facilitiesData?.facilities?.map(facility => (
              <SelectItem key={facility.id} value={facility.id}>
                {facility.name}
              </SelectItem>
            ))}
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
