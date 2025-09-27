'use client';

import {
  ArrowLeft,
  Calendar,
  Zap,
  Target,
  Clock,
  CheckCircle,
  X,
  Eye,
  Save,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import React from 'react';

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

interface StaffRequirement {
  早番: number;
  日勤: number;
  遅番: number;
}

interface ConfigurationRule {
  id: string;
  type: 'weekly' | 'specific_dates';
  name: string;
  description: string;
  requirements: StaffRequirement;
  // 毎週の場合
  dayOfWeek?: number; // 0=日曜日, 1=月曜日...
  // 特定日付の場合
  dates?: string[]; // ["2025-03-15", "2025-03-22"]
  isActive: boolean;
}

interface SpecificStaffAssignment {
  id: string;
  staffName: string;
  date: string; // "2025-03-15"
  shift: '早番' | '日勤' | '遅番';
  reason?: string;
}

interface SpecialEvent {
  id: string;
  type: 'meeting' | 'business_trip' | 'training' | 'other';
  title: string;
  startDate: number;
  endDate: number;
  targetStaff?: string[];
  rule: 'increase_regular' | 'exclude_from_floor' | 'custom';
  description: string;
}

interface ShiftPattern {
  id: string;
  name: string;
  description: string;
  shifts: { [key: string]: { [shift: string]: string[] } }; // date -> shift -> staff names
  score: number;
  pros: string[];
  cons: string[];
}

interface LeaveRequest {
  staffName: string;
  dates: number[];
  type: string;
}

export function ShiftEditForm(props: {
  initialTitle?: string;
  initialNotes?: string;
  initialLine?: string;
  onSubmit?: (data: { title: string; notes: string; line: string }) => void;
}) {
  const {
    initialTitle = '',
    initialNotes = '',
    initialLine = '',
    onSubmit,
  } = props;

  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(initialNotes);
  const [line, setLine] = useState(initialLine);

  const [selectedMonth, setSelectedMonth] = useState('2025-03');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [showPatternSelection, setShowPatternSelection] = useState(false);
  const [generatedPatterns, setGeneratedPatterns] = useState<ShiftPattern[]>(
    []
  );
  const [selectedPattern, setSelectedPattern] = useState<ShiftPattern | null>(
    null
  );
  const [showDetailedView, setShowDetailedView] = useState<string | null>(null);

  const [basicRequirements, setBasicRequirements] = useState<StaffRequirement>({
    早番: 2,
    日勤: 3,
    遅番: 2,
  });

  const [dailyRequirements, setDailyRequirements] = useState<
    Record<string, { 早番: number; 日勤: number; 遅番: number }>
  >({});

  const [configurationRules, setConfigurationRules] = useState<
    ConfigurationRule[]
  >([
    {
      id: '1',
      type: 'weekly',
      name: '毎週木曜日増員',
      description: '毎週木曜日は日勤配置を4人に増員',
      requirements: { 早番: 2, 日勤: 4, 遅番: 2 },
      dayOfWeek: 4,
      isActive: true,
    },
    {
      id: '2',
      type: 'weekly',
      name: '毎週土曜日削減',
      description: '毎週土曜日は人員を削減',
      requirements: { 早番: 2, 日勤: 2, 遅番: 2 },
      dayOfWeek: 6,
      isActive: true,
    },
    {
      id: '3',
      type: 'specific_dates',
      name: '月中特別配置',
      description: '特定日の人員配置調整',
      requirements: { 早番: 3, 日勤: 4, 遅番: 2 },
      dates: ['2025-03-15', '2025-03-22'],
      isActive: true,
    },
  ]);

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ConfigurationRule | null>(
    null
  );
  const [ruleFormData, setRuleFormData] = useState<Partial<ConfigurationRule>>({
    type: 'specific_dates',
    name: '',
    description: '',
    requirements: { 早番: 2, 日勤: 3, 遅番: 2 },
    dates: [],
    isActive: true,
  });

  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [specificAssignments, setSpecificAssignments] = useState<
    SpecificStaffAssignment[]
  >([
    {
      id: '1',
      staffName: '佐藤 寿子',
      date: '2025-03-10',
      shift: '早番',
      reason: '特別対応のため',
    },
    {
      id: '2',
      staffName: '三浦 涼太',
      date: '2025-03-15',
      shift: '日勤',
      reason: '研修対応',
    },
  ]);

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<SpecificStaffAssignment | null>(null);
  const [assignmentFormData, setAssignmentFormData] = useState<
    Partial<SpecificStaffAssignment>
  >({
    staffName: '',
    date: '',
    shift: '日勤',
    reason: '',
  });

  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([
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
    {
      id: '2',
      type: 'meeting',
      title: '管理者会議',
      startDate: 22,
      endDate: 22,
      rule: 'increase_regular',
      description: '管理者会議のため日勤を1名増員',
    },
  ]);

  const [requestedLeaves, setRequestedLeaves] = useState<LeaveRequest[]>([
    { staffName: '田中 花子', dates: [5, 12, 19], type: '有給' },
    { staffName: '佐藤 太郎', dates: [8, 15], type: '公休希望' },
    { staffName: '山田 次郎', dates: [10, 24], type: '有給' },
  ]);

  const [showEventForm, setShowEventForm] = useState(false);

  const staffList = [
    '佐藤 寿子',
    '茂木 五郎',
    '三浦 涼太',
    '清水 大輔',
    '小林 大樹',
    '沢田 亮介',
    '梓川 咲良',
    '桜井 麻衣',
    '牧野原 子遅',
    '双葉 理奈',
    '古川 朋美',
    '本田 茂雄',
    '佐藤 太郎',
    '山田 一郎',
    '健康 花子',
    '佐々木 有子',
    '江藤 拓海',
  ];

  const getMonthData = useCallback(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return { year, month, daysInMonth };
  }, [selectedMonth]);

  const { year, month, daysInMonth } = getMonthData();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const selectedYear = year;
  const selectedMonthNumber = month;

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 2パターンのシフト表を生成（サンプルデータ）
    const patterns: ShiftPattern[] = [
      {
        id: 'pattern1',
        name: 'バランス重視パターン',
        description: '希望休を最大限考慮し、職員の負担を均等に分散',
        shifts: generateSampleShifts('balanced'),
        score: 85,
        pros: ['希望休充足率95%', '連続勤務日数が均等', '特別イベント対応良好'],
        cons: ['一部の日で最低人員ギリギリ', '土日の配置がやや手薄'],
      },
      {
        id: 'pattern2',
        name: '安定重視パターン',
        description: '人員配置の安定性を重視し、確実な運営を優先',
        shifts: generateSampleShifts('stable'),
        score: 78,
        pros: [
          '全日程で十分な人員確保',
          '管理者配置が安定',
          '緊急時対応余裕あり',
        ],
        cons: ['希望休充足率80%', '一部職員の負担増', 'コスト面でやや高め'],
      },
    ];

    setGeneratedPatterns(patterns);
    setIsGenerating(false);
    setShowPatternSelection(true);
  };

  const generateSampleShifts = (type: 'balanced' | 'stable') => {
    const shifts: { [key: string]: { [shift: string]: string[] } } = {};
    const staff = [
      '田中 花子',
      '佐藤 太郎',
      '山田 次郎',
      '鈴木 一郎',
      '高橋 美咲',
      '伊藤 健太',
      '渡辺 由美',
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      if (type === 'balanced') {
        shifts[dateKey] = {
          早番: [staff[day % 7], staff[(day + 1) % 7]],
          日勤: [
            staff[(day + 2) % 7],
            staff[(day + 3) % 7],
            staff[(day + 4) % 7],
          ],
          遅番: [staff[(day + 5) % 7], staff[(day + 6) % 7]],
        };
      } else {
        shifts[dateKey] = {
          早番: [staff[day % 7], staff[(day + 1) % 7], staff[(day + 2) % 7]],
          日勤: [
            staff[(day + 3) % 7],
            staff[(day + 4) % 7],
            staff[(day + 5) % 7],
            staff[(day + 6) % 7],
          ],
          遅番: [staff[(day + 1) % 7], staff[(day + 3) % 7]],
        };
      }
    }

    return shifts;
  };

  const handlePatternSelect = (pattern: ShiftPattern) => {
    setSelectedPattern(pattern);
    setShowPatternSelection(false);
    setGenerationComplete(true);

    if (onSubmit) {
      onSubmit({ title, notes, line });
    }
  };

  const openRuleForm = (rule?: ConfigurationRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleFormData({ ...rule });
      setSelectedDates(
        rule.dates ? rule.dates.map(d => Number.parseInt(d.split('-')[2])) : []
      );
    } else {
      setEditingRule(null);
      setRuleFormData({
        type: 'specific_dates',
        name: '',
        description: '',
        requirements: { ...basicRequirements },
        dates: [],
        isActive: true,
      });
      setSelectedDates([]);
    }
    setShowRuleForm(true);
  };

  const saveConfigurationRule = () => {
    if (!ruleFormData.name) return;

    const newRule: ConfigurationRule = {
      id: editingRule?.id || Date.now().toString(),
      type: ruleFormData.type!,
      name: ruleFormData.name,
      description: ruleFormData.description || '',
      requirements: ruleFormData.requirements!,
      dayOfWeek: ruleFormData.dayOfWeek,
      dates:
        ruleFormData.type === 'specific_dates'
          ? selectedDates.map(
              d =>
                `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
            )
          : undefined,
      isActive: ruleFormData.isActive!,
    };

    if (editingRule) {
      setConfigurationRules(
        configurationRules.map(rule =>
          rule.id === editingRule.id ? newRule : rule
        )
      );
    } else {
      setConfigurationRules([...configurationRules, newRule]);
    }

    setShowRuleForm(false);
    setEditingRule(null);
  };

  const removeConfigurationRule = (id: string) => {
    setConfigurationRules(configurationRules.filter(rule => rule.id !== id));
  };

  const toggleRuleActive = (id: string) => {
    setConfigurationRules(
      configurationRules.map(rule =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const generateDateOptions = () => {
    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      dates.push(dateStr);
    }
    return dates;
  };

  const toggleDateSelection = (date: string) => {
    const dayNumber = Number.parseInt(date.split('-')[2]);
    setSelectedDates(prev =>
      prev.includes(dayNumber)
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber].sort()
    );
  };

  const formatDateForDisplay = (dateStr: string) => {
    const [, , day] = dateStr.split('-');
    return `${month}/${Number.parseInt(day)}`;
  };

  const removeSpecialEvent = (id: string) => {
    setSpecialEvents(specialEvents.filter(event => event.id !== id));
  };

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setAssignmentFormData({
      staffName: '',
      date: '',
      shift: '日勤',
      reason: '',
    });
    setShowAssignmentForm(true);
  };

  const handleEditAssignment = (assignment: SpecificStaffAssignment) => {
    setEditingAssignment(assignment);
    setAssignmentFormData(assignment);
    setShowAssignmentForm(true);
  };

  const handleSaveAssignment = () => {
    if (
      !assignmentFormData.staffName ||
      !assignmentFormData.date ||
      !assignmentFormData.shift
    ) {
      return;
    }

    const newAssignment: SpecificStaffAssignment = {
      id: editingAssignment?.id || Date.now().toString(),
      staffName: assignmentFormData.staffName!,
      date: assignmentFormData.date!,
      shift: assignmentFormData.shift!,
      reason: assignmentFormData.reason || '',
    };

    if (editingAssignment) {
      setSpecificAssignments(prev =>
        prev.map(assignment =>
          assignment.id === editingAssignment.id ? newAssignment : assignment
        )
      );
    } else {
      setSpecificAssignments(prev => [...prev, newAssignment]);
    }

    setShowAssignmentForm(false);
  };

  const handleDeleteAssignment = (id: string) => {
    setSpecificAssignments(prev =>
      prev.filter(assignment => assignment.id !== id)
    );
  };

  const ShiftTablePreview = ({ pattern }: { pattern: ShiftPattern }) => {
    const year = selectedMonth.split('-')[0];
    const month = selectedMonth.split('-')[1];
    const monthName = `令和${Number(year) - 2018}年${Number(month)}月`;

    // 月の日数を取得
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][
        new Date(date).getDay()
      ];
      return { day, date, dayOfWeek };
    });

    // 職員データ（サンプル）
    const staffData = [
      // 相談員
      {
        name: '佐○寿○',
        position: '相談員',
        employment: '常勤',
        qualification: '介福',
        category: '相談員',
      },
      {
        name: '茂○五○',
        position: '相談員',
        employment: '常勤',
        qualification: '介福',
        category: '相談員',
      },
      {
        name: '三○涼○',
        position: '主任',
        employment: '常勤',
        qualification: '介福',
        category: '相談員',
      },

      // 介護職員
      {
        name: '佐○寿○',
        position: '相談員兼介護',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        special: '☆お',
      },
      {
        name: '茂○吾○',
        position: '主任兼介護',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        special: 'L',
      },
      {
        name: '三○涼○',
        position: '主任兼介護',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
      },
      {
        name: '清○大○',
        position: '介護',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        special: '連',
      },
      {
        name: '小○大○',
        position: '介護',
        employment: '常勤',
        qualification: '介福',
        category: '介護職員',
        special: '☆',
      },
      {
        name: '沢○亮○',
        position: '介護',
        employment: '常勤',
        qualification: '',
        category: '介護職員',
      },
      {
        name: '梓○咲○',
        position: '介護',
        employment: '常勤',
        qualification: '',
        category: '介護職員',
        special: '☆',
      },
      {
        name: '桜○麻○',
        position: '介護',
        employment: '非常勤',
        qualification: '介福',
        category: '介護職員',
      },
      {
        name: '牧○原○子',
        position: '介護',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
        special: 'P',
      },
      {
        name: '双○理○',
        position: '介護',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
      },
      {
        name: '古○朋○',
        position: '介護',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
      },
      {
        name: '本○茂○',
        position: '介護',
        employment: '非常勤',
        qualification: '',
        category: '介護職員',
      },

      // 機能訓練員
      {
        name: '佐○太○',
        position: '機能訓練員',
        employment: '常勤',
        qualification: 'PT',
        category: '機能訓練員',
      },
      {
        name: '山○一○',
        position: '機能訓練員',
        employment: '非常勤',
        qualification: 'PT',
        category: '機能訓練員',
      },

      // 看護職員
      {
        name: '健○花○',
        position: '看護師',
        employment: '常勤',
        qualification: 'NS',
        category: '看護職員',
      },
      {
        name: '佐○木有○',
        position: '看護師',
        employment: '非常勤',
        qualification: 'NS',
        category: '看護職員',
      },
      {
        name: '江○拓○',
        position: '看護師',
        employment: '非常勤',
        qualification: 'NS',
        category: '看護職員',
      },
    ];

    // 勤務パターンを実際の形式に変換
    const getShiftSymbol = (shiftType: string, isHoliday = false) => {
      if (isHoliday) return '休';
      switch (shiftType) {
        case '早番':
          return '早';
        case '日勤':
          return '日';
        case '遅番':
          return '遅';
        case '休み':
          return '休';
        case '有給':
          return '有';
        default:
          return '日';
      }
    };

    // 職員の特定日のシフトを取得するヘルパー関数
    const getStaffShiftForDate = (
      staffName: string,
      date: string,
      shifts: any
    ) => {
      // 各時間帯をチェックして職員のシフトを見つける
      for (const [shiftType, staffList] of Object.entries(shifts)) {
        if (Array.isArray(staffList) && staffList.includes(staffName)) {
          return shiftType === '早番'
            ? '早'
            : shiftType === '日勤'
              ? '日'
              : '遅';
        }
      }

      // シフトに配置されていない場合は休みとみなす
      return '休';
    };

    // 各職員の月間シフトを生成
    const generateMonthlyShift = (staff: any) => {
      return dates.map(({ date, dayOfWeek }) => {
        const shifts = pattern.shifts[date] || { 早番: [], 日勤: [], 遅番: [] };
        const isAssigned = Object.values(shifts).flat().includes(staff.name);
        const isWeekend = dayOfWeek === '土' || dayOfWeek === '日';

        if (!isAssigned && isWeekend) return '休';
        if (!isAssigned) return Math.random() > 0.8 ? '有' : '休';

        // 割り当てられている勤務を探す
        for (const [shiftType, staffList] of Object.entries(shifts)) {
          if (staffList.includes(staff.name)) {
            return getShiftSymbol(shiftType);
          }
        }
        return '日';
      });
    };

    const calculateCategoryTotals = (category: string) => {
      return dates.map(({ date, dayOfWeek }) => {
        const shifts = pattern.shifts[date] || { 早番: [], 日勤: [], 遅番: [] };
        const categoryStaff = staffData.filter(s => s.category === category);

        // 日曜日は基本的に休日とする
        if (dayOfWeek === '日') {
          return 0;
        }

        // 実際に出勤する職員をカウント
        let workingCount = 0;
        categoryStaff.forEach(staff => {
          // 各時間帯で職員が配置されているかチェック
          const isWorking =
            shifts.早番?.includes(staff.name) ||
            shifts.日勤?.includes(staff.name) ||
            shifts.遅番?.includes(staff.name);

          if (isWorking) {
            workingCount++;
          }
        });

        return workingCount;
      });
    };

    const categories = [
      { name: '相談員', staff: staffData.filter(s => s.category === '相談員') },
      {
        name: '介護職員',
        staff: staffData.filter(s => s.category === '介護職員'),
      },
      {
        name: '機能訓練員',
        staff: staffData.filter(s => s.category === '機能訓練員'),
      },
      {
        name: '看護職員',
        staff: staffData.filter(s => s.category === '看護職員'),
      },
    ];

    return (
      <div className='bg-white p-6 rounded-lg border'>
        <div className='mb-6'>
          <h3 className='text-xl font-bold text-center mb-2'>{monthName}</h3>
          <div className='text-center text-sm text-gray-600 mb-4'>
            早番 8:30~17:30 ☆入浴 L日勤 9:00~18:00 お遅番時間帯責任者連 遅番
            10:30~19:30 Pリハビリ補佐
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-xs border-collapse'>
            {/* ヘッダー行 */}
            <thead>
              <tr>
                <th className='border p-1 bg-gray-100 min-w-[120px]'>
                  職種・氏名
                </th>
                <th className='border p-1 bg-gray-100 w-16'>雇用</th>
                <th className='border p-1 bg-gray-100 w-16'>資格</th>
                {dates.map(({ day, dayOfWeek }) => (
                  <th key={day} className='border p-1 bg-gray-100 w-8'>
                    <div className='text-center'>
                      <div>{day}</div>
                      <div
                        className={
                          dayOfWeek === '土' || dayOfWeek === '日'
                            ? 'text-red-600'
                            : ''
                        }
                      >
                        {dayOfWeek}
                      </div>
                    </div>
                  </th>
                ))}
                <th className='border p-1 bg-gray-100 w-16'>日勤</th>
                <th className='border p-1 bg-gray-100 w-16'>公休</th>
                <th className='border p-1 bg-gray-100 w-16'>有給</th>
              </tr>
            </thead>

            <tbody>
              {categories.map(category => (
                <React.Fragment key={category.name}>
                  {/* 職種別集計行 */}
                  <tr className='bg-blue-50'>
                    <td className='border p-1 font-bold'>
                      {category.name}集計
                    </td>
                    <td className='border p-1'></td>
                    <td className='border p-1'></td>
                    {calculateCategoryTotals(category.name).map(
                      (count, index) => (
                        <td
                          key={index}
                          className='border p-1 text-center font-bold'
                        >
                          {count}
                        </td>
                      )
                    )}
                    <td className='border p-1'></td>
                    <td className='border p-1'></td>
                    <td className='border p-1'></td>
                  </tr>

                  {/* 職員行 */}
                  {category.staff.map(staff => {
                    const monthlyShift = generateMonthlyShift(staff);
                    const workDays = monthlyShift.filter(
                      s => s === '日' || s === '早' || s === '遅'
                    ).length;
                    const holidays = monthlyShift.filter(
                      s => s === '休'
                    ).length;
                    const paidLeave = monthlyShift.filter(
                      s => s === '有'
                    ).length;

                    return (
                      <tr key={staff.name}>
                        <td className='border p-1'>
                          <div className='flex flex-col'>
                            <div className='font-medium'>{staff.position}</div>
                            <div className='text-xs text-gray-600'>
                              {staff.special || ''}
                            </div>
                            <div>{staff.name}</div>
                          </div>
                        </td>
                        <td className='border p-1 text-center'>
                          {staff.employment}
                        </td>
                        <td className='border p-1 text-center'>
                          {staff.qualification}
                        </td>
                        {monthlyShift.map((shift, index) => (
                          <td key={index} className='border p-1 text-center'>
                            <span
                              className={
                                shift === '有'
                                  ? 'text-green-600 bg-green-50'
                                  : shift === '休'
                                    ? 'text-red-600 bg-red-50'
                                    : shift === '早'
                                      ? 'text-blue-600'
                                      : shift === '遅'
                                        ? 'text-orange-600'
                                        : ''
                              }
                            >
                              {shift}
                            </span>
                          </td>
                        ))}
                        <td className='border p-1 text-center'>{workDays}</td>
                        <td className='border p-1 text-center'>{holidays}</td>
                        <td className='border p-1 text-center'>{paidLeave}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-4 text-xs text-gray-600'>
          <div className='mb-2'>
            <strong>会議等情報</strong>
          </div>
          <div>管理者会議：3/22（土）18:00~</div>
          <div>介護職員会議：3/29（土）18:30~</div>
          <div className='mt-2 text-right'>
            {new Date().toLocaleDateString('ja-JP')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {showDetailedView && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg w-full max-w-[95vw] h-full max-h-[95vh] overflow-hidden flex flex-col'>
            <div className='p-4 border-b flex justify-between items-center'>
              <h2 className='text-xl font-bold'>
                シフト表詳細 - パターン{showDetailedView}
              </h2>
              <Button
                variant='outline'
                onClick={() => setShowDetailedView(null)}
              >
                <X className='h-4 w-4 mr-2' />
                閉じる
              </Button>
            </div>
            <div className='flex-1 overflow-auto p-4'>
              <ShiftTablePreview
                pattern={
                  generatedPatterns.find(p => p.id === showDetailedView)!
                }
              />
            </div>
          </div>
        </div>
      )}

      {showPatternSelection && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col'>
            <div className='p-6 border-b'>
              <h2 className='text-2xl font-bold text-gray-900'>
                シフトパターン選択
              </h2>
              <p className='text-gray-600 mt-2'>
                2つのパターンから最適なシフト表を選択してください
              </p>
            </div>

            <div className='flex-1 overflow-y-auto p-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 h-full'>
                {generatedPatterns.map(pattern => (
                  <Card key={pattern.id} className='h-full flex flex-col'>
                    <CardHeader className='pb-4'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-lg'>
                          {pattern.name}
                        </CardTitle>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='outline' className='text-sm'>
                            スコア: {pattern.score}点
                          </Badge>
                        </div>
                      </div>
                      <p className='text-sm text-gray-600'>
                        {pattern.description}
                      </p>
                    </CardHeader>

                    <CardContent className='flex-1 flex flex-col'>
                      <div className='space-y-4'>
                        <div>
                          <h4 className='font-medium mb-2'>メリット</h4>
                          <ul className='text-sm text-green-600 space-y-1'>
                            {pattern.pros.map((pro, index) => (
                              <li key={index} className='flex items-start'>
                                <span className='mr-2'>•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className='font-medium mb-2'>デメリット</h4>
                          <ul className='text-sm text-red-600 space-y-1'>
                            {pattern.cons.map((con, index) => (
                              <li key={index} className='flex items-start'>
                                <span className='mr-2'>•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className='flex space-x-2'>
                        <Button
                          onClick={() => handlePatternSelect(pattern)}
                          className='flex-1'
                        >
                          <Save className='h-4 w-4 mr-2' />
                          このパターンを選択
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setShowDetailedView(pattern.id)}
                        >
                          <Eye className='h-4 w-4' />
                          詳細表示
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className='p-6 border-t'>
              <Button
                variant='outline'
                onClick={() => setShowPatternSelection(false)}
                className='w-full'
              >
                キャンセル（再生成）
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <Link href='/admin/dashboard'>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  ダッシュボードに戻る
                </Button>
              </Link>
              <h1 className='text-xl font-semibold text-gray-900 ml-4'>
                シフト簡単作成
              </h1>
            </div>
            <div className='flex items-center space-x-2'>
              {generationComplete && selectedPattern && (
                <div className='flex items-center space-x-2'>
                  <Badge className='bg-green-100 text-green-800'>
                    {selectedPattern.name} 選択済み
                  </Badge>
                  <Link href='/admin/shift/edit'>
                    <Button variant='outline' size='sm'>
                      シフト詳細設定へ
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Calendar className='h-5 w-5 mr-2' />
                シフト表情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='month-select'>対象月</Label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='2025-01'>2025年1月</SelectItem>
                      <SelectItem value='2025-02'>2025年2月</SelectItem>
                      <SelectItem value='2025-03'>2025年3月</SelectItem>
                      <SelectItem value='2025-04'>2025年4月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='pt-4 border-t'>
                  <Button
                    onClick={handleAutoGenerate}
                    disabled={isGenerating}
                    className='w-full'
                    size='lg'
                  >
                    {isGenerating ? (
                      <>
                        <Clock className='h-4 w-4 mr-2 animate-spin' />
                        2パターン生成中...
                      </>
                    ) : generationComplete ? (
                      <>
                        <CheckCircle className='h-4 w-4 mr-2' />
                        生成完了
                      </>
                    ) : (
                      <>
                        <Zap className='h-4 w-4 mr-2' />
                        2パターン自動生成
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span className='flex items-center'>
                  <Target className='h-5 w-5 mr-2' />
                  基本人員基準
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='sm'>
                      日付別設定
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                    <DialogHeader>
                      <DialogTitle>日付別人数設定</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-6'>
                      {/* 日付選択エリア */}
                      <div className='border rounded p-4 bg-gray-50'>
                        <div className='text-sm font-medium mb-3'>
                          日付選択（複数選択可）
                        </div>
                        <div className='grid grid-cols-7 gap-2 max-h-48 overflow-y-auto'>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const date = new Date(year, month - 1, day);
                            const dayOfWeek = weekDays[date.getDay()];
                            const isWeekend =
                              date.getDay() === 0 || date.getDay() === 6;
                            const isSelected = selectedDates.includes(day);

                            return (
                              <button
                                key={day}
                                onClick={() => {
                                  setSelectedDates(prev =>
                                    prev.includes(day)
                                      ? prev.filter(d => d !== day)
                                      : [...prev, day]
                                  );
                                }}
                                className={`text-sm p-3 rounded border ${
                                  isSelected
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : isWeekend
                                      ? 'bg-red-50 border-red-200 text-red-600'
                                      : 'bg-white border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                <div className='font-medium'>{day}</div>
                                <div className='text-xs'>{dayOfWeek}</div>
                              </button>
                            );
                          })}
                        </div>
                        <div className='flex items-center justify-between mt-4'>
                          <div className='text-sm text-gray-600'>
                            {selectedDates.length}日選択中
                          </div>
                          <div className='flex space-x-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setSelectedDates([])}
                            >
                              クリア
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                const weekdays = [];
                                for (let day = 1; day <= daysInMonth; day++) {
                                  const date = new Date(year, month - 1, day);
                                  if (
                                    date.getDay() !== 0 &&
                                    date.getDay() !== 6
                                  ) {
                                    weekdays.push(day);
                                  }
                                }
                                setSelectedDates(weekdays);
                              }}
                            >
                              平日選択
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                const weekends = [];
                                for (let day = 1; day <= daysInMonth; day++) {
                                  const date = new Date(year, month - 1, day);
                                  if (
                                    date.getDay() === 0 ||
                                    date.getDay() === 6
                                  ) {
                                    weekends.push(day);
                                  }
                                }
                                setSelectedDates(weekends);
                              }}
                            >
                              週末選択
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 選択日の人数設定 */}
                      {selectedDates.length > 0 && (
                        <div className='border rounded p-4'>
                          <div className='text-sm font-medium mb-4'>
                            選択日の人数設定 ({selectedDates.length}日)
                          </div>
                          <div className='grid grid-cols-3 gap-6'>
                            {Object.entries(basicRequirements).map(
                              ([shift, defaultCount]) => {
                                const currentValue =
                                  selectedDates.length > 0
                                    ? dailyRequirements[
                                        selectedDates[0].toString()
                                      ]?.[
                                        shift as keyof typeof basicRequirements
                                      ] || defaultCount
                                    : defaultCount;

                                return (
                                  <div key={shift} className='space-y-2'>
                                    <Label className='text-sm font-medium'>
                                      {shift}番
                                    </Label>
                                    <Input
                                      type='number'
                                      min='1'
                                      max='10'
                                      value={currentValue}
                                      onChange={e => {
                                        const newValue =
                                          Number.parseInt(e.target.value) || 1;
                                        setDailyRequirements(prev => {
                                          const updated = { ...prev };
                                          selectedDates.forEach(day => {
                                            if (!updated[day.toString()]) {
                                              updated[day.toString()] = {
                                                ...basicRequirements,
                                              };
                                            }
                                            updated[day.toString()][
                                              shift as keyof typeof basicRequirements
                                            ] = newValue;
                                          });
                                          return updated;
                                        });
                                      }}
                                      className='w-full text-center'
                                    />
                                  </div>
                                );
                              }
                            )}
                          </div>
                          <div className='flex space-x-3 mt-6'>
                            <Button
                              variant='outline'
                              onClick={() => {
                                setDailyRequirements(prev => {
                                  const updated = { ...prev };
                                  selectedDates.forEach(day => {
                                    updated[day.toString()] = {
                                      ...basicRequirements,
                                    };
                                  });
                                  return updated;
                                });
                              }}
                              className='flex-1'
                            >
                              テンプレート適用
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => {
                                setDailyRequirements(prev => {
                                  const updated = { ...prev };
                                  selectedDates.forEach(day => {
                                    delete updated[day.toString()];
                                  });
                                  return updated;
                                });
                              }}
                              className='flex-1'
                            >
                              リセット
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 設定済み日付の一覧 */}
                      <div className='border rounded p-4 max-h-64 overflow-y-auto'>
                        <div className='text-sm font-medium mb-3'>
                          個別設定済み日付
                        </div>
                        {Object.keys(dailyRequirements).length === 0 ? (
                          <div className='text-sm text-gray-500 text-center py-8'>
                            個別設定はありません
                          </div>
                        ) : (
                          <div className='space-y-3'>
                            {Object.entries(dailyRequirements)
                              .sort(([a], [b]) => Number(a) - Number(b))
                              .map(([day, requirements]) => (
                                <div
                                  key={day}
                                  className='flex items-center justify-between p-3 bg-white rounded border'
                                >
                                  <span className='font-medium'>{day}日:</span>
                                  <div className='flex items-center space-x-4'>
                                    <span>早番 {requirements.早番}人</span>
                                    <span>日勤 {requirements.日勤}人</span>
                                    <span>遅番 {requirements.遅番}人</span>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => {
                                        setDailyRequirements(prev => {
                                          const updated = { ...prev };
                                          delete updated[day];
                                          return updated;
                                        });
                                      }}
                                      className='text-red-500 hover:text-red-700'
                                    >
                                      削除
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='text-sm text-gray-600 mb-3'>
                  基本テンプレート
                </div>
                <div className='flex items-center justify-between'>
                  <Label>早番</Label>
                  <Input
                    type='number'
                    value={basicRequirements.早番}
                    onChange={e =>
                      setBasicRequirements({
                        ...basicRequirements,
                        早番: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-16 text-center'
                    min='0'
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label>日勤</Label>
                  <Input
                    type='number'
                    value={basicRequirements.日勤}
                    onChange={e =>
                      setBasicRequirements({
                        ...basicRequirements,
                        日勤: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-16 text-center'
                    min='0'
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label>遅番</Label>
                  <Input
                    type='number'
                    value={basicRequirements.遅番}
                    onChange={e =>
                      setBasicRequirements({
                        ...basicRequirements,
                        遅番: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-16 text-center'
                    min='0'
                  />
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full mt-3 bg-transparent'
                  onClick={() => {
                    const newDailyRequirements: Record<
                      string,
                      { 早番: number; 日勤: number; 遅番: number }
                    > = {};
                    for (let day = 1; day <= daysInMonth; day++) {
                      newDailyRequirements[day.toString()] = {
                        ...basicRequirements,
                      };
                    }
                    setDailyRequirements(newDailyRequirements);
                  }}
                >
                  全日にテンプレート適用
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span className='flex items-center'>
                  <Target className='h-5 w-5 mr-2' />
                  指定人員配置
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleAddAssignment}
                >
                  追加
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {specificAssignments.length === 0 ? (
                  <p className='text-sm text-gray-500 text-center py-4'>
                    指定配置はありません
                  </p>
                ) : (
                  specificAssignments.map(assignment => (
                    <div
                      key={assignment.id}
                      className='border rounded p-3 bg-gray-50'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='font-medium text-sm'>
                          {assignment.staffName}
                        </div>
                        <div className='flex items-center space-x-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            編集
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='text-xs text-gray-600 space-y-1'>
                        <div>日付: {assignment.date}</div>
                        <div>時間帯: {assignment.shift}</div>
                        {assignment.reason && (
                          <div>理由: {assignment.reason}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Calendar className='h-5 w-5 mr-2' />
              希望休情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* 職員別希望休一覧 */}
              <div>
                <h4 className='font-medium mb-3'>職員別希望休一覧</h4>
                <div className='space-y-2'>
                  {requestedLeaves.map((leave, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center'>
                        <User className='h-4 w-4 mr-2 text-gray-500' />
                        <span className='font-medium'>{leave.staffName}</span>
                        <span className='ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded'>
                          {leave.type}
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {leave.dates.map(date => (
                          <span
                            key={date}
                            className={`px-2 py-1 text-xs rounded ${
                              leave.type === '有給'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {date}日
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* カレンダー形式の希望休表示 */}
              <div>
                <h4 className='font-medium mb-3'>カレンダー表示</h4>
                <div className='grid grid-cols-7 gap-1 text-sm'>
                  {/* 曜日ヘッダー */}
                  {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                    <div
                      key={day}
                      className='p-2 text-center font-medium bg-gray-100 rounded'
                    >
                      {day}
                    </div>
                  ))}

                  {/* 日付とその日の希望休 */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(date => {
                    const dayOfWeek = new Date(
                      selectedYear,
                      selectedMonthNumber - 1,
                      date
                    ).getDay();
                    const leavesForDate = requestedLeaves.filter(leave =>
                      leave.dates.includes(date)
                    );

                    return (
                      <div
                        key={date}
                        className={`p-2 border rounded min-h-[60px] ${
                          dayOfWeek === 0
                            ? 'bg-red-50'
                            : dayOfWeek === 6
                              ? 'bg-blue-50'
                              : 'bg-white'
                        }`}
                      >
                        <div className='font-medium text-center mb-1'>
                          {date}
                        </div>
                        {leavesForDate.length > 0 && (
                          <div className='space-y-1'>
                            {leavesForDate.map((leave, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-1 py-0.5 rounded truncate ${
                                  leave.type === '有給'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {leave.staffName.split(' ')[0]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 希望休統計 */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                <div className='p-3 bg-blue-50 rounded-lg'>
                  <div className='text-sm text-blue-600'>総希望休数</div>
                  <div className='text-xl font-bold text-blue-800'>
                    {requestedLeaves.reduce(
                      (sum, leave) => sum + leave.dates.length,
                      0
                    )}
                    件
                  </div>
                </div>
                <div className='p-3 bg-green-50 rounded-lg'>
                  <div className='text-sm text-green-600'>有給希望</div>
                  <div className='text-xl font-bold text-green-800'>
                    {requestedLeaves
                      .filter(leave => leave.type === '有給')
                      .reduce((sum, leave) => sum + leave.dates.length, 0)}
                    件
                  </div>
                </div>
                <div className='p-3 bg-orange-50 rounded-lg'>
                  <div className='text-sm text-orange-600'>公休希望</div>
                  <div className='text-xl font-bold text-orange-800'>
                    {requestedLeaves
                      .filter(leave => leave.type === '公休希望')
                      .reduce((sum, leave) => sum + leave.dates.length, 0)}
                    件
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {showAssignmentForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>
                {editingAssignment ? '指定配置を編集' : '指定配置を追加'}
              </h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowAssignmentForm(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            <div className='space-y-4'>
              <div>
                <Label htmlFor='staff-select'>職員</Label>
                <Select
                  value={assignmentFormData.staffName}
                  onValueChange={value =>
                    setAssignmentFormData(prev => ({
                      ...prev,
                      staffName: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='職員を選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map(staff => (
                      <SelectItem key={staff} value={staff}>
                        {staff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='date-input'>日付</Label>
                <Input
                  id='date-input'
                  type='date'
                  value={assignmentFormData.date}
                  onChange={e =>
                    setAssignmentFormData(prev => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor='shift-select'>時間帯</Label>
                <Select
                  value={assignmentFormData.shift}
                  onValueChange={(value: '早番' | '日勤' | '遅番') =>
                    setAssignmentFormData(prev => ({ ...prev, shift: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='早番'>早番</SelectItem>
                    <SelectItem value='日勤'>日勤</SelectItem>
                    <SelectItem value='遅番'>遅番</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='reason-input'>理由（任意）</Label>
                <Input
                  id='reason-input'
                  value={assignmentFormData.reason}
                  onChange={e =>
                    setAssignmentFormData(prev => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder='配置理由を入力'
                />
              </div>
            </div>

            <div className='flex justify-end space-x-2 mt-6'>
              <Button
                variant='outline'
                onClick={() => setShowAssignmentForm(false)}
              >
                キャンセル
              </Button>
              <Button onClick={handleSaveAssignment}>
                {editingAssignment ? '更新' : '追加'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
