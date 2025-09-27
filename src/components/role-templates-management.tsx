'use client';

import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  FileText,
  Grid3X3,
  Save,
  X,
  Clock,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';

export function RoleTemplatesManagement() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: '平日日勤テンプレート',
      shift: '日勤',
      description: '平日の標準的な役割分担',
      roles: [
        { position: 'フロアリーダー', assignee: '介護福祉士', count: 1 },
        { position: '1階担当', assignee: '介護士', count: 2 },
        { position: '2階担当', assignee: '介護士', count: 2 },
        { position: '入浴介助', assignee: '介護福祉士', count: 1 },
        { position: '記録業務', assignee: '看護師', count: 1 },
      ],
      usageCount: 15,
    },
    {
      id: 2,
      name: '土日日勤テンプレート',
      shift: '日勤',
      description: '土日祝日用の役割分担（人員少なめ）',
      roles: [
        { position: 'フロアリーダー', assignee: '介護福祉士', count: 1 },
        { position: '全フロア担当', assignee: '介護士', count: 3 },
        { position: '入浴介助', assignee: '介護福祉士', count: 1 },
      ],
      usageCount: 8,
    },
    {
      id: 3,
      name: '夜勤テンプレート',
      shift: '夜勤',
      description: '夜勤時の最小限の役割分担',
      roles: [
        { position: '夜勤リーダー', assignee: '介護福祉士', count: 1 },
        { position: '巡回担当', assignee: '介護士', count: 2 },
      ],
      usageCount: 22,
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    shift: '日勤',
    description: '',
    roles: [] as Array<{ position: string; assignee: string; count: number }>,
  });

  const [newRole, setNewRole] = useState({
    position: '',
    assignee: '',
    count: 1,
  });

  const [visualTemplate, setVisualTemplate] = useState({
    name: '',
    shift: '日勤',
    description: '',
    staffRows: [
      {
        id: 1,
        workType: '日勤',
        name: '職員1',
        position: '介護職',
        area: '1階',
        customArea: '',
        schedule: Array(12).fill(''),
      },
      {
        id: 2,
        workType: '日勤',
        name: '職員2',
        position: '介護職',
        area: '2階',
        customArea: '',
        schedule: Array(12).fill(''),
      },
      {
        id: 3,
        workType: '日勤',
        name: '職員3',
        position: '介護職',
        area: '1階',
        customArea: '',
        schedule: Array(12).fill(''),
      },
    ],
    handoverNotes: '',
  });

  const [selectedCell, setSelectedCell] = useState<{
    staffId: number;
    timeIndex: number;
  } | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [timeSlots, setTimeSlots] = useState([
    '申し送り',
    '8:30',
    '9:30',
    '10:30',
    '11:30',
    '12:00',
    '12:30',
    '13:30',
    '14:30',
    '15:30',
    '16:30',
    '17:30',
  ]);

  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [editingTimeValue, setEditingTimeValue] = useState('');

  const positions = [
    'フロアリーダー',
    '1階担当',
    '2階担当',
    '入浴介助',
    '食事介助',
    '記録業務',
    '巡回担当',
  ];
  const shiftTypes = ['早番', '日勤', '遅番', '夜勤', '準夜勤', '深夜勤'];
  const professionTypes = [
    '介護職',
    '看護職',
    'リハビリ職',
    '栄養士',
    '相談員',
    '事務職',
    '管理職',
  ];
  const areas = [
    '1階',
    '2階',
    '3階',
    'デイサービス',
    'ショートステイ',
    '事務所',
  ];
  const roleOptions = [
    '食事介助',
    '排泄介助',
    '入浴介助',
    '口腔ケア',
    'レクリエーション',
    '移動介助',
    '見守り',
    '誘導',
    '記録業務',
    '申し送り',
    '清掃',
    '洗濯',
  ];

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case '早番':
        return 'bg-blue-100 text-blue-800';
      case '日勤':
        return 'bg-green-100 text-green-800';
      case '遅番':
        return 'bg-orange-100 text-orange-800';
      case '夜勤':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addRole = () => {
    if (newRole.position && newRole.assignee) {
      setFormData({
        ...formData,
        roles: [...formData.roles, { ...newRole }],
      });
      setNewRole({ position: '', assignee: '', count: 1 });
    }
  };

  const removeRole = (index: number) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    // 実際の実装では、ここでAPIを呼び出してデータを保存
    setFormData({ name: '', shift: '', description: '', roles: [] });
  };

  const duplicateTemplate = (template: any) => {
    setFormData({
      name: `${template.name} (コピー)`,
      shift: template.shift,
      description: template.description,
      roles: [...template.roles],
    });
  };

  const addStaffRow = () => {
    const newId = Math.max(...visualTemplate.staffRows.map(row => row.id)) + 1;
    const newRow = {
      id: newId,
      workType: '日勤',
      name: `職員${newId}`,
      position: '介護職',
      area: '1階',
      customArea: '',
      schedule: Array(timeSlots.length).fill(''), // 現在の時間スロット数に合わせて配列を作成
    };
    setVisualTemplate({
      ...visualTemplate,
      staffRows: [...visualTemplate.staffRows, newRow],
    });
  };

  const removeStaffRow = (staffId: number) => {
    if (visualTemplate.staffRows.length <= 1) return;
    setVisualTemplate({
      ...visualTemplate,
      staffRows: visualTemplate.staffRows.filter(row => row.id !== staffId),
    });
  };

  const updateStaffRow = (staffId: number, field: string, value: string) => {
    setVisualTemplate({
      ...visualTemplate,
      staffRows: visualTemplate.staffRows.map(row =>
        row.id === staffId ? { ...row, [field]: value } : row
      ),
    });
  };

  const handleCellClick = (staffId: number, timeIndex: number) => {
    setSelectedCell({ staffId, timeIndex });
    const currentRole =
      visualTemplate.staffRows.find(row => row.id === staffId)?.schedule[
        timeIndex
      ] || '';
    setEditingRole(currentRole);
  };

  const updateScheduleCell = (
    staffId: number,
    timeIndex: number,
    role: string
  ) => {
    setVisualTemplate({
      ...visualTemplate,
      staffRows: visualTemplate.staffRows.map(row => {
        if (row.id === staffId) {
          const newSchedule = [...row.schedule];
          newSchedule[timeIndex] = role;
          return { ...row, schedule: newSchedule };
        }
        return row;
      }),
    });
    setSelectedCell(null);
    setEditingRole('');
  };

  const getCellBackgroundColor = (role: string) => {
    if (!role) return 'bg-white';
    if (role.includes('入浴')) return 'bg-pink-100';
    if (role.includes('食事')) return 'bg-blue-100';
    if (role.includes('リーダー')) return 'bg-yellow-100';
    if (role.includes('記録')) return 'bg-green-100';
    if (role.includes('巡回')) return 'bg-purple-100';
    return 'bg-gray-100';
  };

  const saveVisualTemplate = () => {
    // Convert visual template to standard template format
    const roles: Array<{ position: string; assignee: string; count: number }> =
      [];

    visualTemplate.staffRows.forEach(row => {
      row.schedule.forEach(role => {
        if (role) {
          const existingRole = roles.find(
            r => r.position === role && r.assignee === row.position
          );
          if (existingRole) {
            existingRole.count += 1;
          } else {
            roles.push({
              position: role,
              assignee: row.position,
              count: 1,
            });
          }
        }
      });
    });

    console.log('Saving visual template:', { ...visualTemplate, roles });
  };

  const openVisualEditor = () => {
    // setIsVisualEditorOpen(true)
  };

  const addTimeSlot = () => {
    const newTime = `${timeSlots.length + 7}:30`;
    const newTimeSlots = [...timeSlots, newTime];
    setTimeSlots(newTimeSlots);

    // 全職員のスケジュール配列に新しい時間スロットを追加
    setVisualTemplate({
      ...visualTemplate,
      staffRows: visualTemplate.staffRows.map(row => ({
        ...row,
        schedule: [...row.schedule, ''],
      })),
    });
  };

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length <= 1) return;

    const newTimeSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newTimeSlots);

    // 全職員のスケジュール配列から該当時間スロットを削除
    setVisualTemplate({
      ...visualTemplate,
      staffRows: visualTemplate.staffRows.map(row => ({
        ...row,
        schedule: row.schedule.filter((_, i) => i !== index),
      })),
    });
  };

  const startEditingTime = (index: number) => {
    setEditingTimeIndex(index);
    setEditingTimeValue(timeSlots[index]);
  };

  const saveTimeEdit = () => {
    if (editingTimeIndex !== null && editingTimeValue.trim()) {
      const newTimeSlots = [...timeSlots];
      newTimeSlots[editingTimeIndex] = editingTimeValue.trim();
      setTimeSlots(newTimeSlots);
    }
    setEditingTimeIndex(null);
    setEditingTimeValue('');
  };

  const cancelTimeEdit = () => {
    setEditingTimeIndex(null);
    setEditingTimeValue('');
  };

  const getShiftBackgroundColor = (shift: string) => {
    switch (shift) {
      case '早番':
        return 'bg-blue-50';
      case '日勤':
        return 'bg-green-50';
      case '遅番':
        return 'bg-orange-50';
      case '夜勤':
        return 'bg-purple-50';
      case '準夜勤':
        return 'bg-indigo-50';
      case '深夜勤':
        return 'bg-gray-50';
      default:
        return 'bg-pink-100';
    }
  };

  const AreaSelector = ({ staff }: { staff: any }) => {
    const handleAreaChange = (area: string) => {
      updateStaffRow(staff.id, 'area', area);
      if (area !== 'その他') {
        updateStaffRow(staff.id, 'customArea', '');
      }
    };

    const handleCustomAreaChange = (value: string) => {
      updateStaffRow(staff.id, 'customArea', value);
    };

    const getDisplayArea = () => {
      if (staff.area === 'その他' && staff.customArea) {
        return staff.customArea;
      }
      return staff.area;
    };

    return (
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='area-select' className='border-none'>
          <AccordionTrigger className='py-2 px-3 text-xs hover:no-underline bg-white border rounded'>
            <span className='truncate'>{getDisplayArea()}</span>
          </AccordionTrigger>
          <AccordionContent className='pt-2'>
            <div className='space-y-2'>
              {areas.map(area => (
                <button
                  key={area}
                  onClick={() => handleAreaChange(area)}
                  className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                    staff.area === area && staff.area !== 'その他'
                      ? 'bg-blue-100 text-blue-800'
                      : ''
                  }`}
                >
                  {area}
                </button>
              ))}
              <button
                onClick={() => handleAreaChange('その他')}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                  staff.area === 'その他' ? 'bg-blue-100 text-blue-800' : ''
                }`}
              >
                その他
              </button>
              {staff.area === 'その他' && (
                <div className='pt-2'>
                  <Input
                    value={staff.customArea || ''}
                    onChange={e => handleCustomAreaChange(e.target.value)}
                    placeholder='エリア名を入力'
                    className='h-7 text-xs'
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
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
              役割表テンプレート登録
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Grid3X3 className='h-5 w-5 mr-2' />
              役割表テンプレート図作成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='visual-name'>テンプレート名</Label>
                  <Input
                    id='visual-name'
                    value={visualTemplate.name}
                    onChange={e =>
                      setVisualTemplate({
                        ...visualTemplate,
                        name: e.target.value,
                      })
                    }
                    placeholder='例: 平日日勤テンプレート'
                  />
                </div>
                <div>
                  <Label htmlFor='visual-shift'>対象シフト</Label>
                  <Select
                    value={visualTemplate.shift}
                    onValueChange={value =>
                      setVisualTemplate({ ...visualTemplate, shift: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='シフトを選択' />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftTypes.map(shift => (
                        <SelectItem key={shift} value={shift}>
                          {shift}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='visual-description'>説明</Label>
                  <Input
                    id='visual-description'
                    value={visualTemplate.description}
                    onChange={e =>
                      setVisualTemplate({
                        ...visualTemplate,
                        description: e.target.value,
                      })
                    }
                    placeholder='テンプレートの説明'
                  />
                </div>
              </div>

              <div className='border rounded-lg p-4 bg-blue-50'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4' />
                    <Label className='text-sm font-medium'>
                      時間スロット管理:
                    </Label>
                    <span className='text-sm text-gray-600'>
                      {timeSlots.length}個
                    </span>
                  </div>
                  <div className='flex space-x-2'>
                    <Button onClick={addTimeSlot} size='sm' variant='outline'>
                      <Plus className='h-4 w-4 mr-1' />
                      時間追加
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-6 gap-2'>
                  {timeSlots.map((time, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-1 p-2 bg-white rounded border'
                    >
                      {editingTimeIndex === index ? (
                        <div className='flex items-center space-x-1 w-full'>
                          <Input
                            value={editingTimeValue}
                            onChange={e => setEditingTimeValue(e.target.value)}
                            className='h-6 text-xs flex-1'
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveTimeEdit();
                              if (e.key === 'Escape') cancelTimeEdit();
                            }}
                            autoFocus
                          />
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={saveTimeEdit}
                            className='h-6 w-6 p-0'
                          >
                            <Save className='h-3 w-3 text-green-600' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={cancelTimeEdit}
                            className='h-6 w-6 p-0'
                          >
                            <X className='h-3 w-3 text-red-600' />
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center justify-between w-full'>
                          <span
                            className='text-xs cursor-pointer hover:text-blue-600 flex-1'
                            onClick={() => startEditingTime(index)}
                            title='クリックして編集'
                          >
                            {time}
                          </span>
                          {timeSlots.length > 1 && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => removeTimeSlot(index)}
                              className='h-4 w-4 p-0 text-red-500 hover:text-red-700 ml-1'
                            >
                              <Minus className='h-2 w-2' />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className='text-xs text-gray-600 mt-2'>
                  ※
                  時間をクリックすると編集できます。時間を追加・削除すると全職員のスケジュールに反映されます。
                </p>
              </div>

              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center space-x-2'>
                  <Label className='text-sm font-medium'>職員行管理:</Label>
                  <span className='text-sm text-gray-600'>
                    {visualTemplate.staffRows.length}行
                  </span>
                </div>
                <div className='flex space-x-2'>
                  <Button onClick={addStaffRow} size='sm' variant='outline'>
                    <Plus className='h-4 w-4 mr-1' />
                    職員行追加
                  </Button>
                </div>
              </div>

              <div className='border rounded-lg overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-400'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='border border-gray-400 p-2 text-sm font-medium w-16 bg-gray-200'>
                        シフト
                      </th>
                      <th className='border border-gray-400 p-2 text-sm font-medium w-24 bg-gray-200'>
                        名前
                      </th>
                      <th className='border border-gray-400 p-2 text-sm font-medium w-20 bg-gray-200'>
                        職種
                      </th>
                      <th className='border border-gray-400 p-2 text-sm font-medium w-20 bg-gray-200'>
                        エリア
                      </th>
                      {timeSlots.map(time => (
                        <th
                          key={time}
                          className={`border border-gray-400 p-1 text-xs font-medium bg-gray-200 ${
                            time === '申し送り' ? 'w-10' : 'w-20'
                          }`}
                        >
                          {time}
                        </th>
                      ))}
                      <th className='border border-gray-400 p-1 text-xs font-medium bg-gray-200 w-10'>
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visualTemplate.staffRows.map(staff => (
                      <tr key={staff.id} className='hover:bg-gray-50'>
                        <td
                          className={`border border-gray-400 p-2 text-sm ${getShiftBackgroundColor(staff.workType)}`}
                        >
                          <Select
                            value={staff.workType}
                            onValueChange={value =>
                              updateStaffRow(staff.id, 'workType', value)
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {shiftTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td
                          className={`border border-gray-400 p-2 text-sm ${getShiftBackgroundColor(staff.workType)}`}
                        >
                          <Input
                            value={staff.name}
                            onChange={e =>
                              updateStaffRow(staff.id, 'name', e.target.value)
                            }
                            className='h-8 text-xs'
                          />
                        </td>
                        <td
                          className={`border border-gray-400 p-2 text-sm ${getShiftBackgroundColor(staff.workType)}`}
                        >
                          <Select
                            value={staff.position}
                            onValueChange={value =>
                              updateStaffRow(staff.id, 'position', value)
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {professionTypes.map(profession => (
                                <SelectItem key={profession} value={profession}>
                                  {profession}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td
                          className={`border border-gray-400 p-1 text-sm ${getShiftBackgroundColor(staff.workType)}`}
                        >
                          <AreaSelector staff={staff} />
                        </td>
                        {staff.schedule.map((task, timeIndex) => (
                          <td
                            key={timeIndex}
                            className={`border border-gray-400 p-1 text-xs cursor-pointer hover:bg-blue-50 ${getCellBackgroundColor(task)}`}
                            onClick={() => handleCellClick(staff.id, timeIndex)}
                          >
                            <div className='min-h-[20px] flex items-center justify-center'>
                              {task || ''}
                            </div>
                          </td>
                        ))}
                        <td
                          className={`border border-gray-400 p-1 text-center ${getShiftBackgroundColor(staff.workType)}`}
                        >
                          {visualTemplate.staffRows.length > 1 && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => removeStaffRow(staff.id)}
                              className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='border border-gray-400 p-4'>
                <h3 className='text-sm font-medium mb-2 bg-gray-100 p-2 border-b border-gray-400'>
                  申し送り
                </h3>
                <Textarea
                  value={visualTemplate.handoverNotes}
                  onChange={e =>
                    setVisualTemplate({
                      ...visualTemplate,
                      handoverNotes: e.target.value,
                    })
                  }
                  placeholder='申し送り事項のテンプレートを入力してください'
                  className='min-h-[100px] border-0 resize-none focus:ring-0'
                />
              </div>

              <div className='flex justify-end'>
                <Button onClick={saveVisualTemplate}>
                  <Save className='h-4 w-4 mr-2' />
                  テンプレート保存
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <Plus className='h-5 w-5 mr-2' />
                    新しいテンプレート
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='name'>テンプレート名</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='例: 平日日勤テンプレート'
                    />
                  </div>

                  <div>
                    <Label htmlFor='shift'>対象シフト</Label>
                    <Select
                      value={formData.shift}
                      onValueChange={value =>
                        setFormData({ ...formData, shift: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='シフトを選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {shiftTypes.map(shift => (
                          <SelectItem key={shift} value={shift}>
                            {shift}
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
                      placeholder='テンプレートの用途や特徴を入力'
                    />
                  </div>

                  <div>
                    <Label>役割設定</Label>
                    <div className='grid grid-cols-3 gap-2 mt-2'>
                      <Select
                        value={newRole.position}
                        onValueChange={value =>
                          setNewRole({ ...newRole, position: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='役割' />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map(position => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={newRole.assignee}
                        onValueChange={value =>
                          setNewRole({ ...newRole, assignee: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='職種' />
                        </SelectTrigger>
                        <SelectContent>
                          {['介護福祉士', '看護師', '介護士'].map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className='flex'>
                        <Input
                          type='number'
                          value={newRole.count}
                          onChange={e =>
                            setNewRole({
                              ...newRole,
                              count: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          min='1'
                          className='w-16'
                        />
                        <Button onClick={addRole} size='sm' className='ml-2'>
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {formData.roles.length > 0 && (
                    <div>
                      <Label>設定済み役割</Label>
                      <div className='space-y-2 mt-2'>
                        {formData.roles.map((role, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between p-2 bg-gray-50 rounded'
                          >
                            <div className='flex items-center space-x-2'>
                              <Badge className='bg-blue-100 text-blue-800'>
                                {role.position}
                              </Badge>
                              <Badge variant='outline'>{role.assignee}</Badge>
                              <span className='text-sm text-gray-600'>
                                {role.count}人
                              </span>
                            </div>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => removeRole(index)}
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleSave} className='w-full'>
                    テンプレート保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <FileText className='h-5 w-5 mr-2' />
                  登録済みテンプレート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <h3 className='font-medium'>{template.name}</h3>
                          <div className='flex items-center space-x-2 mt-1'>
                            <Badge className={getShiftColor(template.shift)}>
                              {template.shift}
                            </Badge>
                            <span className='text-sm text-gray-600'>
                              使用回数: {template.usageCount}回
                            </span>
                          </div>
                        </div>
                        <div className='flex space-x-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => duplicateTemplate(template)}
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
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

                      <p className='text-sm text-gray-600 mb-3'>
                        {template.description}
                      </p>

                      <div>
                        <p className='text-sm font-medium text-gray-700 mb-2'>
                          役割構成
                        </p>
                        <div className='space-y-1'>
                          {template.roles.map((role, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between text-sm'
                            >
                              <div className='flex items-center space-x-2'>
                                <Badge variant='outline' className='text-xs'>
                                  {role.position}
                                </Badge>
                                <span className='text-gray-600'>
                                  {role.assignee}
                                </span>
                              </div>
                              <span className='text-gray-600'>
                                {role.count}人
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          open={selectedCell !== null}
          onOpenChange={() => setSelectedCell(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center'>
                <Edit className='h-5 w-5 mr-2' />
                役割設定
              </DialogTitle>
              <div className='text-sm text-gray-600'>
                {selectedCell && (
                  <>
                    職員:{' '}
                    {
                      visualTemplate.staffRows.find(
                        row => row.id === selectedCell.staffId
                      )?.name
                    }{' '}
                    | 時間: {timeSlots[selectedCell.timeIndex]}
                  </>
                )}
              </div>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='role'>役割</Label>
                <Select value={editingRole} onValueChange={setEditingRole}>
                  <SelectTrigger>
                    <SelectValue placeholder='役割を選択してください' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='なし'>なし</SelectItem>
                    {roleOptions.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex justify-end space-x-2'>
                <Button variant='outline' onClick={() => setSelectedCell(null)}>
                  キャンセル
                </Button>
                <Button
                  onClick={() => {
                    if (selectedCell) {
                      updateScheduleCell(
                        selectedCell.staffId,
                        selectedCell.timeIndex,
                        editingRole
                      );
                    }
                  }}
                >
                  設定
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
