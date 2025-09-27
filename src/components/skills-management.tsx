'use client';

import { ArrowLeft, Plus, Edit, Trash2, Award } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

export function SkillsManagement() {
  const [skills, setSkills] = useState([
    {
      id: 1,
      name: '入浴介助',
      category: '身体介護',
      level: 1,
      description: '利用者の入浴をサポートする技能',
    },
    {
      id: 2,
      name: '食事介助',
      category: '身体介護',
      level: 1,
      description: '食事の際の介助を行う技能',
    },
    {
      id: 3,
      name: '移乗介助',
      category: '身体介護',
      level: 3,
      description: '車椅子やベッドへの移乗をサポート',
    },
    {
      id: 4,
      name: '服薬管理',
      category: '医療',
      level: 5,
      description: '薬の管理・服薬確認を行う技能',
    },
    {
      id: 5,
      name: '記録業務',
      category: '事務',
      level: 1,
      description: '介護記録の作成・管理',
    },
    {
      id: 6,
      name: 'レクリエーション',
      category: '生活支援',
      level: 3,
      description: '利用者向けの活動企画・実施',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    level: 1,
    description: '',
  });

  const categories = ['身体介護', '医療', '事務', '生活支援', 'その他'];
  const levels = [
    { value: 1, label: 'レベル1 (初級)' },
    { value: 2, label: 'レベル2 (基礎)' },
    { value: 3, label: 'レベル3 (中級)' },
    { value: 4, label: 'レベル4 (上級)' },
    { value: 5, label: 'レベル5 (専門)' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '身体介護':
        return 'bg-blue-100 text-blue-800';
      case '医療':
        return 'bg-red-100 text-red-800';
      case '事務':
        return 'bg-gray-100 text-gray-800';
      case '生活支援':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-orange-100 text-orange-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      case 5:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: number) => {
    const labels = {
      1: '初級',
      2: '基礎',
      3: '中級',
      4: '上級',
      5: '専門',
    };
    return labels[level as keyof typeof labels] || '不明';
  };

  const handleSave = () => {
    // 実際の実装では、ここでAPIを呼び出してデータを保存
    setFormData({ name: '', category: '', level: 1, description: '' });
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
              技能登録
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
                  新しい技能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='name'>技能名</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='例: 入浴介助'
                    />
                  </div>
                  <div>
                    <Label htmlFor='category'>カテゴリー</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='カテゴリーを選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='level'>レベル</Label>
                    <Select
                      value={formData.level.toString()}
                      onValueChange={value =>
                        setFormData({
                          ...formData,
                          level: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='レベルを選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem
                            key={level.value}
                            value={level.value.toString()}
                          >
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder='技能の詳細説明を入力してください'
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
                  <Award className='h-5 w-5 mr-2' />
                  登録済み技能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {skills.map(skill => (
                    <div
                      key={skill.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center space-x-2'>
                          <h3 className='font-medium'>{skill.name}</h3>
                          <Badge className={getCategoryColor(skill.category)}>
                            {skill.category}
                          </Badge>
                          <Badge className={getLevelColor(skill.level)}>
                            Lv.{skill.level} ({getLevelLabel(skill.level)})
                          </Badge>
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
                        {skill.description}
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
