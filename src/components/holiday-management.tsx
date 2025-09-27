'use client';

import { format, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Eye,
  Settings,
  AlertTriangle,
  RefreshCw,
  Users,
  FileText,
  History,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function HolidayManagement() {
  const [viewMode, setViewMode] = useState<'assign' | 'approval'>('assign');
  const [selectedMonth, setSelectedMonth] = useState('2024-02');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedHolidayType, setSelectedHolidayType] = useState('公休');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [clickedDate, setClickedDate] = useState('');
  const [modalStaff, setModalStaff] = useState('');
  const [modalHolidayType, setModalHolidayType] = useState('公休');
  const [selectedExchangeRequest, setSelectedExchangeRequest] =
    useState<any>(null);
  const [exchangeProposals, setExchangeProposals] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const staffList = [
    {
      id: 1,
      name: '田中 太郎',
      position: '相談員',
      employment: '常勤',
      qualification: '介福',
      category: '相談員',
      skills: ['相談業務', 'ケアプラン作成'],
    },
    {
      id: 2,
      name: '佐藤 花子',
      position: '相談員',
      employment: '常勤',
      qualification: '介福',
      category: '相談員',
      skills: ['相談業務', 'ケアプラン作成'],
    },
    {
      id: 3,
      name: '鈴木 一郎',
      position: '主任相談員',
      employment: '常勤',
      qualification: '介福',
      category: '相談員',
      skills: ['相談業務', 'ケアプラン作成', '管理業務'],
    },
    {
      id: 4,
      name: '高橋 美咲',
      position: '介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      skills: ['身体介護', '生活援助'],
    },
    {
      id: 5,
      name: '伊藤 健太',
      position: '主任介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      skills: ['身体介護', '生活援助', '管理業務'],
    },
    {
      id: 6,
      name: '渡辺 由美',
      position: '介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      skills: ['身体介護', '生活援助'],
    },
    {
      id: 7,
      name: '山田 大輔',
      position: '介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      skills: ['身体介護', '生活援助'],
    },
    {
      id: 8,
      name: '中村 愛子',
      position: '介護職員',
      employment: '常勤',
      qualification: '',
      category: '介護職員',
      skills: ['生活援助'],
    },
    {
      id: 9,
      name: '小林 雄介',
      position: '介護職員',
      employment: '常勤',
      qualification: '',
      category: '介護職員',
      skills: ['生活援助'],
    },
    {
      id: 10,
      name: '加藤 真理',
      position: '看護師',
      employment: '常勤',
      qualification: 'NS',
      category: '看護職員',
      skills: ['医療処置', '健康管理'],
    },
  ];

  const holidayRequests = [
    {
      id: 1,
      name: '田中 太郎',
      requestDate: '2024-01-15',
      holidayDates: ['2024-02-05', '2024-02-06'],
      reason: '',
      status: 'pending',
      submittedAt: '2024-01-15 10:30',
      type: '有給',
      requestType: 'regular',
      priority: 'normal',
      urgency: 'low',
    },
    {
      id: 2,
      name: '佐藤 花子',
      requestDate: '2024-01-12',
      holidayDates: ['2024-02-14'],
      reason: '',
      status: 'approved',
      submittedAt: '2024-01-12 14:20',
      type: '有給',
      requestType: 'regular',
      approvedAt: '2024-01-13 09:15',
      approvedBy: '管理者',
      approvalNotes: '問題なく承認',
    },
    {
      id: 3,
      name: '鈴木 次郎',
      requestDate: '2024-01-18',
      holidayDates: ['2024-02-20', '2024-02-21', '2024-02-22'],
      reason: '私用',
      status: 'rejected',
      submittedAt: '2024-01-18 09:15',
      rejectReason: '同日に他のスタッフの休暇と重複',
      type: '公休希望',
      requestType: 'regular',
      rejectedAt: '2024-01-19 14:30',
      rejectedBy: '管理者',
    },
    {
      id: 4,
      name: '高橋 美咲',
      requestDate: '2024-01-20',
      holidayDates: ['2024-02-28'],
      reason: '',
      status: 'pending',
      submittedAt: '2024-01-20 16:45',
      type: '有給',
      requestType: 'regular',
      priority: 'high',
      urgency: 'medium',
    },
    {
      id: 5,
      name: '山田 大輔',
      requestDate: '2024-02-25',
      holidayDates: ['2024-03-05'],
      reason:
        '急な家族の用事のため、どなたかと交換をお願いします。介護業務に支障がないよう配慮いたします。',
      status: 'exchange_pending',
      submittedAt: '2024-02-25 14:30',
      type: '有給',
      requestType: 'exchange',
      staffId: 7,
      category: '介護職員',
      skills: ['身体介護', '生活援助'],
      priority: 'high',
      urgency: 'high',
      exchangeDeadline: '2024-03-01',
    },
    {
      id: 6,
      name: '中村 愛子',
      requestDate: '2024-02-26',
      holidayDates: ['2024-03-10', '2024-03-11'],
      reason:
        '子供の卒業式と謝恩会のため、2日間お休みをいただきたく、交換をお願いします。',
      status: 'exchange_pending',
      submittedAt: '2024-02-26 09:15',
      type: '公休',
      requestType: 'exchange',
      staffId: 8,
      category: '介護職員',
      skills: ['生活援助'],
      priority: 'medium',
      urgency: 'medium',
      exchangeDeadline: '2024-03-05',
    },
  ];

  const approvalHistory = [
    {
      id: 1,
      requestId: 2,
      action: 'approved',
      performedBy: '管理者',
      performedAt: '2024-01-13 09:15',
      notes: '問題なく承認',
      previousStatus: 'pending',
      newStatus: 'approved',
    },
    {
      id: 2,
      requestId: 3,
      action: 'rejected',
      performedBy: '管理者',
      performedAt: '2024-01-19 14:30',
      notes: '同日に他のスタッフの休暇と重複',
      previousStatus: 'pending',
      newStatus: 'rejected',
    },
  ];

  const generateExchangeProposals = (request: any) => {
    const requestingStaff = staffList.find(s => s.id === request.staffId);
    if (!requestingStaff) return [];

    const compatibleStaff = staffList.filter(staff => {
      if (staff.id === request.staffId) return false;

      if (staff.category === requestingStaff.category) return true;

      const hasCommonSkills = staff.skills.some(skill =>
        requestingStaff.skills.includes(skill)
      );

      return hasCommonSkills;
    });

    const proposals = compatibleStaff.slice(0, 3).map((staff, index) => ({
      id: index + 1,
      exchangeStaff: staff,
      originalDate: request.holidayDates[0],
      proposedExchangeDate: getProposedExchangeDate(
        request.holidayDates[0],
        index
      ),
      compatibility: calculateCompatibility(requestingStaff, staff),
      reason: `${staff.name}さんとの交換案。${staff.position}として${staff.skills.join('、')}の技能を持ち、業務の継続性を保てます。`,
      riskLevel: index === 0 ? 'low' : index === 1 ? 'medium' : 'high',
      impactAnalysis: {
        serviceQuality: 85 - index * 10,
        staffWorkload: 80 - index * 5,
        skillCoverage: 90 - index * 15,
        continuity: 85 - index * 10,
      },
    }));

    return proposals;
  };

  const getProposedExchangeDate = (originalDate: string, index: number) => {
    const date = new Date(originalDate);
    const proposedDates = [
      new Date(date.getTime() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
      new Date(date.getTime() - (index + 1) * 7 * 24 * 60 * 60 * 1000),
      new Date(date.getTime() + (index + 2) * 24 * 60 * 60 * 1000),
    ];
    return proposedDates[index % 3].toISOString().split('T')[0];
  };

  const calculateCompatibility = (staff1: any, staff2: any) => {
    const commonSkills = staff1.skills.filter((skill: string) =>
      staff2.skills.includes(skill)
    );
    const totalSkills = [...new Set([...staff1.skills, ...staff2.skills])];
    return Math.round((commonSkills.length / totalSkills.length) * 100);
  };

  const handleApproveRegularRequest = (requestId: number) => {
    console.log('[v0] 通常希望休承認:', {
      requestId,
      approvedBy: '管理者',
      approvedAt: new Date().toISOString(),
      notes: approvalNotes,
    });

    alert('希望休を承認しました');
    setApprovalNotes('');
  };

  const handleRejectRegularRequest = (requestId: number) => {
    if (!rejectReason.trim()) {
      alert('却下理由を入力してください');
      return;
    }

    console.log('[v0] 通常希望休却下:', {
      requestId,
      rejectedBy: '管理者',
      rejectedAt: new Date().toISOString(),
      reason: rejectReason,
    });

    alert('希望休を却下しました');
    setRejectReason('');
  };

  const handleApproveExchangeRequest = (
    requestId: number,
    proposalId: number
  ) => {
    const proposal = exchangeProposals.find(p => p.id === proposalId);
    if (!proposal) return;

    console.log('[v0] 交換希望休承認:', {
      requestId,
      proposalId,
      exchangeStaff: proposal.exchangeStaff.name,
      approvedBy: '管理者',
      approvedAt: new Date().toISOString(),
      notes: approvalNotes,
    });

    alert(`${proposal.exchangeStaff.name}さんとの交換案を承認しました`);
    setSelectedExchangeRequest(null);
    setExchangeProposals([]);
    setSelectedProposal(null);
    setApprovalNotes('');
  };

  const handleRejectExchangeRequest = (requestId: number) => {
    if (!rejectReason.trim()) {
      alert('却下理由を入力してください');
      return;
    }

    console.log('[v0] 交換希望休却下:', {
      requestId,
      rejectedBy: '管理者',
      rejectedAt: new Date().toISOString(),
      reason: rejectReason,
    });

    alert('交換希望休を却下しました');
    setSelectedExchangeRequest(null);
    setExchangeProposals([]);
    setRejectReason('');
  };

  const handleExchangeRequest = (request: any) => {
    setSelectedExchangeRequest(request);
    const proposals = generateExchangeProposals(request);
    setExchangeProposals(proposals);
  };

  const handleDateClick = (date: Date) => {
    if (viewMode !== 'assign') return;

    setClickedDate(date.toISOString().split('T')[0]);
    setModalStaff('');
    setModalHolidayType('公休');
    setShowAssignModal(true);
  };

  const handleModalAssign = () => {
    if (!modalStaff) {
      alert('職員を選択してください');
      return;
    }

    console.log('[v0] 休暇割り振り:', {
      staff: modalStaff,
      type: modalHolidayType,
      date: clickedDate,
    });

    alert(`${modalStaff}に${modalHolidayType}を${clickedDate}に割り振りました`);

    setShowAssignModal(false);
    setClickedDate('');
    setModalStaff('');
  };

  const getCalendarData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    const approvedRequests = filteredRequests.filter(
      request => request.status === 'approved'
    );

    return { year, month, daysInMonth, firstDayOfWeek, approvedRequests };
  };

  const getHolidaysForDate = (date: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;

    return filteredRequests.filter(request =>
      request.holidayDates.includes(dateString)
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className='bg-green-100 text-green-800'>
            <CheckCircle className='h-3 w-3 mr-1' />
            承認済み
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className='bg-red-100 text-red-800'>
            <XCircle className='h-3 w-3 mr-1' />
            却下
          </Badge>
        );
      case 'pending':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>
            <Clock className='h-3 w-3 mr-1' />
            承認待ち
          </Badge>
        );
      case 'exchange_pending':
        return (
          <Badge className='bg-orange-100 text-orange-800'>
            <RefreshCw className='h-3 w-3 mr-1' />
            交換案検討中
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRequestTypeBadge = (requestType: string) => {
    switch (requestType) {
      case 'exchange':
        return (
          <Badge className='bg-orange-100 text-orange-800'>
            <AlertTriangle className='h-3 w-3 mr-1' />
            交換希望休
          </Badge>
        );
      case 'regular':
        return <Badge className='bg-blue-100 text-blue-800'>希望休</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className='bg-red-100 text-red-800'>
            <AlertTriangle className='h-3 w-3 mr-1' />
            高優先度
          </Badge>
        );
      case 'medium':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>
            <Clock className='h-3 w-3 mr-1' />
            中優先度
          </Badge>
        );
      case 'normal':
        return <Badge className='bg-gray-100 text-gray-800'>通常</Badge>;
      default:
        return null;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const filteredRequests = holidayRequests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const pendingRequests = holidayRequests.filter(
    request =>
      request.status === 'pending' || request.status === 'exchange_pending'
  );

  const ApprovalDashboard = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <Clock className='h-8 w-8 text-yellow-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>承認待ち</p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {holidayRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <RefreshCw className='h-8 w-8 text-orange-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  交換案検討中
                </p>
                <p className='text-2xl font-bold text-orange-600'>
                  {
                    holidayRequests.filter(r => r.status === 'exchange_pending')
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <AlertTriangle className='h-8 w-8 text-red-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>高優先度</p>
                <p className='text-2xl font-bold text-red-600'>
                  {pendingRequests.filter(r => r.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center'>
              <Bell className='h-8 w-8 text-blue-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>期限迫る</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {
                    pendingRequests.filter(
                      r =>
                        r.exchangeDeadline &&
                        new Date(r.exchangeDeadline) <=
                          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
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
                {holidayRequests.map((request, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='flex items-center'>
                      <User className='h-4 w-4 mr-2 text-gray-500' />
                      <span className='font-medium'>{request.name}</span>
                      <span className='ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded'>
                        {request.type}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {request.holidayDates.map(date => (
                        <span
                          key={date}
                          className={`px-2 py-1 text-xs rounded ${
                            request.type === '有給'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {new Date(date).getDate()}日
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
                  const dateString = `${selectedMonth}-${date.toString().padStart(2, '0')}`;
                  const dayOfWeek = new Date(dateString).getDay();
                  const requestsForDate = holidayRequests.filter(request =>
                    request.holidayDates.some(
                      holidayDate => new Date(holidayDate).getDate() === date
                    )
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
                      <div className='font-medium text-center mb-1'>{date}</div>
                      {requestsForDate.length > 0 && (
                        <div className='space-y-1'>
                          {requestsForDate.map((request, idx) => (
                            <div
                              key={idx}
                              className={`text-xs px-1 py-0.5 rounded truncate ${
                                request.type === '有給'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.name.split(' ')[0]}
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
                  {holidayRequests.reduce(
                    (sum, request) => sum + request.holidayDates.length,
                    0
                  )}
                  件
                </div>
              </div>
              <div className='p-3 bg-green-50 rounded-lg'>
                <div className='text-sm text-green-600'>有給希望</div>
                <div className='text-xl font-bold text-green-800'>
                  {holidayRequests
                    .filter(request => request.type === '有給')
                    .reduce(
                      (sum, request) => sum + request.holidayDates.length,
                      0
                    )}
                  件
                </div>
              </div>
              <div className='p-3 bg-orange-50 rounded-lg'>
                <div className='text-sm text-orange-600'>公休希望</div>
                <div className='text-xl font-bold text-orange-800'>
                  {holidayRequests
                    .filter(request => request.type === '公休希望')
                    .reduce(
                      (sum, request) => sum + request.holidayDates.length,
                      0
                    )}
                  件
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span className='flex items-center'>
              <FileText className='h-5 w-5 mr-2' />
              承認待ち申請一覧
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowApprovalHistory(!showApprovalHistory)}
            >
              <History className='h-4 w-4 mr-2' />
              承認履歴
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {pendingRequests
              .sort((a, b) => {
                // 優先度でソート
                const priorityOrder = { high: 3, medium: 2, normal: 1 };
                return (
                  priorityOrder[b.priority as keyof typeof priorityOrder] -
                  priorityOrder[a.priority as keyof typeof priorityOrder]
                );
              })
              .map(request => (
                <Card
                  key={request.id}
                  className={`border-l-4 ${getUrgencyColor(request.urgency || 'low')}`}
                >
                  <CardContent className='pt-4'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <User className='h-5 w-5 text-gray-500' />
                        <div>
                          <h3 className='font-medium'>{request.name}</h3>
                          <p className='text-sm text-gray-600'>
                            申請日: {request.submittedAt} |
                            {request.exchangeDeadline &&
                              ` 期限: ${request.exchangeDeadline}`}
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-1'>
                        {getStatusBadge(request.status)}
                        {getRequestTypeBadge(request.requestType)}
                        {getPriorityBadge(request.priority || 'normal')}
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          希望休日
                        </h4>
                        <div className='space-y-1'>
                          {request.holidayDates.map((date, index) => (
                            <p key={index} className='text-sm text-gray-600'>
                              {new Date(date).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </p>
                          ))}
                        </div>
                      </div>
                      {request.requestType === 'exchange' && (
                        <div>
                          <h4 className='font-medium text-gray-900 mb-2'>
                            理由
                          </h4>
                          <p className='text-sm text-gray-600'>
                            {request.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='flex space-x-2'>
                      {request.status === 'exchange_pending' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size='sm'
                              className='bg-orange-600 hover:bg-orange-700'
                              onClick={() => handleExchangeRequest(request)}
                            >
                              <Users className='h-4 w-4 mr-1' />
                              交換案を検討
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
                            <DialogHeader>
                              <DialogTitle className='flex items-center'>
                                <RefreshCw className='h-5 w-5 mr-2' />
                                交換希望休の承認処理 -{' '}
                                {selectedExchangeRequest?.name}
                              </DialogTitle>
                            </DialogHeader>

                            <Tabs defaultValue='proposals' className='w-full'>
                              <TabsList className='grid w-full grid-cols-3'>
                                <TabsTrigger value='proposals'>
                                  交換案
                                </TabsTrigger>
                                <TabsTrigger value='approval'>
                                  承認処理
                                </TabsTrigger>
                                <TabsTrigger value='impact'>
                                  影響分析
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value='proposals'
                                className='space-y-4'
                              >
                                <div className='p-4 bg-orange-50 rounded-lg'>
                                  <h3 className='font-medium text-orange-900 mb-2'>
                                    申請内容
                                  </h3>
                                  <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div>
                                      <span className='text-orange-700'>
                                        希望日:
                                      </span>
                                      <span className='ml-2'>
                                        {selectedExchangeRequest?.holidayDates.join(
                                          ', '
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className='text-orange-700'>
                                        理由:
                                      </span>
                                      <span className='ml-2'>
                                        {selectedExchangeRequest?.reason}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {exchangeProposals.length > 0 ? (
                                  <div className='space-y-4'>
                                    {exchangeProposals.map(proposal => (
                                      <Card
                                        key={proposal.id}
                                        className={`border-l-4 border-l-blue-500 cursor-pointer transition-all ${
                                          selectedProposal?.id === proposal.id
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() =>
                                          setSelectedProposal(proposal)
                                        }
                                      >
                                        <CardContent className='pt-4'>
                                          <div className='flex items-center justify-between mb-3'>
                                            <div className='flex items-center space-x-3'>
                                              <User className='h-5 w-5 text-blue-600' />
                                              <div>
                                                <h4 className='font-medium'>
                                                  {proposal.exchangeStaff.name}
                                                </h4>
                                                <p className='text-sm text-gray-600'>
                                                  {
                                                    proposal.exchangeStaff
                                                      .position
                                                  }{' '}
                                                  | 適合度:{' '}
                                                  {proposal.compatibility}%
                                                </p>
                                              </div>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                              <Badge
                                                className={
                                                  proposal.riskLevel === 'low'
                                                    ? 'bg-green-100 text-green-800'
                                                    : proposal.riskLevel ===
                                                        'medium'
                                                      ? 'bg-yellow-100 text-yellow-800'
                                                      : 'bg-red-100 text-red-800'
                                                }
                                              >
                                                {proposal.riskLevel === 'low'
                                                  ? '低リスク'
                                                  : proposal.riskLevel ===
                                                      'medium'
                                                    ? '中リスク'
                                                    : '高リスク'}
                                              </Badge>
                                              {selectedProposal?.id ===
                                                proposal.id && (
                                                <CheckCircle className='h-5 w-5 text-blue-600' />
                                              )}
                                            </div>
                                          </div>

                                          <div className='grid grid-cols-2 gap-4 text-sm mb-3'>
                                            <div>
                                              <span className='text-gray-600'>
                                                交換予定日:
                                              </span>
                                              <span className='ml-2 font-medium'>
                                                {new Date(
                                                  proposal.proposedExchangeDate
                                                ).toLocaleDateString('ja-JP', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  weekday: 'short',
                                                })}
                                              </span>
                                            </div>
                                            <div>
                                              <span className='text-gray-600'>
                                                保有技能:
                                              </span>
                                              <span className='ml-2'>
                                                {proposal.exchangeStaff.skills.join(
                                                  ', '
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          <div className='grid grid-cols-4 gap-2 text-xs'>
                                            <div className='text-center'>
                                              <div className='font-medium'>
                                                {
                                                  proposal.impactAnalysis
                                                    .serviceQuality
                                                }
                                                %
                                              </div>
                                              <div className='text-gray-600'>
                                                品質
                                              </div>
                                            </div>
                                            <div className='text-center'>
                                              <div className='font-medium'>
                                                {
                                                  proposal.impactAnalysis
                                                    .staffWorkload
                                                }
                                                %
                                              </div>
                                              <div className='text-gray-600'>
                                                負荷
                                              </div>
                                            </div>
                                            <div className='text-center'>
                                              <div className='font-medium'>
                                                {
                                                  proposal.impactAnalysis
                                                    .skillCoverage
                                                }
                                                %
                                              </div>
                                              <div className='text-gray-600'>
                                                技能
                                              </div>
                                            </div>
                                            <div className='text-center'>
                                              <div className='font-medium'>
                                                {
                                                  proposal.impactAnalysis
                                                    .continuity
                                                }
                                                %
                                              </div>
                                              <div className='text-gray-600'>
                                                継続性
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <div className='text-center py-8'>
                                    <AlertTriangle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                                    <p className='text-gray-600'>
                                      適切な交換案が見つかりませんでした
                                    </p>
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent
                                value='approval'
                                className='space-y-4'
                              >
                                <Card>
                                  <CardHeader>
                                    <CardTitle className='text-lg'>
                                      承認処理
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className='space-y-4'>
                                    {selectedProposal ? (
                                      <div className='p-4 bg-blue-50 rounded-lg'>
                                        <h4 className='font-medium text-blue-900 mb-2'>
                                          選択された交換案
                                        </h4>
                                        <p className='text-blue-700'>
                                          {selectedProposal.exchangeStaff.name}
                                          さんとの交換 （適合度:{' '}
                                          {selectedProposal.compatibility}%）
                                        </p>
                                      </div>
                                    ) : (
                                      <div className='p-4 bg-gray-50 rounded-lg'>
                                        <p className='text-gray-600'>
                                          交換案を選択してください
                                        </p>
                                      </div>
                                    )}

                                    <div>
                                      <Label htmlFor='approvalNotes'>
                                        承認メモ（任意）
                                      </Label>
                                      <Textarea
                                        id='approvalNotes'
                                        value={approvalNotes}
                                        onChange={e =>
                                          setApprovalNotes(e.target.value)
                                        }
                                        placeholder='承認に関するメモや注意事項を記入してください'
                                        className='min-h-[80px]'
                                      />
                                    </div>

                                    <div className='flex space-x-2'>
                                      <Button
                                        onClick={() =>
                                          selectedProposal &&
                                          handleApproveExchangeRequest(
                                            selectedExchangeRequest.id,
                                            selectedProposal.id
                                          )
                                        }
                                        disabled={!selectedProposal}
                                        className='bg-green-600 hover:bg-green-700'
                                      >
                                        <CheckCircle className='h-4 w-4 mr-2' />
                                        承認する
                                      </Button>
                                    </div>

                                    <div className='border-t pt-4'>
                                      <h4 className='font-medium text-gray-900 mb-3'>
                                        却下する場合
                                      </h4>
                                      <div className='space-y-3'>
                                        <div>
                                          <Label htmlFor='rejectReason'>
                                            却下理由
                                          </Label>
                                          <Textarea
                                            id='rejectReason'
                                            value={rejectReason}
                                            onChange={e =>
                                              setRejectReason(e.target.value)
                                            }
                                            placeholder='却下理由を入力してください'
                                            className='min-h-[80px]'
                                          />
                                        </div>
                                        <Button
                                          variant='outline'
                                          onClick={() =>
                                            handleRejectExchangeRequest(
                                              selectedExchangeRequest.id
                                            )
                                          }
                                          className='text-red-600 border-red-600 hover:bg-red-50'
                                        >
                                          <XCircle className='h-4 w-4 mr-1' />
                                          却下する
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value='impact' className='space-y-4'>
                                <Card>
                                  <CardHeader>
                                    <CardTitle className='text-lg'>
                                      影響分析レポート
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {selectedProposal ? (
                                      <div className='space-y-4'>
                                        <div>
                                          <h4 className='font-medium text-gray-900 mb-3'>
                                            総合評価
                                          </h4>
                                          <div className='space-y-3'>
                                            <div>
                                              <div className='flex justify-between mb-1'>
                                                <span className='text-sm text-gray-600'>
                                                  サービス品質
                                                </span>
                                                <span className='text-sm font-medium'>
                                                  {
                                                    selectedProposal
                                                      .impactAnalysis
                                                      .serviceQuality
                                                  }
                                                  %
                                                </span>
                                              </div>
                                              <Progress
                                                value={
                                                  selectedProposal
                                                    .impactAnalysis
                                                    .serviceQuality
                                                }
                                                className='h-2'
                                              />
                                            </div>
                                            <div>
                                              <div className='flex justify-between mb-1'>
                                                <span className='text-sm text-gray-600'>
                                                  技能カバー率
                                                </span>
                                                <span className='text-sm font-medium'>
                                                  {
                                                    selectedProposal
                                                      .impactAnalysis
                                                      .skillCoverage
                                                  }
                                                  %
                                                </span>
                                              </div>
                                              <Progress
                                                value={
                                                  selectedProposal
                                                    .impactAnalysis
                                                    .skillCoverage
                                                }
                                                className='h-2'
                                              />
                                            </div>
                                            <div>
                                              <div className='flex justify-between mb-1'>
                                                <span className='text-sm text-gray-600'>
                                                  業務継続性
                                                </span>
                                                <span className='text-sm font-medium'>
                                                  {
                                                    selectedProposal
                                                      .impactAnalysis.continuity
                                                  }
                                                  %
                                                </span>
                                              </div>
                                              <Progress
                                                value={
                                                  selectedProposal
                                                    .impactAnalysis.continuity
                                                }
                                                className='h-2'
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        <div className='p-4 bg-blue-50 rounded-lg'>
                                          <h4 className='font-medium text-blue-900 mb-2'>
                                            推奨事項
                                          </h4>
                                          <ul className='text-sm text-blue-700 space-y-1'>
                                            <li>
                                              •
                                              交換実施前に両職員への事前説明を行ってください
                                            </li>
                                            <li>
                                              •
                                              必要に応じて業務引き継ぎの時間を設けてください
                                            </li>
                                            <li>
                                              •
                                              交換後のフォローアップを計画してください
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className='text-gray-600'>
                                        交換案を選択すると詳細な影響分析が表示されます
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size='sm'
                                className='bg-green-600 hover:bg-green-700'
                              >
                                <CheckCircle className='h-4 w-4 mr-1' />
                                承認
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>希望休の承認</DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='p-4 bg-green-50 rounded-lg'>
                                  <h4 className='font-medium text-green-900 mb-2'>
                                    承認内容
                                  </h4>
                                  <p className='text-green-700'>
                                    {request.name}さんの{request.type}
                                    申請を承認します
                                  </p>
                                  <p className='text-sm text-green-600 mt-1'>
                                    対象日: {request.holidayDates.join(', ')}
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor='approvalNotes'>
                                    承認メモ（任意）
                                  </Label>
                                  <Textarea
                                    id='approvalNotes'
                                    value={approvalNotes}
                                    onChange={e =>
                                      setApprovalNotes(e.target.value)
                                    }
                                    placeholder='承認に関するメモを記入してください'
                                  />
                                </div>
                                <div className='flex space-x-2'>
                                  <Button
                                    onClick={() =>
                                      handleApproveRegularRequest(request.id)
                                    }
                                    className='bg-green-600 hover:bg-green-700'
                                  >
                                    承認する
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size='sm'
                                variant='outline'
                                className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                              >
                                <XCircle className='h-4 w-4 mr-1' />
                                却下
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>希望休の却下</DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='p-4 bg-red-50 rounded-lg'>
                                  <h4 className='font-medium text-red-900 mb-2'>
                                    却下内容
                                  </h4>
                                  <p className='text-red-700'>
                                    {request.name}さんの{request.type}
                                    申請を却下します
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor='rejectReason'>
                                    却下理由{' '}
                                    <span className='text-red-500'>*</span>
                                  </Label>
                                  <Textarea
                                    id='rejectReason'
                                    value={rejectReason}
                                    onChange={e =>
                                      setRejectReason(e.target.value)
                                    }
                                    placeholder='却下理由を入力してください'
                                    required
                                  />
                                </div>
                                <Button
                                  onClick={() =>
                                    handleRejectRegularRequest(request.id)
                                  }
                                  className='bg-red-600 hover:bg-red-700 w-full'
                                >
                                  却下する
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {showApprovalHistory && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <History className='h-5 w-5 mr-2' />
              承認履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {approvalHistory.map(history => (
                <div
                  key={history.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    {history.action === 'approved' ? (
                      <CheckCircle className='h-5 w-5 text-green-600' />
                    ) : (
                      <XCircle className='h-5 w-5 text-red-600' />
                    )}
                    <div>
                      <p className='font-medium'>
                        申請ID: {history.requestId} -{' '}
                        {history.action === 'approved' ? '承認' : '却下'}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {history.performedBy} | {history.performedAt}
                      </p>
                      {history.notes && (
                        <p className='text-sm text-gray-500 mt-1'>
                          {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // カレンダー表示用のデータ生成
  const generateCalendarDays = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (日) to 6 (土)

    const days: Date[] = [];

    // 前月の末日から、カレンダーの最初のマスを埋める
    for (let i = firstDayOfWeek; i > 0; i--) {
      const day = new Date(date.getFullYear(), date.getMonth(), 1 - i);
      days.push(day);
    }

    // 今月の日付を追加
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(date.getFullYear(), date.getMonth(), i);
      days.push(day);
    }

    // 後月の最初の日から、カレンダーの残りのマスを埋める
    const remainingDays = 42 - days.length; // カレンダーは通常6週間 x 7日 = 42マス
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(date.getFullYear(), date.getMonth() + 1, i);
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);

  // 仮の祝日データに希望休情報を統合
  const [holidays, setHolidays] = useState([
    {
      date: '2024-03-01',
      type: 'paid_leave',
      staff_name: '山田 太郎',
      status: 'confirmed',
    },
    {
      date: '2024-03-01',
      type: 'public_holiday',
      staff_name: '建国記念の日',
      status: 'confirmed',
    },
    {
      date: '2024-03-05',
      type: 'paid_leave',
      staff_name: '田中 花子',
      status: 'confirmed',
    },
    {
      date: '2024-03-10',
      type: 'paid_leave',
      staff_name: '鈴木 一郎',
      status: 'confirmed',
    },
    {
      date: '2024-03-10',
      type: 'paid_leave',
      staff_name: '佐藤 健太',
      status: 'confirmed',
    },
    {
      date: '2024-03-10',
      type: 'paid_leave',
      staff_name: '小林 愛',
      status: 'confirmed',
    },
    {
      date: '2024-03-12',
      type: 'paid_leave',
      staff_name: '渡辺 美咲',
      status: 'confirmed',
    },
    {
      date: '2024-03-15',
      type: 'paid_leave',
      staff_name: '加藤 優子',
      status: 'confirmed',
    },
    {
      date: '2024-03-20',
      type: 'paid_leave',
      staff_name: '高橋 次郎',
      status: 'confirmed',
    },
    {
      date: '2024-03-22',
      type: 'paid_leave',
      staff_name: '伊藤 誠',
      status: 'confirmed',
    },
    {
      date: '2024-03-25',
      type: 'paid_leave',
      staff_name: '中村 静香',
      status: 'confirmed',
    },
    {
      date: '2024-03-28',
      type: 'paid_leave',
      staff_name: '木村 拓也',
      status: 'confirmed',
    },
    {
      date: '2024-03-30',
      type: 'paid_leave',
      staff_name: '斎藤 明',
      status: 'confirmed',
    },
  ]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16'>
            <Link href='/admin/dashboard'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className='text-xl font-semibold text-gray-900 ml-4'>
              休み管理
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Settings className='h-5 w-5 mr-2' />
                設定・フィルター
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-gray-700 flex items-center'>
                    <Calendar className='h-4 w-4 mr-2' />
                    基本設定
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium text-gray-700 mb-1 block'>
                        対象月
                      </label>
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='2024-01'>2024年1月</SelectItem>
                          <SelectItem value='2024-02'>2024年2月</SelectItem>
                          <SelectItem value='2024-03'>2024年3月</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-700 mb-1 block'>
                        ステータス
                      </label>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>すべて</SelectItem>
                          <SelectItem value='pending'>承認待ち</SelectItem>
                          <SelectItem value='approved'>承認済み</SelectItem>
                          <SelectItem value='rejected'>却下</SelectItem>
                          <SelectItem value='exchange_pending'>
                            交換案検討中
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm border p-6'>
                  <CardContent className='p-0'>
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-sm font-semibold text-gray-700 flex items-center'>
                          <Eye className='h-4 w-4 mr-2' />
                          操作モード
                        </h3>
                        <div className='mt-3'>
                          <div className='space-y-2'>
                            <Button
                              variant={
                                viewMode === 'approval' ? 'default' : 'outline'
                              }
                              size='sm'
                              onClick={() => setViewMode('approval')}
                              className={`w-full ${
                                viewMode === 'approval'
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'border-green-200 text-green-700 hover:bg-green-50'
                              }`}
                            >
                              <FileText className='h-4 w-4 mr-2' />
                              承認管理ダッシュボード
                            </Button>
                            <Button
                              variant={
                                viewMode === 'assign' ? 'default' : 'outline'
                              }
                              size='sm'
                              onClick={() => setViewMode('assign')}
                              className={`w-full ${
                                viewMode === 'assign'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                              }`}
                            >
                              <UserPlus className='h-4 w-4 mr-2' />
                              休暇割り振りモード
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {viewMode === 'approval' && (
          <div className='mb-6'>
            <Card className='border-green-200 bg-green-50'>
              <CardContent className='pt-6'>
                <div className='flex items-start space-x-3'>
                  <FileText className='h-5 w-5 text-green-600 mt-0.5' />
                  <div>
                    <h3 className='font-medium text-green-900 mb-1'>
                      承認管理ダッシュボード
                    </h3>
                    <p className='text-sm text-green-700'>
                      承認待ちの申請を優先度順に表示し、効率的な承認処理を支援します。交換希望休では詳細な分析結果を確認できます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'assign' && (
          <div className='mb-6'>
            <Card className='border-blue-200 bg-blue-50'>
              <CardContent className='pt-6'>
                <div className='flex items-start space-x-3'>
                  <UserPlus className='h-5 w-5 text-blue-600 mt-0.5' />
                  <div>
                    <h3 className='font-medium text-blue-900 mb-1'>
                      休暇割り振りモード
                    </h3>
                    <p className='text-sm text-blue-700'>
                      管理者として職員に休暇を直接割り振ることができます。カレンダー上で日付をクリックすると、職員選択画面が表示されます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'approval' ? (
          <ApprovalDashboard />
        ) : (
          <div className='space-y-6'>
            {/* カレンダー表示 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Calendar className='h-5 w-5 mr-2' />
                  {format(currentDate, 'yyyy年M月', { locale: ja })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-7 gap-1 mb-4'>
                  {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                    <div
                      key={day}
                      className='p-2 text-center text-sm font-medium text-gray-500'
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1'>
                  {calendarDays.map((day, index) => {
                    const dayHolidays = holidays
                      .filter(h => isSameDay(new Date(h.date), day))
                      .map(h => ({ ...h, isRequest: false }));

                    // 希望休情報も統合
                    const dayRequests = holidayRequests
                      .filter(request =>
                        request.holidayDates.some(holidayDate =>
                          isSameDay(new Date(holidayDate), day)
                        )
                      )
                      .map(request => ({
                        date: day.toISOString().split('T')[0],
                        type:
                          request.type === '有給'
                            ? 'paid_leave'
                            : 'public_holiday',
                        staff_name: request.name,
                        status:
                          request.status === '承認待ち'
                            ? 'pending'
                            : request.status === '承認済み'
                              ? 'approved'
                              : 'rejected',
                        isRequest: true,
                      }));

                    const allDayItems = [...dayHolidays, ...dayRequests];
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[80px] p-1 border border-gray-200 cursor-pointer hover:bg-blue-50
                          ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                          ${isToday ? 'ring-2 ring-blue-500' : ''}
                        `}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className='text-sm font-medium mb-1'>
                          {format(day, 'd')}
                        </div>
                        <div className='space-y-1'>
                          {allDayItems.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className={`text-xs px-1 py-0.5 rounded truncate relative ${
                                item.type === 'paid_leave'
                                  ? item.isRequest
                                    ? item.status === 'pending'
                                      ? 'bg-green-50 text-green-700 border border-green-200 border-dashed'
                                      : item.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600 line-through'
                                    : 'bg-green-100 text-green-800'
                                  : item.type === 'public_holiday'
                                    ? item.isRequest
                                      ? item.status === 'pending'
                                        ? 'bg-red-50 text-red-700 border border-red-200 border-dashed'
                                        : item.status === 'approved'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600 line-through'
                                      : 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                              title={
                                item.isRequest
                                  ? `希望休 - ${item.status === 'pending' ? '承認待ち' : item.status === 'approved' ? '承認済み' : '却下'}`
                                  : '確定休暇'
                              }
                            >
                              {item.isRequest && item.status === 'pending' && (
                                <span className='absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full'></span>
                              )}
                              {item.staff_name?.split(' ')[0] || 'Unknown'}
                            </div>
                          ))}
                          {allDayItems.length > 3 && (
                            <div className='text-xs text-gray-500'>
                              +{allDayItems.length - 3}件
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* カレンダーナビゲーション */}
                <div className='flex justify-between items-center mt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  >
                    <ChevronLeft className='h-4 w-4' />
                    前月
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentDate(new Date())}
                  >
                    今月
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  >
                    次月
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 凡例 */}
            <Card>
              <CardContent className='pt-6'>
                <div className='space-y-2'>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-red-100 border border-red-200 rounded mr-2'></div>
                    <span className='text-sm text-gray-600'>公休（確定）</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-green-100 border border-green-200 rounded mr-2'></div>
                    <span className='text-sm text-gray-600'>
                      有給休暇（確定）
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2'></div>
                    <span className='text-sm text-gray-600'>その他</span>
                  </div>
                  <div className='border-t pt-2 mt-3'>
                    <div className='text-xs text-gray-500 mb-2'>希望休</div>
                    <div className='flex items-center'>
                      <div className='w-4 h-4 bg-green-50 border border-green-200 border-dashed rounded mr-2'></div>
                      <span className='text-sm text-gray-600'>
                        有給希望（承認待ち）
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <div className='w-4 h-4 bg-red-50 border border-red-200 border-dashed rounded mr-2'></div>
                      <span className='text-sm text-gray-600'>
                        公休希望（承認待ち）
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <div className='w-2 h-2 bg-orange-400 rounded-full mr-3 ml-1'></div>
                      <span className='text-sm text-gray-600'>
                        承認待ちマーク
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {filteredRequests.length === 0 &&
          viewMode !== 'assign' &&
          viewMode !== 'approval' && (
            <Card>
              <CardContent className='text-center py-8'>
                <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-600'>該当する休暇申請はありません</p>
              </CardContent>
            </Card>
          )}

        {showAssignModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 w-96 max-w-md mx-4'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold'>休暇割り振り</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowAssignModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className='mb-4'>
                <p className='text-sm text-gray-600 mb-2'>
                  選択日: {clickedDate}
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    職員選択
                  </label>
                  <select
                    value={modalStaff}
                    onChange={e => setModalStaff(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded-md'
                  >
                    <option value=''>職員を選択してください</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.name}>
                        {staff.name} ({staff.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    休暇種別
                  </label>
                  <select
                    value={modalHolidayType}
                    onChange={e => setModalHolidayType(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded-md'
                  >
                    <option value='公休'>公休</option>
                    <option value='有給'>有給休暇</option>
                  </select>
                </div>
              </div>

              <div className='flex space-x-3 mt-6'>
                <Button
                  variant='outline'
                  onClick={() => setShowAssignModal(false)}
                  className='flex-1'
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleModalAssign}
                  className='flex-1 bg-blue-600 hover:bg-blue-700'
                >
                  割り振り
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export { HolidayManagement };
