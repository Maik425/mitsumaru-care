'use client';

import { ArrowLeft, Plus, Edit, Trash2, Settings, X } from 'lucide-react';
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

interface JobAreaSet {
  id: string;
  jobType: string;
  area: string;
  minAssignment: number;
  maxAssignment: number;
}

interface JobRuleTemplate {
  id: number;
  templateName: string;
  description: string;
  jobAreaSets: JobAreaSet[];
  createdAt: string;
}

export function JobRulesManagement() {
  const [jobRuleTemplates, setJobRuleTemplates] = useState<JobRuleTemplate[]>([
    {
      id: 1,
      templateName: '平日日勤シフト',
      description: '平日の日勤時間帯の基本配置ルール',
      jobAreaSets: [
        {
          id: '1-1',
          jobType: '介護福祉士',
          area: '1階フロア',
          minAssignment: 2,
          maxAssignment: 4,
        },
        {
          id: '1-2',
          jobType: '看護師',
          area: '全フロア',
          minAssignment: 1,
          maxAssignment: 2,
        },
        {
          id: '1-3',
          jobType: '介護士',
          area: '2階フロア',
          minAssignment: 1,
          maxAssignment: 3,
        },
      ],
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      templateName: '夜勤シフト',
      description: '夜勤時間帯の最小限配置ルール',
      jobAreaSets: [
        {
          id: '2-1',
          jobType: '介護福祉士',
          area: '1階フロア',
          minAssignment: 1,
          maxAssignment: 2,
        },
        {
          id: '2-2',
          jobType: '看護師',
          area: '全フロア',
          minAssignment: 1,
          maxAssignment: 1,
        },
        {
          id: '2-3',
          jobType: '介護士',
          area: '2階フロア',
          minAssignment: 1,
          maxAssignment: 2,
        },
      ],
      createdAt: '2024-01-16',
    },
  ]);

  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    jobAreaSets: [] as Omit<JobAreaSet, 'id'>[],
  });

  const [currentSet, setCurrentSet] = useState({
    jobType: '',
    area: '',
    customAreaName: '',
    minAssignment: '',
    maxAssignment: '',
  });

  const jobTypes = [
    '介護福祉士',
    '看護師',
    '介護士',
    '管理者',
    '生活相談員',
    '機能訓練指導員',
  ];
  const areas = [
    '1階フロア',
    '2階フロア',
    '3階フロア',
    '全フロア',
    '特別室',
    'デイサービス',
    '訪問介護',
    'カスタム',
  ];

  const addJobAreaSet = () => {
    const finalAreaName =
      currentSet.area === 'カスタム'
        ? currentSet.customAreaName
        : currentSet.area;

    if (
      currentSet.jobType &&
      finalAreaName &&
      currentSet.minAssignment &&
      currentSet.maxAssignment
    ) {
      const newSet = {
        jobType: currentSet.jobType,
        area: finalAreaName,
        minAssignment: Number.parseInt(currentSet.minAssignment),
        maxAssignment: Number.parseInt(currentSet.maxAssignment),
      };
      setFormData({
        ...formData,
        jobAreaSets: [...formData.jobAreaSets, newSet],
      });
      setCurrentSet({
        jobType: '',
        area: '',
        customAreaName: '',
        minAssignment: '',
        maxAssignment: '',
      });
    }
  };

  const removeJobAreaSet = (index: number) => {
    const updatedSets = formData.jobAreaSets.filter((_, i) => i !== index);
    setFormData({ ...formData, jobAreaSets: updatedSets });
  };

  const handleSaveTemplate = () => {
    if (formData.templateName && formData.jobAreaSets.length > 0) {
      const newTemplate: JobRuleTemplate = {
        id: Date.now(),
        templateName: formData.templateName,
        description: formData.description,
        jobAreaSets: formData.jobAreaSets.map((set, index) => ({
          ...set,
          id: `${Date.now()}-${index}`,
        })),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setJobRuleTemplates([...jobRuleTemplates, newTemplate]);
      setFormData({
        templateName: '',
        description: '',
        jobAreaSets: [],
      });
    }
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
              配置ルールテンプレート管理
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
                  新しい配置ルールテンプレート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='templateName'>テンプレート名</Label>
                      <Input
                        id='templateName'
                        value={formData.templateName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            templateName: e.target.value,
                          })
                        }
                        placeholder='例: 平日日勤シフト'
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
                        placeholder='このテンプレートの用途や特徴を入力'
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className='border-t pt-4'>
                    <h3 className='text-sm font-medium text-gray-900 mb-3'>
                      職種・エリアセットを追加
                    </h3>
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <Label htmlFor='jobType'>職種</Label>
                          <Select
                            value={currentSet.jobType}
                            onValueChange={value =>
                              setCurrentSet({ ...currentSet, jobType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='職種を選択' />
                            </SelectTrigger>
                            <SelectContent>
                              {jobTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor='area'>配置エリア</Label>
                          <Select
                            value={currentSet.area}
                            onValueChange={value =>
                              setCurrentSet({
                                ...currentSet,
                                area: value,
                                customAreaName: '',
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='エリアを選択' />
                            </SelectTrigger>
                            <SelectContent>
                              {areas.map(area => (
                                <SelectItem key={area} value={area}>
                                  {area}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {currentSet.area === 'カスタム' && (
                        <div>
                          <Label htmlFor='customAreaName'>エリア名を入力</Label>
                          <Input
                            id='customAreaName'
                            value={currentSet.customAreaName}
                            onChange={e =>
                              setCurrentSet({
                                ...currentSet,
                                customAreaName: e.target.value,
                              })
                            }
                            placeholder='例: リハビリ室、食堂、事務所など'
                          />
                        </div>
                      )}

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <Label htmlFor='minAssignment'>最小配置人数</Label>
                          <Input
                            id='minAssignment'
                            type='number'
                            min='1'
                            value={currentSet.minAssignment}
                            onChange={e =>
                              setCurrentSet({
                                ...currentSet,
                                minAssignment: e.target.value,
                              })
                            }
                            placeholder='1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='maxAssignment'>最大配置人数</Label>
                          <Input
                            id='maxAssignment'
                            type='number'
                            min='1'
                            value={currentSet.maxAssignment}
                            onChange={e =>
                              setCurrentSet({
                                ...currentSet,
                                maxAssignment: e.target.value,
                              })
                            }
                            placeholder='8'
                          />
                        </div>
                      </div>

                      <Button
                        onClick={addJobAreaSet}
                        variant='outline'
                        size='sm'
                        className='w-full bg-transparent'
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        セットを追加
                      </Button>
                    </div>
                  </div>

                  {formData.jobAreaSets.length > 0 && (
                    <div className='border-t pt-4'>
                      <h3 className='text-sm font-medium text-gray-900 mb-3'>
                        追加されたセット
                      </h3>
                      <div className='space-y-2'>
                        {formData.jobAreaSets.map((set, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                          >
                            <div className='flex items-center space-x-2'>
                              <Badge className='bg-blue-100 text-blue-800'>
                                {set.jobType}
                              </Badge>
                              <Badge variant='outline'>{set.area}</Badge>
                              <span className='text-sm text-gray-600'>
                                {set.minAssignment}-{set.maxAssignment}人
                              </span>
                            </div>
                            <Button
                              onClick={() => removeJobAreaSet(index)}
                              variant='ghost'
                              size='sm'
                              className='text-red-600 hover:text-red-800'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveTemplate}
                    className='w-full'
                    disabled={
                      !formData.templateName ||
                      formData.jobAreaSets.length === 0
                    }
                  >
                    テンプレートを保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Settings className='h-5 w-5 mr-2' />
                  登録済みテンプレート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {jobRuleTemplates.map(template => (
                    <div
                      key={template.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <h3 className='font-medium text-gray-900'>
                            {template.templateName}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {template.description}
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            作成日: {template.createdAt}
                          </p>
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

                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-700'>
                          配置セット ({template.jobAreaSets.length}件)
                        </p>
                        {template.jobAreaSets.map(set => (
                          <div
                            key={set.id}
                            className='flex items-center justify-between p-2 bg-gray-50 rounded'
                          >
                            <div className='flex items-center space-x-2'>
                              <Badge className='bg-blue-100 text-blue-800 text-xs'>
                                {set.jobType}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {set.area}
                              </Badge>
                            </div>
                            <span className='text-sm text-gray-600'>
                              {set.minAssignment}-{set.maxAssignment}人
                            </span>
                          </div>
                        ))}
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
