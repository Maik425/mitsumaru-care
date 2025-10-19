'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FacilityManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any | null>(null);
  const [deletingFacility, setDeletingFacility] = useState<any | null>(null);

  const {
    data: facilities,
    isLoading,
    refetch,
  } = trpc.facilities.getFacilities.useQuery({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    search: searchTerm || undefined,
  });

  const { data: facilityStats } = trpc.facilities.getFacilityStats.useQuery({});

  const createFacilityMutation = trpc.facilities.createFacility.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  const updateFacilityMutation = trpc.facilities.updateFacility.useMutation({
    onSuccess: () => {
      setEditingFacility(null);
      refetch();
    },
  });

  const deleteFacilityMutation = trpc.facilities.deleteFacility.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateFacility = (data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => {
    createFacilityMutation.mutate(data);
  };

  const handleUpdateFacility = (
    id: string,
    data: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
    }
  ) => {
    updateFacilityMutation.mutate({ id, ...data });
  };

  const handleDeleteFacility = (facility: any) => {
    setDeletingFacility(facility);
  };

  const confirmDeleteFacility = () => {
    if (deletingFacility) {
      deleteFacilityMutation.mutate({ id: deletingFacility.id });
      setDeletingFacility(null);
    }
  };

  const cancelDeleteFacility = () => {
    setDeletingFacility(null);
  };

  // 検索時にページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = facilities ? Math.ceil(facilities.total / pageSize) : 0;

  return (
    <div className='space-y-6'>
      {/* 統計情報 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold'>{facilities?.total || 0}</div>
            <p className='text-xs text-muted-foreground'>総施設数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold'>
              {facilityStats?.reduce((sum, stat) => sum + stat.user_count, 0) ||
                0}
            </div>
            <p className='text-xs text-muted-foreground'>総ユーザー数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold'>
              {facilityStats?.reduce(
                (sum, stat) => sum + stat.active_user_count,
                0
              ) || 0}
            </div>
            <p className='text-xs text-muted-foreground'>アクティブユーザー</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='text-2xl font-bold'>
              {facilityStats?.reduce(
                (sum, stat) => sum + stat.attendance_records_count,
                0
              ) || 0}
            </div>
            <p className='text-xs text-muted-foreground'>勤怠記録数</p>
          </CardContent>
        </Card>
      </div>

      {/* 検索・フィルター・追加ボタン */}
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>施設管理</CardTitle>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button data-testid='add-facility'>
                  <Plus className='mr-2 h-4 w-4' />
                  施設追加
                </Button>
              </DialogTrigger>
              <DialogContent data-testid='create-facility-dialog'>
                <DialogHeader>
                  <DialogTitle>新しい施設を作成</DialogTitle>
                </DialogHeader>
                <FacilityForm
                  onSubmit={handleCreateFacility}
                  isLoading={createFacilityMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-2 mb-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='施設を検索...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
          </div>

          {/* 施設一覧テーブル */}
          {isLoading ? (
            <div className='text-center py-8'>読み込み中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>施設名</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>ユーザー数</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities?.facilities.map(facility => {
                  const stats = facilityStats?.find(
                    s => s.facility_id === facility.id
                  );
                  return (
                    <TableRow key={facility.id}>
                      <TableCell className='font-medium'>
                        {facility.name}
                      </TableCell>
                      <TableCell>{facility.address || '-'}</TableCell>
                      <TableCell>{facility.phone || '-'}</TableCell>
                      <TableCell>{facility.email || '-'}</TableCell>
                      <TableCell>{stats?.user_count || 0}</TableCell>
                      <TableCell>
                        {new Date(facility.created_at).toLocaleDateString(
                          'ja-JP'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='flex space-x-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            data-testid='edit-facility'
                            onClick={() => setEditingFacility(facility)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            data-testid='delete-facility'
                            onClick={() => handleDeleteFacility(facility)}
                            disabled={deleteFacilityMutation.isPending}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between mt-4'>
              <div className='text-sm text-muted-foreground'>
                {facilities?.total || 0}件中 {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, facilities?.total || 0)}
                件を表示
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                <span className='text-sm'>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(currentPage + 1)}
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
      <Dialog
        open={!!editingFacility}
        onOpenChange={() => setEditingFacility(null)}
      >
        <DialogContent data-testid='edit-facility-dialog'>
          <DialogHeader>
            <DialogTitle>施設を編集</DialogTitle>
          </DialogHeader>
          {editingFacility && (
            <FacilityEditForm
              facility={editingFacility}
              onSubmit={data => handleUpdateFacility(editingFacility.id, data)}
              isLoading={updateFacilityMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog
        open={!!deletingFacility}
        onOpenChange={() => setDeletingFacility(null)}
      >
        <AlertDialogContent data-testid='delete-confirmation-dialog'>
          <AlertDialogHeader>
            <AlertDialogTitle>施設を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deletingFacility?.name}
              」を削除します。この操作は取り消せません。
              関連するユーザーの施設IDがNULLに設定されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDeleteFacility}
              data-testid='cancel-delete-button'
            >
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFacility}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              data-testid='confirm-delete-button'
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// 施設作成フォーム
function FacilityForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>施設名 *</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='address'>住所</Label>
        <Input
          id='address'
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor='phone'>電話番号</Label>
        <Input
          id='phone'
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor='email'>メールアドレス</Label>
        <Input
          id='email'
          type='email'
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <Button
        type='submit'
        className='w-full'
        disabled={isLoading}
        data-testid='create-facility-button'
      >
        {isLoading ? '作成中...' : '施設を作成'}
      </Button>
    </form>
  );
}

// 施設編集フォーム
function FacilityEditForm({
  facility,
  onSubmit,
  isLoading,
}: {
  facility: any;
  onSubmit: (data: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: facility.name,
    address: facility.address || '',
    phone: facility.phone || '',
    email: facility.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('編集フォーム送信:', formData);
    onSubmit({
      name: formData.name,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='edit-name'>施設名 *</Label>
        <Input
          id='edit-name'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='edit-address'>住所</Label>
        <Input
          id='edit-address'
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor='edit-phone'>電話番号</Label>
        <Input
          id='edit-phone'
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor='edit-email'>メールアドレス</Label>
        <Input
          id='edit-email'
          type='email'
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <Button
        type='submit'
        className='w-full'
        disabled={isLoading}
        data-testid='update-facility-button'
      >
        {isLoading ? '更新中...' : '施設を更新'}
      </Button>
    </form>
  );
}
