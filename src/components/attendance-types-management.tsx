'use client';

import { ArrowLeft, Plus, Edit, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AttendanceTypesManagement() {
  const [attendanceTypes, setAttendanceTypes] = useState([
    {
      id: 1,
      name: '早番',
      startTime: '07:00',
      endTime: '16:00',
      breakTime: 60,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 2,
      name: '日勤',
      startTime: '09:00',
      endTime: '18:00',
      breakTime: 60,
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 3,
      name: '遅番',
      startTime: '11:00',
      endTime: '20:00',
      breakTime: 60,
      color: 'bg-orange-100 text-orange-800',
    },
    {
      id: 4,
      name: '夜勤',
      startTime: '20:00',
      endTime: '09:00',
      breakTime: 120,
      color: 'bg-purple-100 text-purple-800',
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    breakTime: '',
  });

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      startTime: type.startTime,
      endTime: type.endTime,
      breakTime: type.breakTime.toString(),
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    // 実際の実装では、ここでAPIを呼び出してデータを保存
    setIsEditing(false);
    setEditingType(null);
    setFormData({ name: '', startTime: '', endTime: '', breakTime: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingType(null);
    setFormData({ name: '', startTime: '', endTime: '', breakTime: '' });
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
                  <div className='flex space-x-2'>
                    <Button onClick={handleSave} className='flex-1'>
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
                        <Badge className={type.color}>{type.name}</Badge>
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
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='text-sm text-gray-600'>
                        <p>
                          勤務時間: {type.startTime} - {type.endTime}
                        </p>
                        <p>休憩時間: {type.breakTime}分</p>
                        <p>
                          実働時間:{' '}
                          {calculateWorkingHours(
                            type.startTime,
                            type.endTime,
                            type.breakTime
                          )}
                          時間
                        </p>
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
