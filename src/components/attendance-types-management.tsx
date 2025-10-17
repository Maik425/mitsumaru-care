'use client';

import { ArrowLeft, Clock, Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';

export function AttendanceTypesManagement() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    breakTime: '',
    colorCode: '',
    description: '',
    isNightShift: false,
    sortOrder: 0,
  });

  // tRPC queries and mutations
  const { data: attendanceTypes = [], refetch } =
    trpc.attendance.getShifts.useQuery({
      facility_id: user?.facility_id,
      is_active: true,
    });

  const createShiftMutation = trpc.attendance.createShift.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  const updateShiftMutation = trpc.attendance.updateShift.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  const deleteShiftMutation = trpc.attendance.deleteShift.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      breakTime: '',
      colorCode: '',
      description: '',
      isNightShift: false,
      sortOrder: 0,
    });
    setIsEditing(false);
    setEditingType(null);
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      startTime: type.start_time,
      endTime: type.end_time,
      breakTime: type.break_duration.toString(),
      colorCode: type.color_code || '',
      description: type.description || '',
      isNightShift: type.is_night_shift || false,
      sortOrder: type.sort_order || 0,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!user?.facility_id) return;

    const shiftData = {
      name: formData.name,
      start_time: formData.startTime,
      end_time: formData.endTime,
      break_duration: parseInt(formData.breakTime) || 60,
      facility_id: user.facility_id,
      color_code: formData.colorCode || undefined,
      description: formData.description || undefined,
      is_night_shift: formData.isNightShift,
      sort_order: formData.sortOrder,
    };

    if (isEditing && editingType) {
      updateShiftMutation.mutate({
        id: editingType.id,
        ...shiftData,
      });
    } else {
      createShiftMutation.mutate(shiftData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('このシフト形態を削除しますか？')) {
      deleteShiftMutation.mutate({ id });
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
              シフト形態管理
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
                  {isEditing ? 'シフト形態編集' : '新しいシフト形態'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='name'>シフト形態名</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='例: 早番'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='startTime'>開始時刻</Label>
                      <Input
                        id='startTime'
                        type='time'
                        value={formData.startTime}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='endTime'>終了時刻</Label>
                      <Input
                        id='endTime'
                        type='time'
                        value={formData.endTime}
                        onChange={e =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='breakTime'>休憩時間（分）</Label>
                    <Input
                      id='breakTime'
                      type='number'
                      value={formData.breakTime}
                      onChange={e =>
                        setFormData({ ...formData, breakTime: e.target.value })
                      }
                      placeholder='60'
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
                  <div>
                    <Label htmlFor='description'>説明</Label>
                    <Input
                      id='description'
                      value={formData.description}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder='シフト形態の説明'
                    />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='isNightShift'
                      checked={formData.isNightShift}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          isNightShift: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor='isNightShift'>夜勤シフト</Label>
                  </div>
                  <div>
                    <Label htmlFor='sortOrder'>表示順序</Label>
                    <Input
                      id='sortOrder'
                      type='number'
                      min='0'
                      value={formData.sortOrder}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          sortOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder='0'
                    />
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      onClick={handleSave}
                      className='flex-1'
                      disabled={
                        createShiftMutation.isPending ||
                        updateShiftMutation.isPending
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
                  <Clock className='h-5 w-5 mr-2' />
                  登録済みシフト形態
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {attendanceTypes.map(type => (
                    <div
                      key={type.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <Badge
                          className={
                            type.color_code || 'bg-gray-100 text-gray-800'
                          }
                        >
                          {type.name}
                          {type.is_night_shift && ' (夜勤)'}
                        </Badge>
                        <div className='flex space-x-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleEdit(type)}
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='text-red-600'
                            onClick={() => handleDelete(type.id)}
                            disabled={deleteShiftMutation.isPending}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      {type.description && (
                        <p className='text-sm text-gray-500 mb-2'>
                          {type.description}
                        </p>
                      )}
                      <div className='text-sm text-gray-600'>
                        <p>
                          勤務時間: {type.start_time} - {type.end_time}
                        </p>
                        <p>休憩時間: {type.break_duration}分</p>
                        <p>
                          実働時間:{' '}
                          {calculateWorkingHours(
                            type.start_time,
                            type.end_time,
                            type.break_duration
                          )}
                          時間
                        </p>
                        {type.sort_order !== undefined && (
                          <p>表示順序: {type.sort_order}</p>
                        )}
                      </div>
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

function calculateWorkingHours(
  start: string,
  end: string,
  breakTime: number
): string {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // 夜勤の場合（終了時刻が開始時刻より小さい）
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const totalMinutes = endMinutes - startMinutes - breakTime;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
}
