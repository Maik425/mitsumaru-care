'use client';

import {
  Calendar,
  ArrowLeft,
  Download,
  Share2,
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  Printer,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';

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
import { Textarea } from '@/components/ui/textarea';

interface StaffMember {
  id: number;
  name: string;
  position: string;
  employment: string;
  qualification: string;
  category: string;
  maxHoursPerWeek?: number;
  preferredDaysOff?: number[];
  email?: string;
}

export function ShiftCreateForm() {
  const [selectedMonth, setSelectedMonth] = useState('2025-03');
  const [viewMode, setViewMode] = useState<'current' | 'past' | 'future'>(
    'current'
  );
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Record<string, string>>({});
  const [pastShifts, setPastShifts] = useState<Record<string, string>>({});
  const [futureShifts, setFutureShifts] = useState<Record<string, string>>({});
  const [staffRequirements, setStaffRequirements] = useState({
    早番: 2,
    日勤: 3,
    遅番: 2,
  });
  const [dailyStaffRequirements, setDailyStaffRequirements] = useState<
    Record<string, { 早番: number; 日勤: number; 遅番: number }>
  >({});
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [specialEvents, setSpecialEvents] = useState<
    Array<{
      id: string;
      type: 'meeting' | 'business_trip' | 'training' | 'other';
      title: string;
      startDate: number;
      endDate: number;
      targetStaff?: string[];
      rule: 'increase_regular' | 'exclude_from_floor' | 'custom';
      description: string;
    }>
  >([
    {
      id: '1',
      type: 'business_trip',
      title: '鈴木一郎 出張',
      startDate: 12,
      endDate: 14,
      targetStaff: ['鈴木 一郎'],
      rule: 'exclude_from_floor',
      description: '出勤状態だが現場配置に含めない、その他の役割に振る',
    },
  ]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    type: 'meeting' | 'business_trip' | 'training' | 'other';
    title: string;
    startDate: number;
    endDate: number;
    targetStaff: string[];
    rule: 'increase_regular' | 'exclude_from_floor' | 'custom';
    description: string;
  }>({
    type: 'meeting',
    title: '',
    startDate: 1,
    endDate: 1,
    targetStaff: [],
    rule: 'increase_regular',
    description: '',
  });

  const staff: StaffMember[] = useMemo(
    () => [
      // 相談員
      {
        id: 1,
        name: '田中 太郎',
        position: '相談員',
        employment: '常勤',
        qualification: '介福',
        category: '相談員',
        maxHoursPerWeek: 40,
        email: 'tanaka@example.com',
      },
      {
        id: 2,
        name: '佐藤 花子',
        position: '相談員',
        employment: '常勤',
        qualification: '介福',
        category: '相談員',
        maxHoursPerWeek: 40,
        email: 'sato@example.com',
      },
      {
        id: 3,
        name: '鈴木 一郎',
        position: '主任相談員',
        employment: '常勤',
        qualification: '介福',
        category: '相談員',
        maxHoursPerWeek: 40,
        email: 'suzuki@example.com',
      },

      // 介護職員
      {
        id: 4,
        name: '高橋 美咲',
        position: '介護職員',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        maxHoursPerWeek: 40,
        email: 'takahashi@example.com',
      },
      {
        id: 5,
        name: '伊藤 健太',
        position: '主任介護職員',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        maxHoursPerWeek: 40,
        email: 'ito@example.com',
      },
      {
        id: 6,
        name: '渡辺 由美',
        position: '介護職員',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        maxHoursPerWeek: 40,
        email: 'watanabe@example.com',
      },
      {
        id: 7,
        name: '山田 大輔',
        position: '介護職員',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        maxHoursPerWeek: 40,
        email: 'yamada@example.com',
      },
      {
        id: 8,
        name: '中村 愛子',
        position: '介護職員',
        employment: '常勤',
        qualification: '',
        category: '介護職員',
        maxHoursPerWeek: 40,
        email: 'nakamura@example.com',
      },
      {
        id: 9,
        name: '小林 雄介',
        position: '介護職員',
        employment: '常勤',
        qualification: '',
        category: '介護職員',
        maxHoursPerWeek: 40,
        email: 'kobayashi@example.com',
      },
      {
        id: 10,
        name: '加藤 真理',
        position: '介護職員',
        employment: '常勤',
        qualification: '',
        category: '介護職員',
        maxHoursPerWeek: 40,
        email: 'kato@example.com',
      },
      {
        id: 11,
        name: '吉田 春香',
        position: '介護職員',
        employment: '非常勤',
        qualification: '介福',
        category: '介護職員',
        maxHoursPerWeek: 20,
        email: 'yoshida@example.com',
      },
      {
        id: 12,
        name: '松本 恵子',
        position: '介護職員',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
        maxHoursPerWeek: 24,
        email: 'matsumoto@example.com',
      },
      {
        id: 13,
        name: '井上 理恵',
        position: '介護職員',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
        maxHoursPerWeek: 16,
        email: 'inoue@example.com',
      },
      {
        id: 14,
        name: '木村 朋子',
        position: '介護職員',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
        maxHoursPerWeek: 20,
        email: 'kimura@example.com',
      },
      {
        id: 15,
        name: '斉藤 茂雄',
        position: '介護職員',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
        maxHoursPerWeek: 16,
        email: 'saito@example.com',
      },

      // 機能訓練員
      {
        id: 16,
        name: '清水 太一',
        position: '機能訓練員',
        employment: '常勤',
        qualification: 'PT',
        category: '機能訓練員',
        maxHoursPerWeek: 40,
        email: 'shimizu@example.com',
      },
      {
        id: 17,
        name: '山本 一夫',
        position: '機能訓練員',
        employment: '非常勤',
        qualification: 'PT',
        category: '機能訓練員',
        maxHoursPerWeek: 20,
        email: 'yamamoto@example.com',
      },

      // 看護職員
      {
        id: 18,
        name: '森田 花音',
        position: '看護職員',
        employment: '常勤',
        qualification: 'NS',
        category: '看護職員',
        maxHoursPerWeek: 40,
        email: 'morita@example.com',
      },
      {
        id: 19,
        name: '佐々木 有香',
        position: '看護職員',
        employment: '非常勤',
        qualification: 'NS',
        category: '看護職員',
        maxHoursPerWeek: 24,
        email: 'sasaki@example.com',
      },
      {
        id: 20,
        name: '江藤 拓也',
        position: '看護職員',
        employment: '非常勤',
        qualification: 'NS',
        category: '看護職員',
        maxHoursPerWeek: 16,
        email: 'eto@example.com',
      },
    ],
    []
  );

  const shiftTypes = useMemo(
    () => [
      {
        code: '早',
        name: '早番',
        time: '8:30-17:30',
        color: 'bg-blue-100 text-blue-800',
        hours: 8,
      },
      {
        code: '日',
        name: '日勤',
        time: '9:00-18:00',
        color: 'bg-green-100 text-green-800',
        hours: 8,
      },
      {
        code: '遅',
        name: '遅番',
        time: '10:30-19:30',
        color: 'bg-orange-100 text-orange-800',
        hours: 8,
      },
      {
        code: '休',
        name: '公休',
        time: '',
        color: 'bg-gray-100 text-gray-800',
        hours: 0,
      },
      {
        code: '有',
        name: '有給',
        time: '',
        color: 'bg-purple-100 text-purple-800',
        hours: 0,
      },
    ],
    []
  );

  const getMonthData = useCallback(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return { year, month, daysInMonth };
  }, [selectedMonth]);

  const { year, month, daysInMonth } = getMonthData();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const groupedStaff = useMemo(() => {
    return staff.reduce(
      (acc, person) => {
        if (!acc[person.category]) {
          acc[person.category] = [];
        }
        acc[person.category].push(person);
        return acc;
      },
      {} as Record<string, StaffMember[]>
    );
  }, [staff]);

  const getQualificationBadge = useCallback((qualification: string) => {
    if (!qualification) return null;
    const colors = {
      介福: 'bg-blue-100 text-blue-800',
      PT: 'bg-green-100 text-green-800',
      NS: 'bg-red-100 text-red-800',
    };
    return (
      <Badge
        className={
          colors[qualification as keyof typeof colors] ||
          'bg-gray-100 text-gray-800'
        }
      >
        {qualification}
      </Badge>
    );
  }, []);

  const getCellKey = useCallback(
    (staffId: number, date: number) => `${staffId}-${date}`,
    []
  );

  const getCurrentShifts = useCallback(() => {
    switch (viewMode) {
      case 'past':
        return pastShifts;
      case 'future':
        return futureShifts;
      default:
        return shifts;
    }
  }, [viewMode, shifts, pastShifts, futureShifts]);

  const getShiftValue = useCallback(
    (staffId: number, date: number) => {
      const currentShifts = getCurrentShifts();
      return currentShifts[getCellKey(staffId, date)] || '日';
    },
    [getCurrentShifts, getCellKey]
  );

  const handleCellClick = useCallback(
    (staffId: number, date: number) => {
      if (viewMode === 'past') return; // 過去分は編集不可
      const key = getCellKey(staffId, date);
      setEditingCell(key);
    },
    [getCellKey, viewMode]
  );

  const handleShiftChange = useCallback(
    (staffId: number, date: number, value: string) => {
      const key = getCellKey(staffId, date);
      if (viewMode === 'future') {
        setFutureShifts(prev => ({ ...prev, [key]: value }));
      } else {
        setShifts(prev => ({ ...prev, [key]: value }));
      }
      setEditingCell(null);
    },
    [getCellKey, viewMode]
  );

  const copyFromPastMonth = useCallback(async () => {
    // 過去月のシフトを現在月にコピー
    setShifts({ ...pastShifts });
  }, [pastShifts]);

  const saveShifts = useCallback(async () => {
    setIsSaving(true);
    // シミュレート：実際の保存処理
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('シフトが保存されました');
  }, []);

  const exportToExcel = useCallback(async () => {
    setIsExporting(true);
    // シミュレート：Excel出力処理
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    alert('Excelファイルがダウンロードされました');
  }, []);

  const printShifts = useCallback(() => {
    window.print();
  }, []);

  const shareWithStaff = useCallback(async () => {
    setIsSharing(true);
    // シミュレート：職員への共有処理
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsSharing(false);
    alert('全職員にシフト表が共有されました');
  }, []);

  const generateAutoShift = useCallback(async () => {
    setIsGenerating(true);

    // シミュレート：実際の自動生成ロジック
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newShifts: Record<string, string> = {};

    // 基本的な自動生成ロジック
    staff.forEach(person => {
      for (let date = 1; date <= daysInMonth; date++) {
        const key = getCellKey(person.id, date);
        const dayOfWeek = new Date(year, month - 1, date).getDay();

        // 日曜日は施設休業のため全職員休み
        if (dayOfWeek === 0) {
          newShifts[key] = '休';
        }
        // 土曜日は休みの確率を高める（完全週休2日制）
        else if (dayOfWeek === 6) {
          newShifts[key] = Math.random() > 0.8 ? '日' : '休';
        } else {
          // 平日は勤務パターンを分散
          const shiftOptions = ['早', '日', '遅'];
          newShifts[key] =
            shiftOptions[Math.floor(Math.random() * shiftOptions.length)];
        }
      }
    });

    if (viewMode === 'future') {
      setFutureShifts(newShifts);
    } else {
      setShifts(newShifts);
    }
    setIsGenerating(false);
  }, [staff, daysInMonth, year, month, getCellKey, viewMode]);

  const navigateMonth = useCallback(
    (direction: 'prev' | 'next') => {
      const [year, month] = selectedMonth.split('-').map(Number);
      let newYear = year;
      let newMonth = month;

      if (direction === 'prev') {
        newMonth -= 1;
        if (newMonth < 1) {
          newMonth = 12;
          newYear -= 1;
        }
      } else {
        newMonth += 1;
        if (newMonth > 12) {
          newMonth = 1;
          newYear += 1;
        }
      }

      setSelectedMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
    },
    [selectedMonth]
  );

  const getViewModeTitle = useCallback(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const baseTitle = `令和${year - 2018}年${month}月シフト表`;

    switch (viewMode) {
      case 'past':
        return `${baseTitle} (過去分・確認用)`;
      case 'future':
        return `${baseTitle} (来月分・予定)`;
      default:
        return `${baseTitle} (現在)`;
    }
  }, [selectedMonth, viewMode]);

  const getDailyRequirement = useCallback(
    (day: number, shiftType: keyof typeof staffRequirements) => {
      const dayStr = day.toString();
      return (
        dailyStaffRequirements[dayStr]?.[shiftType] ||
        staffRequirements[shiftType]
      );
    },
    [dailyStaffRequirements, staffRequirements]
  );

  const ShiftCell = useCallback(
    ({ staffId, date }: { staffId: number; date: number }) => {
      const key = getCellKey(staffId, date);
      const value = getShiftValue(staffId, date);
      const isEditing = editingCell === key;
      const dayOfWeek = new Date(year, month - 1, date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isSunday = dayOfWeek === 0; // 日曜日判定
      const shiftType = shiftTypes.find(s => s.code === value);
      const isReadOnly = viewMode === 'past' || isSunday; // 日曜日は編集不可

      // 日曜日は強制的に「休」を表示
      const displayValue = isSunday ? '休' : value;

      if (isEditing && !isReadOnly) {
        return (
          <div className={`border-r ${isWeekend ? 'bg-red-50' : ''}`}>
            <Select
              value={displayValue}
              onValueChange={newValue =>
                handleShiftChange(staffId, date, newValue)
              }
            >
              <SelectTrigger className='h-12 text-xs border-0 rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map(shift => (
                  <SelectItem key={shift.code} value={shift.code}>
                    <div className='flex items-center space-x-2'>
                      <Badge className={shift.color}>{shift.code}</Badge>
                      <span>{shift.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      return (
        <div
          className={`border-r h-12 flex items-center justify-center ${
            !isReadOnly ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'
          } ${isWeekend ? 'bg-red-50' : ''} ${isReadOnly ? 'opacity-75' : ''} ${isSunday ? 'bg-gray-200' : ''}`}
          onClick={() => !isReadOnly && handleCellClick(staffId, date)}
        >
          <Badge
            className={
              isSunday
                ? 'bg-gray-100 text-gray-800'
                : shiftType?.color || 'bg-gray-100 text-gray-800'
            }
          >
            {displayValue}
          </Badge>
        </div>
      );
    },
    [
      editingCell,
      getCellKey,
      getShiftValue,
      handleCellClick,
      handleShiftChange,
      shiftTypes,
      year,
      month,
      viewMode,
    ]
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <Link href='/facility/dashboard'>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  ダッシュボードに戻る
                </Button>
              </Link>
              <h1 className='text-xl font-semibold text-gray-900 ml-4'>
                シフト詳細設定
              </h1>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={printShifts}>
                <Printer className='h-4 w-4 mr-2' />
                印刷
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={exportToExcel}
                disabled={isExporting}
              >
                <Download className='h-4 w-4 mr-2' />
                {isExporting ? '出力中...' : 'Excel出力'}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={shareWithStaff}
                disabled={isSharing}
              >
                <Share2 className='h-4 w-4 mr-2' />
                {isSharing ? '共有中...' : '職員共有'}
              </Button>
              <Button size='sm' onClick={saveShifts} disabled={isSaving}>
                <Save className='h-4 w-4 mr-2' />
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Calendar className='h-5 w-5 mr-2' />
                月選択・表示切替
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  <Input
                    type='month'
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className='flex-1'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
                <div className='space-y-2'>
                  <Label>表示モード</Label>
                  <Select
                    value={viewMode}
                    onValueChange={(value: 'current' | 'past' | 'future') =>
                      setViewMode(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='past'>過去分確認</SelectItem>
                      <SelectItem value='current'>現在編集</SelectItem>
                      <SelectItem value='future'>来月予定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 人数設定セクション全体を削除 */}

          {/* 特別イベント設定 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span className='flex items-center'>
                  <Calendar className='h-5 w-5 mr-2' />
                  特別イベント
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='sm'>
                      新規登録
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>特別イベント新規登録</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-6'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label className='text-sm font-medium'>
                            イベント種別
                          </Label>
                          <Select
                            value={newEvent.type}
                            onValueChange={(
                              value:
                                | 'meeting'
                                | 'business_trip'
                                | 'training'
                                | 'other'
                            ) =>
                              setNewEvent(prev => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='meeting'>会議</SelectItem>
                              <SelectItem value='business_trip'>
                                出張
                              </SelectItem>
                              <SelectItem value='training'>研修</SelectItem>
                              <SelectItem value='other'>その他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className='text-sm font-medium'>
                            配置ルール
                          </Label>
                          <Select
                            value={newEvent.rule}
                            onValueChange={(
                              value:
                                | 'increase_regular'
                                | 'exclude_from_floor'
                                | 'custom'
                            ) =>
                              setNewEvent(prev => ({ ...prev, rule: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='increase_regular'>
                                常勤職員増員
                              </SelectItem>
                              <SelectItem value='exclude_from_floor'>
                                現場配置除外
                              </SelectItem>
                              <SelectItem value='custom'>カスタム</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className='text-sm font-medium'>
                          イベント名
                        </Label>
                        <Input
                          value={newEvent.title}
                          onChange={e =>
                            setNewEvent(prev => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder='イベント名を入力'
                          className='mt-1'
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label className='text-sm font-medium'>開始日</Label>
                          <Input
                            type='number'
                            min='1'
                            max={daysInMonth}
                            value={newEvent.startDate}
                            onChange={e =>
                              setNewEvent(prev => ({
                                ...prev,
                                startDate: Number.parseInt(e.target.value) || 1,
                              }))
                            }
                            className='mt-1'
                          />
                        </div>
                        <div>
                          <Label className='text-sm font-medium'>終了日</Label>
                          <Input
                            type='number'
                            min='1'
                            max={daysInMonth}
                            value={newEvent.endDate}
                            onChange={e =>
                              setNewEvent(prev => ({
                                ...prev,
                                endDate: Number.parseInt(e.target.value) || 1,
                              }))
                            }
                            className='mt-1'
                          />
                        </div>
                      </div>

                      {newEvent.rule === 'exclude_from_floor' && (
                        <div>
                          <Label className='text-sm font-medium'>
                            対象職員
                          </Label>
                          <Select
                            onValueChange={value => {
                              if (!newEvent.targetStaff.includes(value)) {
                                setNewEvent(prev => ({
                                  ...prev,
                                  targetStaff: [...prev.targetStaff, value],
                                }));
                              }
                            }}
                          >
                            <SelectTrigger className='mt-1'>
                              <SelectValue placeholder='職員を選択' />
                            </SelectTrigger>
                            <SelectContent>
                              {staff.map(person => (
                                <SelectItem key={person.id} value={person.name}>
                                  {person.name} ({person.position})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {newEvent.targetStaff.length > 0 && (
                            <div className='flex flex-wrap gap-2 mt-3'>
                              {newEvent.targetStaff.map(name => (
                                <Badge
                                  key={name}
                                  variant='outline'
                                  className='text-sm'
                                >
                                  {name}
                                  <button
                                    onClick={() =>
                                      setNewEvent(prev => ({
                                        ...prev,
                                        targetStaff: prev.targetStaff.filter(
                                          n => n !== name
                                        ),
                                      }))
                                    }
                                    className='ml-2 text-red-500 hover:text-red-700'
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <Label className='text-sm font-medium'>詳細説明</Label>
                        <Textarea
                          value={newEvent.description}
                          onChange={e =>
                            setNewEvent(prev => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder='イベントの詳細や特別な配置ルールを入力'
                          rows={4}
                          className='mt-1'
                        />
                      </div>

                      <div className='flex space-x-3 pt-4'>
                        <Button
                          onClick={() => {
                            const event = {
                              ...newEvent,
                              id: Date.now().toString(),
                            };
                            setSpecialEvents(prev => [...prev, event]);
                            setNewEvent({
                              type: 'meeting',
                              title: '',
                              startDate: 1,
                              endDate: 1,
                              targetStaff: [],
                              rule: 'increase_regular',
                              description: '',
                            });
                          }}
                          disabled={!newEvent.title}
                          className='flex-1'
                        >
                          登録
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setNewEvent({
                              type: 'meeting',
                              title: '',
                              startDate: 1,
                              endDate: 1,
                              targetStaff: [],
                              rule: 'increase_regular',
                              description: '',
                            });
                          }}
                          className='flex-1'
                        >
                          リセット
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3 max-h-40 overflow-y-auto'>
                {specialEvents.length === 0 ? (
                  <div className='text-sm text-gray-500 text-center py-4'>
                    登録されたイベントはありません
                  </div>
                ) : (
                  specialEvents.map(event => (
                    <div key={event.id} className='border rounded p-3 bg-white'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center space-x-2'>
                          <Badge
                            className={
                              event.type === 'meeting'
                                ? 'bg-blue-100 text-blue-800'
                                : event.type === 'business_trip'
                                  ? 'bg-orange-100 text-orange-800'
                                  : event.type === 'training'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {event.type === 'meeting'
                              ? '会議'
                              : event.type === 'business_trip'
                                ? '出張'
                                : event.type === 'training'
                                  ? '研修'
                                  : 'その他'}
                          </Badge>
                          <span className='text-sm font-medium'>
                            {event.title}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setSpecialEvents(prev =>
                              prev.filter(e => e.id !== event.id)
                            )
                          }
                          className='text-red-500 hover:text-red-700 text-xs'
                        >
                          削除
                        </button>
                      </div>

                      <div className='text-xs text-gray-600 space-y-1'>
                        <div>
                          期間: {event.startDate}日 ～ {event.endDate}日
                        </div>
                        <div>
                          ルール:{' '}
                          {event.rule === 'increase_regular'
                            ? '常勤職員増員'
                            : event.rule === 'exclude_from_floor'
                              ? '現場配置除外'
                              : 'カスタム'}
                        </div>
                        {event.targetStaff && event.targetStaff.length > 0 && (
                          <div>対象: {event.targetStaff.join(', ')}</div>
                        )}
                        {event.description && (
                          <div className='mt-2 p-2 bg-gray-50 rounded text-xs'>
                            {event.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Eye className='h-5 w-5 mr-2' />
                表示状態
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center space-x-2'>
                  <div
                    className={`w-3 h-3 rounded-full ${viewMode === 'past' ? 'bg-gray-500' : viewMode === 'future' ? 'bg-blue-500' : 'bg-green-500'}`}
                  />
                  <span className='font-medium'>
                    {viewMode === 'past'
                      ? '過去分表示'
                      : viewMode === 'future'
                        ? '来月分表示'
                        : '現在編集中'}
                  </span>
                </div>
                <p className='text-gray-600'>
                  {viewMode === 'past'
                    ? '確認専用（編集不可）'
                    : viewMode === 'future'
                      ? '来月の予定作成'
                      : '現在のシフト編集'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>{getViewModeTitle()}</CardTitle>
          </CardHeader>
        </Card>

        <div className='bg-white rounded-lg shadow overflow-x-auto'>
          <div className='min-w-[1200px]'>
            {/* ヘッダー行 */}
            <div className='grid grid-cols-[200px_repeat(31,40px)] gap-0 border-b-2 border-gray-300'>
              <div className='p-2 bg-gray-100 border-r font-semibold text-center'>
                職種・氏名
              </div>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = new Date(year, month - 1, i + 1);
                const dayOfWeek = weekDays[date.getDay()];
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isSunday = date.getDay() === 0;
                const requiredTotal = isSunday
                  ? 0
                  : // 日曜日は必要人数0
                    getDailyRequirement(i + 1, '早番') +
                    getDailyRequirement(i + 1, '日勤') +
                    getDailyRequirement(i + 1, '遅番');
                const isShortage = false; // Placeholder for actual calculation
                const hasCustomSetting =
                  dailyStaffRequirements[(i + 1).toString()];
                const hasSpecialEvent = specialEvents.some(
                  event => i + 1 >= event.startDate && i + 1 <= event.endDate
                );

                return (
                  <div
                    key={i}
                    className={`p-1 text-xs text-center border-r relative ${
                      isWeekend ? 'bg-red-50' : 'bg-gray-100'
                    } ${isShortage ? 'bg-yellow-100' : ''} ${isSunday ? 'bg-gray-200' : ''}`}
                  >
                    <div className='font-semibold'>{i + 1}</div>
                    <div className={isWeekend ? 'text-red-600' : ''}>
                      {dayOfWeek}
                    </div>
                    <div
                      className={`font-bold mt-1 ${isSunday ? 'text-gray-600' : isShortage ? 'text-red-600' : 'text-blue-600'}`}
                    >
                      {isSunday ? '休業' : `${0}/${requiredTotal}`}{' '}
                      {/* 日曜日は休業表示 */}
                    </div>
                    {hasCustomSetting && !isSunday && (
                      <div className='absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full'></div>
                    )}
                    {hasSpecialEvent && !isSunday && (
                      <div className='absolute top-0 left-0 w-2 h-2 bg-purple-400 rounded-full'></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* スタッフ行 */}
            {Object.entries(groupedStaff).map(([category, categoryStaff]) => (
              <div key={category}>
                {/* カテゴリーヘッダー */}
                <div className='grid grid-cols-[200px_repeat(31,40px)] gap-0 bg-blue-50 border-b'>
                  <div className='p-2 font-semibold text-blue-800 border-r'>
                    {category}集計
                  </div>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <div
                      key={i}
                      className='p-1 text-xs text-center border-r bg-blue-50'
                    >
                      <div className='text-blue-600 font-semibold'>
                        {
                          categoryStaff.filter(
                            staff =>
                              getShiftValue(staff.id, i + 1) !== '休' &&
                              getShiftValue(staff.id, i + 1) !== '有'
                          ).length
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {/* スタッフ行 */}
                {categoryStaff.map(person => (
                  <div
                    key={person.id}
                    className='grid grid-cols-[200px_repeat(31,40px)] gap-0 border-b hover:bg-gray-50'
                  >
                    <div className='p-2 border-r'>
                      <div className='text-sm'>
                        <div className='mb-1'>
                          <span className='font-medium'>{person.name}</span>
                        </div>
                        <div className='text-xs text-gray-600'>
                          {person.position}
                        </div>
                        <div className='flex items-center space-x-1 mt-1'>
                          <Badge variant='outline' className='text-xs'>
                            {person.employment}
                          </Badge>
                          {getQualificationBadge(person.qualification)}
                        </div>
                      </div>
                    </div>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <ShiftCell key={i} staffId={person.id} date={i + 1} />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 凡例・情報エリア */}
        <div className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>シフト凡例</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <Badge className='bg-blue-100 text-blue-800'>早</Badge>
                      <span className='text-sm'>早番 8:30~17:30</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge className='bg-green-100 text-green-800'>日</Badge>
                      <span className='text-sm'>日勤 9:00~18:00</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge className='bg-orange-100 text-orange-800'>
                        遅
                      </Badge>
                      <span className='text-sm'>遅番 10:30~19:30</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <Badge className='bg-gray-100 text-gray-800'>休</Badge>
                      <span className='text-sm'>公休</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge className='bg-purple-100 text-purple-800'>
                        有
                      </Badge>
                      <span className='text-sm'>有給</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='mt-4 pt-4 border-t'>
                <div className='text-sm text-gray-600'>
                  <p>※ セルをクリックしてシフトを編集できます（過去分除く）</p>
                  <p>※ 自動生成ボタンで法定基準に基づいたシフトを作成</p>
                  <p>※ 職員共有で全職員にメール通知されます</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>会議等情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Textarea
                  placeholder='会議やイベントの情報を入力してください'
                  defaultValue='管理者会議：3/22（土）18:00~&#10;介護職員会議：3/29（土）18:30~'
                  rows={4}
                />
                <div className='text-sm text-gray-600'>
                  <p>※ 会議等の情報はシフト表に自動で反映されます</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
