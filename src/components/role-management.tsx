'use client';

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronDown,
  Copy,
  Edit3,
  FileText,
  Folder,
  Info,
  Save,
  Trash2,
  UserCheck,
  Users,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { api } from '@/lib/trpc';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  scheduleData: any;
  attendingStaff: number[];
  createdAt: string;
}

export function RoleManagement() {
  const [selectedDate, setSelectedDate] = useState('2024-02-01');
  const [selectedShift, setSelectedShift] = useState('day');
  const [memoItems, setMemoItems] = useState('');
  const [specialItems, setSpecialItems] = useState(
    '全体会議　18：00~\n新規利用者Aさん：既往歴別紙参照'
  );

  const [selectedCell, setSelectedCell] = useState<{
    staffId: number;
    timeIndex: number;
  } | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [editingDuration, setEditingDuration] = useState(30);
  const [isOvertime, setIsOvertime] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isStaffManagementOpen, setIsStaffManagementOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [savedTemplates, setSavedTemplates] = useState<RoleTemplate[]>([
    {
      id: '1',
      name: '標準平日パターン',
      description: '通常の平日勤務パターン',
      scheduleData: {},
      attendingStaff: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15],
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: '土日祝日パターン',
      description: '休日の勤務パターン（人員削減版）',
      scheduleData: {},
      attendingStaff: [1, 2, 4, 6, 8, 11, 12, 14],
      createdAt: '2024-01-20',
    },
  ]);

  const [attendingStaff, setAttendingStaff] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15,
  ]); // デフォルトで大部分が出勤
  const [staffAvailability, setStaffAvailability] = useState<{
    [key: number]: { isAvailable: boolean; reason?: string };
  }>({
    10: { isAvailable: false, reason: '有給休暇' },
  });

  const [expandedStaffRows, setExpandedStaffRows] = useState<Set<string>>(
    new Set()
  );
  const [selectedStaffNames, setSelectedStaffNames] = useState<{
    [key: string]: string;
  }>({});

  // tRPCクエリ
  const { data: positions } = api.positions.getPositions.useQuery({});
  const { data: shifts } = api.attendance.getShifts.useQuery({});

  const workTypeOptions = shifts?.map(shift => shift.name) || [
    'A勤',
    'B勤',
    'C勤',
    'D勤務',
    '夜勤',
    'F夜勤',
    '早番',
    '日勤',
  ];
  const positionOptions = positions?.map((position: any) => position.name) || [
    '入浴',
    'フロア',
    '事務',
  ];

  const [expandedWorkTypeRows, setExpandedWorkTypeRows] = useState<Set<string>>(
    new Set()
  );
  const [expandedPositionRows, setExpandedPositionRows] = useState<Set<string>>(
    new Set()
  );
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<
    Record<string, string>
  >({});
  const [selectedPositions, setSelectedPositions] = useState<
    Record<string, string>
  >({});

  const showNotification = (
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const [scheduleData, setScheduleData] = useState({
    1: {
      // 山田太郎 - A勤務（8:30～17:30）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    2: {
      // ヘルパー１ - A勤務（8:30～17:30）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    3: {
      // ヘルパー２ - B勤務（9:00～18:00）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    4: {
      // ヘルパー３ - A勤務（8:30～17:30）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    5: {
      // ヘルパー４ - C勤務（10:30～19:30）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    6: {
      // ヘルパー５ - B勤務（9:00～18:00）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    7: {
      // ヘルパー６ - B勤務（9:00～18:00）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    8: {
      // ヘルパー７ - A勤務（8:30～17:30）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    9: {
      // ヘルパー８ - C勤務（10:30～19:30）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    10: {
      // ヘルパー９
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    11: {
      // ヘルパー10
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    12: {
      // ヘルパー11
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    13: {
      // ヘルパー12
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    14: {
      // 看護１ - 早番看護師（8:30～17:30）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    15: {
      // 看護２ - 日勤看護師（9:00～18:00）
      role: '',
      schedule: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      isOffDuty: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
  });

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      showNotification('error', 'テンプレート名を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTemplate: RoleTemplate = {
        id: Date.now().toString(),
        name: templateName,
        description: templateDescription,
        scheduleData: { ...scheduleData },
        attendingStaff: [...attendingStaff],
        createdAt: new Date().toISOString().split('T')[0],
      };

      setSavedTemplates(prev => [...prev, newTemplate]);
      setTemplateName('');
      setTemplateDescription('');
      setIsTemplateDialogOpen(false);
      showNotification('success', 'テンプレートを保存しました');
    } catch (error) {
      showNotification('error', 'テンプレートの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTemplate = (template: RoleTemplate) => {
    try {
      setScheduleData(template.scheduleData);
      setAttendingStaff(template.attendingStaff);
      setIsTemplateDialogOpen(false);
      showNotification(
        'success',
        `「${template.name}」テンプレートを適用しました`
      );
    } catch (error) {
      showNotification('error', 'テンプレートの適用に失敗しました');
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      try {
        setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
        showNotification('success', 'テンプレートを削除しました');
      } catch (error) {
        showNotification('error', 'テンプレートの削除に失敗しました');
      }
    }
  };

  const handleStaffAttendanceChange = (
    staffId: number,
    isAttending: boolean
  ) => {
    if (isAttending) {
      setAttendingStaff(prev => [...prev, staffId]);
      setStaffAvailability(prev => {
        const newAvailability = { ...prev };
        delete newAvailability[staffId];
        return newAvailability;
      });
    } else {
      setAttendingStaff(prev => prev.filter(id => id !== staffId));
      setStaffAvailability(prev => ({
        ...prev,
        [staffId]: { isAvailable: false, reason: '' },
      }));
    }
  };

  const handleUnavailabilityReasonChange = (
    staffId: number,
    reason: string
  ) => {
    setStaffAvailability(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], reason },
    }));
  };

  const getAttendingStaffByWorkType = () => {
    const attendingStaffData = staff.filter(s => attendingStaff.includes(s.id));
    const workTypeGroups = {
      A勤: attendingStaffData.filter(s => s.workType === 'A勤'),
      B勤: attendingStaffData.filter(s => s.workType === 'B勤'),
      C勤: attendingStaffData.filter(s => s.workType === 'C勤'),
      夜勤: attendingStaffData.filter(
        s => s.workType === '夜勤' || s.workType === 'F夜勤'
      ),
      看護: attendingStaffData.filter(
        s => s.workType === '早番' || s.workType === '日勤'
      ),
      その他: attendingStaffData.filter(
        s =>
          !['A勤', 'B勤', 'C勤', '夜勤', 'F夜勤', '早番', '日勤'].includes(
            s.workType
          )
      ),
    };
    return workTypeGroups;
  };

  const handleCellClick = (staffId: number, timeIndex: number) => {
    const schedule = scheduleData[staffId as keyof typeof scheduleData];
    if (!attendingStaff.includes(staffId)) return; // 出勤していない職員はクリック不可

    setSelectedCell({ staffId, timeIndex });
    setEditingRole(schedule?.schedule[timeIndex] || '');
    setEditingDuration(30);
    setIsOvertime(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!selectedCell) return;

    try {
      setScheduleData(prev => ({
        ...prev,
        [selectedCell.staffId]: {
          ...prev[selectedCell.staffId as keyof typeof prev],
          schedule: prev[
            selectedCell.staffId as keyof typeof prev
          ].schedule.map((item, index) =>
            index === selectedCell.timeIndex ? editingRole : item
          ),
        },
      }));

      setIsEditDialogOpen(false);
      setSelectedCell(null);
      showNotification(
        'success',
        `役割「${editingRole}」を設定しました（${editingDuration}分）`
      );
    } catch (error) {
      showNotification('error', '役割の更新に失敗しました');
    }
  };

  const generateScheduleAutomatically = () => {
    const newScheduleData = { ...scheduleData };

    // 基本的な業務パターン定義
    const basicTasks = {
      morning: ['申し送り', '誘導', '食事介助', '排泄介助'],
      midday: ['入浴介助', 'レクリエーション', '移動介助', '口腔ケア'],
      afternoon: ['食事介助', '排泄介助', '見守り', '日報作成'],
      evening: ['食事介助', '就寝準備', '申し送り'],
    };

    // 時間帯別の必要人員数
    const requiredStaffByTime = {
      0: 3, // 8:30 - 朝の申し送り
      1: 4, // 9:30 - 朝の業務
      2: 5, // 10:30 - 入浴・処理
      3: 6, // 11:30 - 昼食準備
      4: 4, // 12:00 - 昼食
      5: 3, // 12:30 - 休憩・記録
      6: 4, // 13:30 - 午後業務
      7: 4, // 13:30 - 午後業務
      8: 5, // 14:30 - レク・処理
      9: 6, // 15:30 - おやつ・排泄
      10: 4, // 16:30 - 夕方業務
      11: 5, // 17:30 - 夜食準備
    };

    // 出勤職員を勤務時間別にグループ化
    const attendingStaffData = staff.filter(s => attendingStaff.includes(s.id));
    const staffByWorkType = {
      A勤: attendingStaffData.filter(s => s.workType === 'A勤'),
      B勤: attendingStaffData.filter(s => s.workType === 'B勤'),
      C勤: attendingStaffData.filter(s => s.workType === 'C勤'),
      夜勤: attendingStaffData.filter(
        s => s.workType === '夜勤' || s.workType === 'F夜勤'
      ),
      看護: attendingStaffData.filter(
        s => s.workType === '早番' || s.workType === '日勤'
      ),
      その他: attendingStaffData.filter(s => s.workType === 'D勤務'),
    };

    // 各職員のスケジュールを自動生成
    attendingStaffData.forEach(member => {
      const schedule =
        newScheduleData[member.id as keyof typeof newScheduleData];
      if (!schedule) return;

      // 勤務時間内のスロットを特定
      const workingSlots = schedule.isOffDuty
        .map((isOff, index) => (!isOff ? index : -1))
        .filter(index => index !== -1);

      // 職員のスキルに基づいて業務を割り当て
      workingSlots.forEach((timeIndex, slotIndex) => {
        if (timeIndex === 0) {
          // 申し送り時間
          schedule.schedule[timeIndex] = '申し送り';
        } else if (
          member.skills.includes('看護') ||
          member.skills.includes('医療処置')
        ) {
          // 看護師の場合
          if (timeIndex === 7 || timeIndex === 8) {
            schedule.schedule[timeIndex] = '休憩';
          } else {
            schedule.schedule[timeIndex] = '看護';
          }
        } else {
          // 介護職員の場合
          const timeSlot = timeIndex;
          let assignedTask = '';

          // 休憩時間の自動配置（勤務時間の中間あたり）
          const workingHours = workingSlots.length;
          const breakSlot = Math.floor(workingHours / 2);

          if (slotIndex === breakSlot) {
            assignedTask = '休憩';
          } else if (timeSlot <= 2) {
            // 朝の時間帯
            if (member.skills.includes('入浴介助')) {
              assignedTask = Math.random() > 0.5 ? '入浴介助' : '準備';
            } else if (member.skills.includes('食事介助')) {
              assignedTask = '食事介助';
            } else {
              assignedTask = '誘導';
            }
          } else if (timeSlot <= 5) {
            // 昼の時間帯
            if (
              member.skills.includes('食事介助') &&
              (timeSlot === 4 || timeSlot === 5)
            ) {
              assignedTask = '食事介助';
            } else if (
              member.skills.includes('レクリエーション') ||
              member.skills.includes('レク')
            ) {
              assignedTask = 'レク';
            } else if (member.skills.includes('入浴介助')) {
              assignedTask = '入浴介助';
            } else {
              assignedTask = '移動介助';
            }
          } else if (timeSlot <= 9) {
            // 午後の時間帯
            if (member.skills.includes('排泄介助')) {
              assignedTask = '排泄介助';
            } else if (
              member.skills.includes('レクリエーション') ||
              member.skills.includes('レク')
            ) {
              assignedTask = 'レク';
            } else if (member.skills.includes('処理')) {
              assignedTask = '処理';
            } else {
              assignedTask = '口腔ケア';
            }
          } else {
            // 夕方の時間帯
            if (member.skills.includes('食事介助')) {
              assignedTask = '食事介助';
            } else if (member.skills.includes('日報')) {
              assignedTask = '日報作成';
            } else if (member.skills.includes('就寝準備')) {
              assignedTask = '就寝準備';
            } else {
              assignedTask = '見守り';
            }
          }

          // ユニット担当者の場合は特定業務を優先
          if (
            member.skills.includes('ユニット１') ||
            member.skills.includes('ユニット２')
          ) {
            if (timeSlot === 2 || timeSlot === 5 || timeSlot === 11) {
              assignedTask = '食事介助';
            } else if (timeSlot === 1 || timeSlot === 10) {
              assignedTask = '誘導';
            }
          }

          // フリー担当者の場合
          if (member.skills.includes('フリー')) {
            if (timeSlot <= 2) {
              assignedTask = Math.random() > 0.5 ? 'フリー' : '排泄介助';
            } else if (timeSlot >= 10) {
              assignedTask = Math.random() > 0.5 ? '見守り' : 'フリー';
            } else {
              assignedTask = 'フリー';
            }
          }

          schedule.schedule[timeIndex] = assignedTask;
        }
      });
    });

    return newScheduleData;
  };

  const handleAutoGenerate = async () => {
    if (attendingStaff.length === 0) {
      showNotification(
        'error',
        '出勤職員が設定されていません。まず出勤職員を選択してください。'
      );
      return;
    }

    if (confirm('現在の役割表を自動生成で上書きしますか？')) {
      setIsGenerating(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const generatedSchedule = generateScheduleAutomatically();
        setScheduleData(generatedSchedule);
        showNotification(
          'success',
          '役割表を自動生成しました。必要に応じて手動で調整してください。'
        );
      } catch (error) {
        showNotification('error', '自動生成に失敗しました');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];

    // 令和年の計算（2019年が令和元年）
    const reiwaYear = year - 2018;
    return `令和${reiwaYear}年${month}月${day}日 (${weekday})`;
  };

  const staff = [
    {
      id: 1,
      name: '山田太郎',
      position: '所長',
      workType: 'A勤',
      skills: ['管理業務', '統括'],
    },
    {
      id: 2,
      name: 'ヘルパー１',
      position: '介護福祉士',
      workType: 'A勤',
      skills: ['入浴介助', '排泄介助'],
    },
    {
      id: 3,
      name: 'ヘルパー２',
      position: '介護士',
      workType: 'B勤',
      skills: ['入浴介助', '掃除'],
    },
    {
      id: 4,
      name: 'ヘルパー３',
      position: '介護福祉士',
      workType: 'A勤',
      skills: ['食事介助', 'レクリエーション'],
    },
    {
      id: 5,
      name: 'ヘルパー４',
      position: '介護士',
      workType: 'C勤',
      skills: ['食事介助', '見守り'],
    },
    {
      id: 6,
      name: 'ヘルパー５',
      position: '介護士',
      workType: 'B勤',
      skills: ['ユニット１', '日報'],
    },
    {
      id: 7,
      name: 'ヘルパー６',
      position: '介護士',
      workType: 'B勤',
      skills: ['ユニット１', 'レク'],
    },
    {
      id: 8,
      name: 'ヘルパー７',
      position: '介護福祉士',
      workType: 'A勤',
      skills: ['ユニット２', '日報'],
    },
    {
      id: 9,
      name: 'ヘルパー８',
      position: '介護士',
      workType: 'C勤',
      skills: ['ユニット２', '処理'],
    },
    {
      id: 10,
      name: 'ヘルパー９',
      position: '介護士',
      workType: 'D勤務',
      skills: ['フリー', '食事準備'],
    },
    {
      id: 11,
      name: 'ヘルパー10',
      position: '介護士',
      workType: '夜勤',
      skills: ['ユニット１', '夜間対応'],
    },
    {
      id: 12,
      name: 'ヘルパー11',
      position: '介護士',
      workType: '夜勤',
      skills: ['ユニット２', '夜間対応'],
    },
    {
      id: 13,
      name: 'ヘルパー12',
      position: '介護士',
      workType: 'F夜勤',
      skills: ['フリー', '就寝準備'],
    },
    {
      id: 14,
      name: '看護１',
      position: '看護師',
      workType: '早番',
      skills: ['看護', '医療処置'],
    },
    {
      id: 15,
      name: '看護２',
      position: '看護師',
      workType: '日勤',
      skills: ['看護', '医療処置'],
    },
  ];

  const timeSlots = [
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
    '休憩',
    '申し送り',
    '掃除',
    '日報作成',
    '処理',
    '準備',
    'フリー',
    '看護',
    '就寝準備',
    '食事準備',
  ];

  const availableStaffNames = [
    '田中花子',
    '佐藤次郎',
    '鈴木美咲',
    '高橋健太',
    '渡辺由美',
    '伊藤正男',
    '山本恵子',
    '中村大輔',
    '小林真理',
    '加藤和也',
    '吉田麻衣',
    '松本拓也',
    '井上さくら',
    '木村雄一',
    '林美穂',
  ];

  const toggleStaffRow = (staffId: string) => {
    const newExpanded = new Set(expandedStaffRows);
    if (newExpanded.has(staffId)) {
      newExpanded.delete(staffId);
    } else {
      newExpanded.add(staffId);
    }
    setExpandedStaffRows(newExpanded);
  };

  const selectStaffName = (staffId: string, name: string) => {
    setSelectedStaffNames(prev => ({
      ...prev,
      [staffId]: name,
    }));
    // アコーディオンを閉じる
    const newExpanded = new Set(expandedStaffRows);
    newExpanded.delete(staffId);
    setExpandedStaffRows(newExpanded);
  };

  const toggleWorkTypeRow = (staffId: string) => {
    setExpandedWorkTypeRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(staffId)) {
        newSet.delete(staffId);
      } else {
        newSet.add(staffId);
      }
      return newSet;
    });
  };

  const togglePositionRow = (staffId: string) => {
    setExpandedPositionRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(staffId)) {
        newSet.delete(staffId);
      } else {
        newSet.add(staffId);
      }
      return newSet;
    });
  };

  const selectWorkType = (staffId: string, workType: string) => {
    setSelectedWorkTypes(prev => ({ ...prev, [staffId]: workType }));
    setExpandedWorkTypeRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(staffId);
      return newSet;
    });
  };

  const selectPosition = (staffId: string, position: string) => {
    setSelectedPositions(prev => ({ ...prev, [staffId]: position }));
    setExpandedPositionRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(staffId);
      return newSet;
    });
  };

  const isHandoverTime = (timeIndex: number) => {
    return timeIndex === 0; // Only morning handover
  };

  const getCellBackgroundColor = (task: string, isOffDuty: boolean) => {
    if (isOffDuty) return 'bg-gray-800 text-white';
    if (task === '休憩') return 'bg-gray-300';
    if (task === '入浴' || task === '入浴準備' || task === '入浴介助')
      return 'bg-pink-200';
    if (task === '食事介助' || task === '食事準備' || task === '配膳')
      return 'bg-blue-200';
    if (task === '申し送り') return 'bg-yellow-200';
    if (task === 'レク' || task === 'レクリエーション') return 'bg-green-200';
    if (task === 'フリー' || task === '見守り') return 'bg-purple-200';
    if (task === '清掃') return 'bg-orange-200';
    return 'bg-white';
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
              役割表管理
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {notification && (
          <div className='mb-6'>
            <Alert
              className={`${
                notification.type === 'success'
                  ? 'border-green-200 bg-green-50'
                  : notification.type === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className='h-4 w-4 text-green-600' />
              ) : (
                <Info className='h-4 w-4' />
              )}
              <AlertDescription
                className={`${
                  notification.type === 'success'
                    ? 'text-green-800'
                    : notification.type === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                }`}
              >
                {notification.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Calendar className='h-5 w-5 mr-2' />
                日付・シフト選択
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='date'>対象日</Label>
                <Input
                  id='date'
                  type='date'
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='shift'>シフト</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='day'>日中 (8:00-20:00)</SelectItem>
                    <SelectItem value='night'>夜間 (20:00-8:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setIsStaffManagementOpen(true)}
                variant='outline'
                className='w-full'
              >
                <Users className='h-4 w-4 mr-2' />
                出勤職員管理 ({attendingStaff.length}名出勤)
              </Button>
              <div className='flex space-x-2'>
                <Button className='flex-1'>
                  <Copy className='h-4 w-4 mr-2' />
                  前日コピー
                </Button>
                <Button
                  onClick={() => setIsTemplateDialogOpen(true)}
                  variant='outline'
                  className='flex-1 bg-transparent'
                >
                  <Folder className='h-4 w-4 mr-2' />
                  テンプレート
                </Button>
              </div>
              <Button
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className='w-full bg-green-600 hover:bg-green-700 disabled:opacity-50'
              >
                <Wand2 className='h-4 w-4 mr-2' />
                {isGenerating ? '生成中...' : '自動生成'}
              </Button>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 bg-transparent'
                >
                  下書き保存
                </Button>
                <Button size='sm' className='flex-1'>
                  確定
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FileText className='h-5 w-5 mr-2' />
                メモ事項
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='memo'>他業務メモ事項</Label>
                <Textarea
                  id='memo'
                  value={memoItems}
                  onChange={e => setMemoItems(e.target.value)}
                  placeholder='全体会議タスク：○○行事への△△案準備（常勤）'
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor='special'>特別事項</Label>
                <Textarea
                  id='special'
                  value={specialItems}
                  onChange={e => setSpecialItems(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mt-6'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg font-medium'>
                令和6年{new Date(selectedDate).getMonth() + 1}月
                {new Date(selectedDate).getDate()}日
              </CardTitle>
              <div className='flex space-x-2'>
                <Button variant='outline' size='sm'>
                  <Save className='h-4 w-4 mr-2' />
                  保存
                </Button>
                <Button variant='outline' size='sm'>
                  <FileText className='h-4 w-4 mr-2' />
                  印刷
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-gray-400'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='border border-gray-400 p-2 text-sm font-medium w-16 bg-gray-200'>
                      勤務
                    </th>
                    <th className='border border-gray-400 p-2 text-sm font-medium w-24 bg-gray-200'>
                      名前
                    </th>
                    <th className='border border-gray-400 p-2 text-sm font-medium w-20 bg-gray-200'>
                      役割
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
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scheduleData).map(
                    ([staffIdStr, scheduleStaff]) => {
                      const staffId = Number.parseInt(staffIdStr, 10);
                      const isAttending = attendingStaff.includes(staffId);
                      const unavailabilityInfo = staffAvailability[staffId];
                      const staffInfo = staff.find(s => s.id === staffId);

                      return (
                        <React.Fragment key={staffId}>
                          <tr className='hover:bg-gray-50'>
                            <td className='border border-gray-400 p-2 text-sm relative bg-pink-100'>
                              <button
                                onClick={() => toggleWorkTypeRow(staffIdStr)}
                                className='w-full text-left hover:bg-blue-50 p-1 rounded flex items-center justify-between'
                              >
                                <span className='text-xs'>
                                  {selectedWorkTypes[staffIdStr] ||
                                    staffInfo?.workType ||
                                    ''}
                                </span>
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform ${
                                    expandedWorkTypeRows.has(staffIdStr)
                                      ? 'rotate-180'
                                      : ''
                                  }`}
                                />
                              </button>
                              {expandedWorkTypeRows.has(staffIdStr) && (
                                <div className='absolute top-full left-0 z-10 bg-white border border-gray-300 rounded shadow-lg w-full'>
                                  {workTypeOptions.map(workType => (
                                    <button
                                      key={workType}
                                      onClick={() =>
                                        selectWorkType(staffIdStr, workType)
                                      }
                                      className='w-full text-left px-3 py-2 hover:bg-blue-50 text-sm'
                                    >
                                      {workType}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className='border border-gray-400 p-2 text-sm bg-pink-100'>
                              <button
                                onClick={() => toggleStaffRow(staffIdStr)}
                                className='w-full text-left hover:bg-blue-50 p-1 rounded flex items-center justify-between'
                              >
                                <span className='text-xs'>
                                  {selectedStaffNames[staffIdStr] ||
                                    staffInfo?.name ||
                                    ''}
                                </span>
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform ${
                                    expandedStaffRows.has(staffIdStr)
                                      ? 'rotate-180'
                                      : ''
                                  }`}
                                />
                              </button>
                            </td>
                            <td className='border border-gray-400 p-2 text-sm relative bg-pink-100'>
                              <button
                                onClick={() => togglePositionRow(staffIdStr)}
                                className='w-full text-left hover:bg-blue-50 p-1 rounded flex items-center justify-between'
                              >
                                <span className='text-xs'>
                                  {selectedPositions[staffIdStr] ||
                                    staffInfo?.position ||
                                    ''}
                                </span>
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform ${
                                    expandedPositionRows.has(staffIdStr)
                                      ? 'rotate-180'
                                      : ''
                                  }`}
                                />
                              </button>
                              {expandedPositionRows.has(staffIdStr) && (
                                <div className='absolute top-full left-0 z-10 bg-white border border-gray-300 rounded shadow-lg w-full'>
                                  {positionOptions.map((position: any) => (
                                    <button
                                      key={position}
                                      onClick={() =>
                                        selectPosition(staffIdStr, position)
                                      }
                                      className='w-full text-left px-3 py-2 hover:bg-blue-50 text-sm'
                                    >
                                      {position}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                            {scheduleStaff.schedule.map(
                              (task: string, timeIndex: number) => {
                                const isOffDuty =
                                  scheduleStaff.isOffDuty?.[timeIndex] || false;

                                return (
                                  <td
                                    key={timeIndex}
                                    className={`border border-gray-400 p-1 text-xs cursor-pointer hover:bg-blue-50 ${getCellBackgroundColor(task, isOffDuty)}`}
                                    onClick={() =>
                                      handleCellClick(staffId, timeIndex)
                                    }
                                  >
                                    <div className='min-h-[20px] flex items-center justify-center'>
                                      {isOffDuty ? '' : task}
                                    </div>
                                  </td>
                                );
                              }
                            )}
                          </tr>
                          {expandedStaffRows.has(staffIdStr) && (
                            <tr>
                              <td
                                colSpan={timeSlots.length + 3}
                                className='border-l border-r border-b bg-blue-50 p-2'
                              >
                                <div className='grid grid-cols-3 gap-2 max-h-32 overflow-y-auto'>
                                  {availableStaffNames.map(name => (
                                    <button
                                      key={name}
                                      onClick={() =>
                                        selectStaffName(staffIdStr, name)
                                      }
                                      className='text-left p-2 hover:bg-blue-100 rounded text-sm border bg-white'
                                    >
                                      {name}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            <div className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <div className='border border-gray-400 p-4'>
                <h3 className='text-sm font-medium mb-2 bg-gray-100 p-2 border-b border-gray-400'>
                  申し送り
                </h3>
                <Textarea
                  value={memoItems}
                  onChange={e => setMemoItems(e.target.value)}
                  placeholder='申し送り事項を入力してください'
                  className='min-h-[100px] border-0 resize-none focus:ring-0'
                />
              </div>
              <div className='border border-gray-400 p-4'>
                <h3 className='text-sm font-medium mb-2 bg-gray-100 p-2 border-b border-gray-400'>
                  特記事項
                </h3>
                <Textarea
                  value={specialItems}
                  onChange={e => setSpecialItems(e.target.value)}
                  placeholder='特記事項を入力してください'
                  className='min-h-[100px] border-0 resize-none focus:ring-0'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
        >
          <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center'>
                <Folder className='h-5 w-5 mr-2' />
                役割表テンプレート管理
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-6'>
              {/* 新規テンプレート作成 */}
              <div className='p-4 border rounded-lg bg-blue-50'>
                <h3 className='font-medium text-blue-800 mb-3'>
                  現在の役割表をテンプレートとして保存
                </h3>
                <div className='space-y-3'>
                  <div>
                    <Label htmlFor='templateName'>テンプレート名</Label>
                    <Input
                      id='templateName'
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      placeholder='例：標準平日パターン'
                    />
                  </div>
                  <div>
                    <Label htmlFor='templateDescription'>説明</Label>
                    <Textarea
                      id='templateDescription'
                      value={templateDescription}
                      onChange={e => setTemplateDescription(e.target.value)}
                      placeholder='このテンプレートの説明を入力'
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleSaveAsTemplate}
                    disabled={isSaving}
                    className='w-full'
                  >
                    <Save className='h-4 w-4 mr-2' />
                    {isSaving ? '保存中...' : 'テンプレートとして保存'}
                  </Button>
                </div>
              </div>

              {/* 保存済みテンプレート一覧 */}
              <div>
                <h3 className='font-medium text-lg mb-3 text-gray-800'>
                  保存済みテンプレート ({savedTemplates.length}件)
                </h3>
                <div className='space-y-3'>
                  {savedTemplates.map(template => (
                    <div
                      key={template.id}
                      className='p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900'>
                            {template.name}
                          </h4>
                          <p className='text-sm text-gray-600 mt-1'>
                            {template.description}
                          </p>
                          <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                            <span>作成日: {template.createdAt}</span>
                            <span>
                              出勤者: {template.attendingStaff.length}名
                            </span>
                          </div>
                        </div>
                        <div className='flex space-x-2 ml-4'>
                          <Button
                            size='sm'
                            onClick={() => handleApplyTemplate(template)}
                            className='bg-green-600 hover:bg-green-700'
                          >
                            適用
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleDeleteTemplate(template.id)}
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {savedTemplates.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      保存されたテンプレートがありません
                    </div>
                  )}
                </div>
              </div>

              <div className='flex justify-end space-x-2 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => setIsTemplateDialogOpen(false)}
                >
                  閉じる
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isStaffManagementOpen}
          onOpenChange={setIsStaffManagementOpen}
        >
          <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center'>
                <UserCheck className='h-5 w-5 mr-2' />
                出勤職員管理 - {formatDate(selectedDate)}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-6'>
              {Object.entries(getAttendingStaffByWorkType()).map(
                ([workType, staffList]) => (
                  <div key={workType}>
                    <h3 className='font-medium text-lg mb-3 text-gray-800'>
                      {workType} ({staffList.length}名)
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {staff
                        .filter(s => {
                          if (workType === 'A勤') return s.workType === 'A勤';
                          if (workType === 'B勤') return s.workType === 'B勤';
                          if (workType === 'C勤') return s.workType === 'C勤';
                          if (workType === '夜勤')
                            return (
                              s.workType === '夜勤' || s.workType === 'F夜勤'
                            );
                          if (workType === '看護')
                            return (
                              s.workType === '早番' || s.workType === '日勤'
                            );
                          return ![
                            'A勤',
                            'B勤',
                            'C勤',
                            '夜勤',
                            'F夜勤',
                            '早番',
                            '日勤',
                          ].includes(s.workType);
                        })
                        .map(member => {
                          const isAttending = attendingStaff.includes(
                            member.id
                          );
                          const unavailabilityInfo =
                            staffAvailability[member.id];

                          return (
                            <div
                              key={member.id}
                              className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                            >
                              <Checkbox
                                id={`staff-${member.id}`}
                                checked={isAttending}
                                onCheckedChange={checked =>
                                  handleStaffAttendanceChange(
                                    member.id,
                                    checked as boolean
                                  )
                                }
                              />
                              <div className='flex-1'>
                                <label
                                  htmlFor={`staff-${member.id}`}
                                  className='font-medium cursor-pointer'
                                >
                                  {member.name}
                                </label>
                                <div className='text-sm text-gray-600'>
                                  {member.position} | {member.workType}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  スキル: {member.skills.join(', ')}
                                </div>
                                {!isAttending && (
                                  <Input
                                    placeholder='欠勤理由を入力'
                                    value={unavailabilityInfo?.reason || ''}
                                    onChange={e =>
                                      handleUnavailabilityReasonChange(
                                        member.id,
                                        e.target.value
                                      )
                                    }
                                    className='mt-2 text-xs'
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )
              )}
              <div className='flex justify-end space-x-2 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => setIsStaffManagementOpen(false)}
                >
                  閉じる
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center'>
                <Edit3 className='h-5 w-5 mr-2' />
                役割・時間帯設定
              </DialogTitle>
              <div className='text-sm text-gray-600'>
                {selectedCell && (
                  <>
                    職員: {staff.find(s => s.id === selectedCell.staffId)?.name}{' '}
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
                    {roleOptions.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='duration'>所要時間（分）</Label>
                <Select
                  value={editingDuration.toString()}
                  onValueChange={value => setEditingDuration(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='15'>15分</SelectItem>
                    <SelectItem value='30'>30分</SelectItem>
                    <SelectItem value='60'>60分</SelectItem>
                    <SelectItem value='90'>90分</SelectItem>
                    <SelectItem value='120'>120分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='overtime'
                  checked={isOvertime}
                  onChange={e => setIsOvertime(e.target.checked)}
                  className='rounded border-gray-300'
                />
                <Label htmlFor='overtime' className='text-sm'>
                  残業あり
                </Label>
              </div>
              <div className='bg-blue-50 p-3 rounded-lg'>
                <div className='text-sm font-medium text-blue-800'>
                  設定内容
                </div>
                <div className='text-sm text-blue-600 mt-1'>
                  {editingRole || '未選択'} ({editingDuration}分)
                  {isOvertime && ' - 残業'}
                </div>
              </div>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsEditDialogOpen(false)}
                  className='flex-1'
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSaveRole}
                  className='flex-1'
                  disabled={!editingRole}
                >
                  設定保存
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
