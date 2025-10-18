'use client';

import { ArrowLeft, Edit, Plus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';

export function PositionsManagement() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 1,
    colorCode: '',
  });

  // tRPC queries and mutations
  const { data: positions = [], refetch } =
    trpc.positions.getPositions.useQuery({
      facility_id: user?.facility_id,
      is_active: true,
    });

  const createPositionMutation = trpc.positions.createPosition.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
    onError: (error: any) => {
      console.error('役職の作成中にエラーが発生しました:', error);
      alert(`エラー: ${error.message}`);
    },
  });

  const updatePositionMutation = trpc.positions.updatePosition.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  const deletePositionMutation = trpc.positions.deletePosition.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: 1,
      colorCode: '',
    });
    setIsEditing(false);
    setEditingPosition(null);
  };

  const handleEdit = (position: any) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      description: position.description || '',
      level: position.level,
      colorCode: position.color_code || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!user?.facility_id) return;

    const positionData = {
      name: formData.name,
      description: formData.description || undefined,
      level: formData.level,
      color_code: formData.colorCode || undefined,
      facility_id: user.facility_id,
    };

    if (isEditing && editingPosition) {
      updatePositionMutation.mutate({
        id: editingPosition.id,
        ...positionData,
      });
    } else {
      createPositionMutation.mutate(positionData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('この役職を削除しますか？')) {
      deletePositionMutation.mutate({ id });
    }
  };

  const handleCancel = () => {
    resetForm();
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
              役職登録
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
                  新しい役職
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='name'>役職名</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='例: 介護福祉士'
                    />
                  </div>
                  <div>
                    <Label htmlFor='description'>説明</Label>
                    <Textarea
                      id='description'
                      value={formData.description}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder='役職の詳細説明を入力してください'
                    />
                  </div>
                  <div>
                    <Label htmlFor='level'>レベル</Label>
                    <Input
                      id='level'
                      type='number'
                      min='1'
                      max='10'
                      value={formData.level}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          level: parseInt(e.target.value) || 1,
                        })
                      }
                      placeholder='1-10の数値'
                    />
                  </div>
                  <div>
                    <Label htmlFor='colorCode'>色コード</Label>
                    <Input
                      id='colorCode'
                      value={formData.colorCode}
                      onChange={e =>
                        setFormData({ ...formData, colorCode: e.target.value })
                      }
                      placeholder='例: bg-blue-100 text-blue-800'
                    />
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      onClick={handleSave}
                      className='flex-1'
                      disabled={
                        createPositionMutation.isPending ||
                        updatePositionMutation.isPending
                      }
                    >
                      {isEditing ? '更新' : '追加'}
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={handleCancel}
                        variant='outline'
                        className='flex-1 bg-transparent'
                      >
                        キャンセル
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Users className='h-5 w-5 mr-2' />
                  登録済み役職
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {positions.map(position => (
                    <div
                      key={position.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center space-x-2'>
                          <Badge
                            className={
                              position.color_code || 'bg-gray-100 text-gray-800'
                            }
                          >
                            {position.name}
                          </Badge>
                          <Badge variant='outline'>
                            レベル {position.level}
                          </Badge>
                        </div>
                        <div className='flex space-x-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleEdit(position)}
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='text-red-600'
                            onClick={() => handleDelete(position.id)}
                            disabled={deletePositionMutation.isPending}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <p className='text-sm text-gray-600'>
                        {position.description}
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
