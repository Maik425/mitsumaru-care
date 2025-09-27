'use client';

import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShiftSlot {
  id: string;
  date: string;
  timeSlot: string; // "早番", "日勤", "遅番", "夜勤"
  requiredSkills: string[];
  assignedStaff?: string;
  staffId?: number;
  isRequired: boolean;
  priority: number; // 1-5 (5が最重要)
}

interface ExchangeProposal {
  id: number;
  exchangeStaff: any;
  originalShift: ShiftSlot;
  proposedShift: ShiftSlot;
  compatibility: number;
  riskLevel: 'low' | 'medium' | 'high';
  impactAnalysis: {
    serviceQuality: number;
    staffWorkload: number;
    skillCoverage: number;
    continuity: number;
  };
  benefits: string[];
  risks: string[];
  alternativeOptions: string[];
}

export function ShiftExchangeSystem() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [exchangeProposals, setExchangeProposals] = useState<
    ExchangeProposal[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2024-03');

  const staffList = [
    {
      id: 7,
      name: '山田 大輔',
      position: '介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      experienceYears: 5,
      skills: ['身体介護', '生活援助', '認知症ケア'],
      skillLevels: { 身体介護: 4, 生活援助: 4, 認知症ケア: 3 },
      workPatterns: ['早番', '日勤', '遅番'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: false,
      },
      currentWorkload: 85, // パーセンテージ
      preferredShifts: ['日勤', '遅番'],
      recentPerformance: 4.2, // 1-5スケール
      teamCompatibility: ['高橋 美咲', '伊藤 健太', '渡辺 由美'],
    },
    {
      id: 4,
      name: '高橋 美咲',
      position: '介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      experienceYears: 5,
      skills: ['身体介護', '入浴介助', '認知症ケア', '緊急時対応'],
      skillLevels: { 身体介護: 4, 入浴介助: 4, 認知症ケア: 3, 緊急時対応: 2 },
      workPatterns: ['早番', '日勤', '遅番'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: false,
      },
      currentWorkload: 75,
      preferredShifts: ['早番', '日勤'],
      recentPerformance: 4.5,
      teamCompatibility: ['山田 大輔', '伊藤 健太'],
    },
    {
      id: 5,
      name: '伊藤 健太',
      position: '主任介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      experienceYears: 12,
      skills: ['身体介護', 'チームリーダー', '新人指導', '緊急時対応'],
      skillLevels: {
        身体介護: 5,
        チームリーダー: 4,
        新人指導: 4,
        緊急時対応: 5,
      },
      workPatterns: ['早番', '日勤', '遅番', '夜勤'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: true,
      },
      currentWorkload: 90,
      preferredShifts: ['日勤', '遅番'],
      recentPerformance: 4.8,
      teamCompatibility: ['山田 大輔', '高橋 美咲', '渡辺 由美'],
    },
    {
      id: 6,
      name: '渡辺 由美',
      position: '介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      experienceYears: 3,
      skills: ['身体介護', '生活援助'],
      skillLevels: { 身体介護: 3, 生活援助: 4 },
      workPatterns: ['早番', '日勤', '遅番'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: false,
      },
      currentWorkload: 70,
      preferredShifts: ['早番', '日勤'],
      recentPerformance: 4.0,
      teamCompatibility: ['山田 大輔', '伊藤 健太'],
    },
  ];

  const shiftSlots: ShiftSlot[] = [
    {
      id: '1',
      date: '2024-03-05',
      timeSlot: '日勤',
      requiredSkills: ['身体介護', '生活援助'],
      assignedStaff: '山田 大輔',
      staffId: 7,
      isRequired: true,
      priority: 4,
    },
    {
      id: '2',
      date: '2024-03-05',
      timeSlot: '遅番',
      requiredSkills: ['身体介護', '認知症ケア'],
      isRequired: true,
      priority: 3,
    },
    {
      id: '3',
      date: '2024-03-06',
      timeSlot: '早番',
      requiredSkills: ['身体介護'],
      assignedStaff: '高橋 美咲',
      staffId: 4,
      isRequired: true,
      priority: 3,
    },
    {
      id: '4',
      date: '2024-03-07',
      timeSlot: '日勤',
      requiredSkills: ['身体介護', 'チームリーダー'],
      assignedStaff: '伊藤 健太',
      staffId: 5,
      isRequired: true,
      priority: 5,
    },
  ];

  const exchangeRequests = [
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
      skills: ['身体介護', '生活援助', '認知症ケア'],
      currentShift: {
        date: '2024-03-05',
        timeSlot: '日勤',
        requiredSkills: ['身体介護', '生活援助'],
      },
    },
  ];

  const generateAdvancedExchangeProposals = (
    request: any
  ): ExchangeProposal[] => {
    const requestingStaff = staffList.find(s => s.id === request.staffId);
    if (!requestingStaff) return [];

    const originalShift = shiftSlots.find(
      slot =>
        slot.date === request.currentShift.date &&
        slot.timeSlot === request.currentShift.timeSlot
    );
    if (!originalShift) return [];

    // 適合する職員を検索
    const compatibleStaff = staffList
      .filter(staff => {
        if (staff.id === request.staffId) return false;

        // 基本的な適合性チェック
        const hasRequiredSkills = originalShift.requiredSkills.every(skill =>
          staff.skills.includes(skill)
        );
        const canWorkTimeSlot = staff.workPatterns.includes(
          originalShift.timeSlot
        );
        const workloadOk = staff.currentWorkload < 95; // 過労防止

        return hasRequiredSkills && canWorkTimeSlot && workloadOk;
      })
      .map(staff => {
        const compatibility = calculateAdvancedCompatibility(
          requestingStaff,
          staff,
          originalShift
        );
        return { staff, compatibility };
      })
      .sort((a, b) => b.compatibility - a.compatibility);

    // 上位3名の交換案を生成
    return compatibleStaff.slice(0, 3).map((item, index) => {
      const proposedShift = generateProposedShift(
        item.staff,
        request.holidayDates[0],
        index
      );
      const riskLevel = assessRiskLevel(
        item.staff,
        originalShift,
        proposedShift
      );
      const impactAnalysis = analyzeImpact(
        requestingStaff,
        item.staff,
        originalShift,
        proposedShift
      );

      return {
        id: index + 1,
        exchangeStaff: item.staff,
        originalShift,
        proposedShift,
        compatibility: item.compatibility,
        riskLevel,
        impactAnalysis,
        benefits: generateBenefits(item.staff, originalShift),
        risks: generateRisks(item.staff, originalShift, riskLevel),
        alternativeOptions: generateAlternatives(item.staff, originalShift),
      };
    });
  };

  const calculateAdvancedCompatibility = (
    staff1: any,
    staff2: any,
    shift: ShiftSlot
  ): number => {
    let score = 0;

    // スキルマッチング (40%)
    const requiredSkillMatch = shift.requiredSkills.every(skill =>
      staff2.skills.includes(skill)
    )
      ? 40
      : 0;
    score += requiredSkillMatch;

    // スキルレベル評価 (20%)
    const avgSkillLevel =
      shift.requiredSkills.reduce(
        (sum, skill) => sum + (staff2.skillLevels[skill] || 0),
        0
      ) / shift.requiredSkills.length;
    score += (avgSkillLevel / 5) * 20;

    // 勤務負荷 (15%)
    const workloadScore =
      Math.max(0, (100 - staff2.currentWorkload) / 100) * 15;
    score += workloadScore;

    // パフォーマンス (10%)
    const performanceScore = (staff2.recentPerformance / 5) * 10;
    score += performanceScore;

    // チーム適合性 (10%)
    const teamScore = staff2.teamCompatibility.includes(staff1.name) ? 10 : 5;
    score += teamScore;

    // 希望シフト適合性 (5%)
    const preferenceScore = staff2.preferredShifts.includes(shift.timeSlot)
      ? 5
      : 0;
    score += preferenceScore;

    return Math.round(score);
  };

  const generateProposedShift = (
    staff: any,
    originalDate: string,
    index: number
  ): ShiftSlot => {
    const date = new Date(originalDate);
    const proposedDates = [
      new Date(date.getTime() + (index + 1) * 7 * 24 * 60 * 60 * 1000), // 1-3週間後
      new Date(date.getTime() - (index + 1) * 7 * 24 * 60 * 60 * 1000), // 1-3週間前
      new Date(date.getTime() + (index + 2) * 24 * 60 * 60 * 1000), // 2-4日後
    ];

    const proposedDate = proposedDates[index % 3].toISOString().split('T')[0];
    const preferredTimeSlot = staff.preferredShifts[0] || '日勤';

    return {
      id: `proposed-${index}`,
      date: proposedDate,
      timeSlot: preferredTimeSlot,
      requiredSkills: staff.skills.slice(0, 2),
      isRequired: false,
      priority: 2,
    };
  };

  const assessRiskLevel = (
    staff: any,
    originalShift: ShiftSlot,
    proposedShift: ShiftSlot
  ): 'low' | 'medium' | 'high' => {
    let riskScore = 0;

    // 高負荷チェック
    if (staff.currentWorkload > 85) riskScore += 2;

    // 重要シフトチェック
    if (originalShift.priority >= 4) riskScore += 2;

    // スキルレベルチェック
    const avgSkillLevel =
      originalShift.requiredSkills.reduce(
        (sum, skill) => sum + (staff.skillLevels[skill] || 0),
        0
      ) / originalShift.requiredSkills.length;
    if (avgSkillLevel < 3) riskScore += 2;

    // パフォーマンスチェック
    if (staff.recentPerformance < 4.0) riskScore += 1;

    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  };

  const analyzeImpact = (
    originalStaff: any,
    exchangeStaff: any,
    originalShift: ShiftSlot,
    proposedShift: ShiftSlot
  ) => {
    return {
      serviceQuality: Math.min(
        100,
        (exchangeStaff.recentPerformance / originalStaff.recentPerformance) *
          100
      ),
      staffWorkload: Math.max(0, 100 - exchangeStaff.currentWorkload),
      skillCoverage: Math.min(
        100,
        (originalShift.requiredSkills.filter(skill =>
          exchangeStaff.skills.includes(skill)
        ).length /
          originalShift.requiredSkills.length) *
          100
      ),
      continuity: exchangeStaff.teamCompatibility.includes(originalStaff.name)
        ? 85
        : 65,
    };
  };

  const generateBenefits = (staff: any, shift: ShiftSlot): string[] => {
    const benefits = [];

    if (staff.recentPerformance >= 4.5) {
      benefits.push(
        '高いパフォーマンス実績により、サービス品質の維持が期待できます'
      );
    }

    if (staff.currentWorkload < 80) {
      benefits.push('現在の負荷が適正範囲内で、追加業務への対応が可能です');
    }

    if (shift.requiredSkills.every(skill => staff.skills.includes(skill))) {
      benefits.push(
        '必要な技能をすべて保有しており、業務の継続性が確保されます'
      );
    }

    if (staff.preferredShifts.includes(shift.timeSlot)) {
      benefits.push(
        '希望する勤務時間帯のため、モチベーション向上が期待できます'
      );
    }

    return benefits;
  };

  const generateRisks = (
    staff: any,
    shift: ShiftSlot,
    riskLevel: string
  ): string[] => {
    const risks = [];

    if (riskLevel === 'high') {
      risks.push('高リスク案件のため、慎重な検討が必要です');
    }

    if (staff.currentWorkload > 85) {
      risks.push('現在の負荷が高く、過労のリスクがあります');
    }

    if (staff.recentPerformance < 4.0) {
      risks.push('最近のパフォーマンスが平均を下回っており、注意が必要です');
    }

    const avgSkillLevel =
      shift.requiredSkills.reduce(
        (sum, skill) => sum + (staff.skillLevels[skill] || 0),
        0
      ) / shift.requiredSkills.length;
    if (avgSkillLevel < 3) {
      risks.push('必要技能のレベルが不足している可能性があります');
    }

    return risks;
  };

  const generateAlternatives = (staff: any, shift: ShiftSlot): string[] => {
    const alternatives = [];

    alternatives.push('シフト時間の調整（短時間勤務への変更）');
    alternatives.push('他の職員との複数人体制での対応');

    if (staff.experienceYears < 5) {
      alternatives.push('経験豊富な職員によるサポート体制の構築');
    }

    alternatives.push('緊急時対応マニュアルの事前確認');

    return alternatives;
  };

  const handleGenerateProposals = async (request: any) => {
    setSelectedRequest(request);
    setIsGenerating(true);

    // 実際の実装では、ここでAPIを呼び出して詳細な分析を実行
    await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション

    const proposals = generateAdvancedExchangeProposals(request);
    setExchangeProposals(proposals);
    setIsGenerating(false);
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return (
          <Badge className='bg-green-100 text-green-800'>
            <CheckCircle className='h-3 w-3 mr-1' />
            低リスク
          </Badge>
        );
      case 'medium':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>
            <AlertTriangle className='h-3 w-3 mr-1' />
            中リスク
          </Badge>
        );
      case 'high':
        return (
          <Badge className='bg-red-100 text-red-800'>
            <XCircle className='h-3 w-3 mr-1' />
            高リスク
          </Badge>
        );
      default:
        return null;
    }
  };

  const getImpactIcon = (value: number) => {
    if (value >= 80) return <TrendingUp className='h-4 w-4 text-green-600' />;
    if (value >= 60) return <Minus className='h-4 w-4 text-yellow-600' />;
    return <TrendingDown className='h-4 w-4 text-red-600' />;
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
              シフト交換案生成システム
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <RefreshCw className='h-5 w-5 mr-2' />
                交換希望休申請一覧
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {exchangeRequests.map(request => (
                  <Card
                    key={request.id}
                    className='border-l-4 border-l-orange-500'
                  >
                    <CardContent className='pt-4'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center space-x-3'>
                          <User className='h-5 w-5 text-gray-500' />
                          <div>
                            <h3 className='font-medium'>{request.name}</h3>
                            <p className='text-sm text-gray-600'>
                              {request.currentShift.date}{' '}
                              {request.currentShift.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className='flex space-x-2'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => handleGenerateProposals(request)}
                                className='bg-orange-600 hover:bg-orange-700'
                              >
                                <RefreshCw className='h-4 w-4 mr-2' />
                                交換案を生成
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
                              <DialogHeader>
                                <DialogTitle className='flex items-center'>
                                  <RefreshCw className='h-5 w-5 mr-2' />
                                  シフト交換案 - {selectedRequest?.name}
                                </DialogTitle>
                              </DialogHeader>

                              {isGenerating ? (
                                <div className='text-center py-8'>
                                  <RefreshCw className='h-8 w-8 animate-spin text-orange-600 mx-auto mb-4' />
                                  <p className='text-gray-600'>
                                    最適な交換案を生成中...
                                  </p>
                                  <p className='text-sm text-gray-500 mt-2'>
                                    職員の技能、負荷、適合性を総合的に分析しています
                                  </p>
                                </div>
                              ) : (
                                <div className='space-y-6'>
                                  <div className='p-4 bg-orange-50 rounded-lg'>
                                    <h3 className='font-medium text-orange-900 mb-2'>
                                      申請詳細
                                    </h3>
                                    <div className='grid grid-cols-2 gap-4 text-sm'>
                                      <div>
                                        <span className='text-orange-700'>
                                          希望日:
                                        </span>
                                        <span className='ml-2'>
                                          {selectedRequest?.holidayDates.join(
                                            ', '
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <span className='text-orange-700'>
                                          対象シフト:
                                        </span>
                                        <span className='ml-2'>
                                          {selectedRequest?.currentShift.date}{' '}
                                          {
                                            selectedRequest?.currentShift
                                              .timeSlot
                                          }
                                        </span>
                                      </div>
                                      <div className='col-span-2'>
                                        <span className='text-orange-700'>
                                          理由:
                                        </span>
                                        <span className='ml-2'>
                                          {selectedRequest?.reason}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {exchangeProposals.length > 0 ? (
                                    <Tabs
                                      defaultValue='proposals'
                                      className='w-full'
                                    >
                                      <TabsList className='grid w-full grid-cols-2'>
                                        <TabsTrigger value='proposals'>
                                          交換案一覧
                                        </TabsTrigger>
                                        <TabsTrigger value='analysis'>
                                          詳細分析
                                        </TabsTrigger>
                                      </TabsList>

                                      <TabsContent
                                        value='proposals'
                                        className='space-y-4'
                                      >
                                        {exchangeProposals.map(proposal => (
                                          <Card
                                            key={proposal.id}
                                            className='border-l-4 border-l-blue-500'
                                          >
                                            <CardContent className='pt-4'>
                                              <div className='flex items-center justify-between mb-4'>
                                                <div className='flex items-center space-x-3'>
                                                  <User className='h-5 w-5 text-blue-600' />
                                                  <div>
                                                    <h4 className='font-medium'>
                                                      {
                                                        proposal.exchangeStaff
                                                          .name
                                                      }
                                                    </h4>
                                                    <p className='text-sm text-gray-600'>
                                                      {
                                                        proposal.exchangeStaff
                                                          .position
                                                      }{' '}
                                                      | 経験{' '}
                                                      {
                                                        proposal.exchangeStaff
                                                          .experienceYears
                                                      }
                                                      年
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className='flex items-center space-x-3'>
                                                  {getRiskBadge(
                                                    proposal.riskLevel
                                                  )}
                                                  <div className='text-right'>
                                                    <div className='text-2xl font-bold text-blue-600'>
                                                      {proposal.compatibility}%
                                                    </div>
                                                    <div className='text-sm text-gray-600'>
                                                      適合度
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                                <div>
                                                  <h5 className='font-medium text-gray-900 mb-2'>
                                                    交換内容
                                                  </h5>
                                                  <div className='space-y-2 text-sm'>
                                                    <div className='flex justify-between'>
                                                      <span className='text-gray-600'>
                                                        元のシフト:
                                                      </span>
                                                      <span>
                                                        {
                                                          proposal.originalShift
                                                            .date
                                                        }{' '}
                                                        {
                                                          proposal.originalShift
                                                            .timeSlot
                                                        }
                                                      </span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                      <span className='text-gray-600'>
                                                        交換先シフト:
                                                      </span>
                                                      <span>
                                                        {
                                                          proposal.proposedShift
                                                            .date
                                                        }{' '}
                                                        {
                                                          proposal.proposedShift
                                                            .timeSlot
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div>
                                                  <h5 className='font-medium text-gray-900 mb-2'>
                                                    影響度分析
                                                  </h5>
                                                  <div className='space-y-2'>
                                                    <div className='flex items-center justify-between'>
                                                      <span className='text-sm text-gray-600'>
                                                        サービス品質
                                                      </span>
                                                      <div className='flex items-center space-x-2'>
                                                        {getImpactIcon(
                                                          proposal
                                                            .impactAnalysis
                                                            .serviceQuality
                                                        )}
                                                        <span className='text-sm font-medium'>
                                                          {
                                                            proposal
                                                              .impactAnalysis
                                                              .serviceQuality
                                                          }
                                                          %
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                      <span className='text-sm text-gray-600'>
                                                        技能カバー率
                                                      </span>
                                                      <div className='flex items-center space-x-2'>
                                                        {getImpactIcon(
                                                          proposal
                                                            .impactAnalysis
                                                            .skillCoverage
                                                        )}
                                                        <span className='text-sm font-medium'>
                                                          {
                                                            proposal
                                                              .impactAnalysis
                                                              .skillCoverage
                                                          }
                                                          %
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                      <span className='text-sm text-gray-600'>
                                                        業務継続性
                                                      </span>
                                                      <div className='flex items-center space-x-2'>
                                                        {getImpactIcon(
                                                          proposal
                                                            .impactAnalysis
                                                            .continuity
                                                        )}
                                                        <span className='text-sm font-medium'>
                                                          {
                                                            proposal
                                                              .impactAnalysis
                                                              .continuity
                                                          }
                                                          %
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                                <div>
                                                  <h5 className='font-medium text-green-900 mb-2'>
                                                    メリット
                                                  </h5>
                                                  <ul className='text-sm text-green-700 space-y-1'>
                                                    {proposal.benefits.map(
                                                      (benefit, index) => (
                                                        <li
                                                          key={index}
                                                          className='flex items-start'
                                                        >
                                                          <CheckCircle className='h-3 w-3 mt-0.5 mr-2 flex-shrink-0' />
                                                          {benefit}
                                                        </li>
                                                      )
                                                    )}
                                                  </ul>
                                                </div>

                                                <div>
                                                  <h5 className='font-medium text-red-900 mb-2'>
                                                    リスク・注意点
                                                  </h5>
                                                  <ul className='text-sm text-red-700 space-y-1'>
                                                    {proposal.risks.map(
                                                      (risk, index) => (
                                                        <li
                                                          key={index}
                                                          className='flex items-start'
                                                        >
                                                          <AlertTriangle className='h-3 w-3 mt-0.5 mr-2 flex-shrink-0' />
                                                          {risk}
                                                        </li>
                                                      )
                                                    )}
                                                  </ul>
                                                </div>
                                              </div>

                                              <div className='mb-4'>
                                                <h5 className='font-medium text-gray-900 mb-2'>
                                                  代替案・対策
                                                </h5>
                                                <ul className='text-sm text-gray-700 space-y-1'>
                                                  {proposal.alternativeOptions.map(
                                                    (option, index) => (
                                                      <li
                                                        key={index}
                                                        className='flex items-start'
                                                      >
                                                        <Minus className='h-3 w-3 mt-0.5 mr-2 flex-shrink-0' />
                                                        {option}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>

                                              <div className='flex space-x-2'>
                                                <Button className='bg-green-600 hover:bg-green-700'>
                                                  <CheckCircle className='h-4 w-4 mr-2' />
                                                  この案で承認
                                                </Button>
                                                <Button variant='outline'>
                                                  詳細を確認
                                                </Button>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </TabsContent>

                                      <TabsContent
                                        value='analysis'
                                        className='space-y-4'
                                      >
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className='text-lg'>
                                              総合分析レポート
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className='space-y-6'>
                                              <div>
                                                <h4 className='font-medium text-gray-900 mb-3'>
                                                  適合度分布
                                                </h4>
                                                <div className='space-y-3'>
                                                  {exchangeProposals.map(
                                                    proposal => (
                                                      <div
                                                        key={proposal.id}
                                                        className='flex items-center space-x-3'
                                                      >
                                                        <span className='w-20 text-sm'>
                                                          {
                                                            proposal
                                                              .exchangeStaff
                                                              .name
                                                          }
                                                        </span>
                                                        <div className='flex-1'>
                                                          <Progress
                                                            value={
                                                              proposal.compatibility
                                                            }
                                                            className='h-2'
                                                          />
                                                        </div>
                                                        <span className='text-sm font-medium w-12'>
                                                          {
                                                            proposal.compatibility
                                                          }
                                                          %
                                                        </span>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>

                                              <div>
                                                <h4 className='font-medium text-gray-900 mb-3'>
                                                  リスク評価
                                                </h4>
                                                <div className='grid grid-cols-3 gap-4'>
                                                  {[
                                                    'low',
                                                    'medium',
                                                    'high',
                                                  ].map(risk => {
                                                    const count =
                                                      exchangeProposals.filter(
                                                        p =>
                                                          p.riskLevel === risk
                                                      ).length;
                                                    return (
                                                      <div
                                                        key={risk}
                                                        className='text-center p-3 border rounded-lg'
                                                      >
                                                        <div className='text-2xl font-bold'>
                                                          {count}
                                                        </div>
                                                        <div className='text-sm text-gray-600'>
                                                          {risk === 'low'
                                                            ? '低リスク'
                                                            : risk === 'medium'
                                                              ? '中リスク'
                                                              : '高リスク'}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>

                                              <div>
                                                <h4 className='font-medium text-gray-900 mb-3'>
                                                  推奨事項
                                                </h4>
                                                <div className='p-4 bg-blue-50 rounded-lg'>
                                                  <ul className='text-sm text-blue-700 space-y-2'>
                                                    <li className='flex items-start'>
                                                      <Star className='h-4 w-4 mt-0.5 mr-2 flex-shrink-0' />
                                                      最も適合度の高い案を優先的に検討することを推奨します
                                                    </li>
                                                    <li className='flex items-start'>
                                                      <Star className='h-4 w-4 mt-0.5 mr-2 flex-shrink-0' />
                                                      高リスク案を選択する場合は、追加のサポート体制を検討してください
                                                    </li>
                                                    <li className='flex items-start'>
                                                      <Star className='h-4 w-4 mt-0.5 mr-2 flex-shrink-0' />
                                                      交換実施前に関係職員への事前説明を行ってください
                                                    </li>
                                                  </ul>
                                                </div>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                    </Tabs>
                                  ) : (
                                    <div className='text-center py-8'>
                                      <AlertTriangle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                                      <p className='text-gray-600 mb-4'>
                                        適切な交換案が見つかりませんでした
                                      </p>
                                      <p className='text-sm text-gray-500'>
                                        必要な技能を持つ職員が不足しているか、全員の負荷が高い状態です
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className='text-sm text-gray-600 mb-2'>
                        <strong>理由:</strong> {request.reason}
                      </div>

                      <div className='flex items-center space-x-4 text-sm'>
                        <div>
                          <span className='text-gray-600'>必要技能:</span>
                          <div className='flex flex-wrap gap-1 mt-1'>
                            {request.currentShift.requiredSkills.map(
                              (skill: string) => (
                                <Badge
                                  key={skill}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
