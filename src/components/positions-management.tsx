'use client';

import { ArrowLeft, Plus, Edit, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function PositionsManagement() {
  const [positions, setPositions] = useState([
    {
      id: 1,
      name: '介護福祉士',
      description: '介護業務全般を担当する国家資格保有者',
      level: '上級',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 2,
      name: '看護師',
      description: '医療処置・服薬管理を担当する医療従事者',
      level: '専門職',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 3,
      name: '介護士',
      description: '基本的な介護業務を担当するスタッフ',
      level: '一般',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      id: 4,
      name: '管理者',
      description: '施設運営・スタッフ管理を担当する責任者',
      level: '管理職',
      color: 'bg-purple-100 text-purple-800',
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '',
  });

  const handleSave = () => {
    // 実際の実装では、ここでAPIを呼び出してデータを保存
    setFormData({ name: '', description: '', level: '' });
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
                      value={formData.level}
                      onChange={e =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      placeholder='例: 上級、一般、管理職'
                    />
                  </div>
                  <Button onClick={handleSave} className='w-full'>
                    追加
                  </Button>
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
                          <Badge className={position.color}>
                            {position.name}
                          </Badge>
                          <Badge variant='outline'>{position.level}</Badge>
                        </div>
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
