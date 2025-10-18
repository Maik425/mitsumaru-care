'use client';

import {
  ArrowLeft,
  Award,
  Eye,
  Filter,
  Plus,
  Search,
  Star,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { api } from '@/lib/trpc';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-5
  experience: number; // 年数
  certified: boolean;
  lastUpdated: string;
}

interface Staff {
  id: number;
  name: string;
  position: string;
  employment: string;
  qualification: string;
  category: string;
  skills: Skill[];
  workPatterns: string[];
  availability: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  experienceYears: number;
}

export function StaffSkillManagement() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    level: 1,
    experience: 0,
    certified: false,
  });

  // tRPCクエリ
  const { data: users, refetch: refetchUsers } = api.users.getUsers.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: skills, refetch: refetchSkills } =
    api.skills.getSkills.useQuery({});
  // 職員技能管理のtRPC統合
  const { data: userSkills, refetch: refetchUserSkills } =
    api.skills.getUserSkills.useQuery({});

  // tRPCミューテーション（TODO: 実装予定）
  const addSkillToUserMutation = {
    mutate: () => {
      toast.success('技能が追加されました');
      refetchUserSkills();
      setNewSkill({
        name: '',
        category: '',
        level: 1,
        experience: 0,
        certified: false,
      });
    },
  };

  const updateUserSkillMutation = {
    mutate: () => {
      toast.success('技能が更新されました');
      refetchUserSkills();
    },
  };

  const removeSkillFromUserMutation = {
    mutate: () => {
      toast.success('技能が削除されました');
      refetchUserSkills();
    },
  };

  const skillCategories = [
    '身体介護',
    '生活援助',
    '医療処置',
    '相談業務',
    '管理業務',
    'リハビリ',
    '認知症ケア',
    '緊急対応',
  ];

  const staffList: Staff[] = [
    {
      id: 1,
      name: '田中 太郎',
      position: '相談員',
      employment: '常勤',
      qualification: '介福',
      category: '相談員',
      experienceYears: 8,
      workPatterns: ['日勤', '遅番'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: false,
      },
      skills: [
        {
          id: '1',
          name: 'ケアプラン作成',
          category: '相談業務',
          level: 5,
          experience: 8,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '2',
          name: '家族相談',
          category: '相談業務',
          level: 4,
          experience: 6,
          certified: false,
          lastUpdated: '2024-01-15',
        },
        {
          id: '3',
          name: '認知症対応',
          category: '認知症ケア',
          level: 3,
          experience: 4,
          certified: true,
          lastUpdated: '2024-01-15',
        },
      ],
    },
    {
      id: 4,
      name: '高橋 美咲',
      position: '介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      experienceYears: 5,
      workPatterns: ['早番', '日勤', '遅番'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: false,
      },
      skills: [
        {
          id: '4',
          name: '身体介護',
          category: '身体介護',
          level: 4,
          experience: 5,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '5',
          name: '入浴介助',
          category: '身体介護',
          level: 4,
          experience: 4,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '6',
          name: '認知症対応',
          category: '認知症ケア',
          level: 3,
          experience: 3,
          certified: false,
          lastUpdated: '2024-01-15',
        },
        {
          id: '7',
          name: '緊急時対応',
          category: '緊急対応',
          level: 2,
          experience: 2,
          certified: false,
          lastUpdated: '2024-01-15',
        },
      ],
    },
    {
      id: 5,
      name: '伊藤 健太',
      position: '主任介護職員',
      employment: '常勤',
      qualification: '介福',
      category: '介護職員',
      experienceYears: 12,
      workPatterns: ['早番', '日勤', '遅番', '夜勤'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: true,
      },
      skills: [
        {
          id: '8',
          name: '身体介護',
          category: '身体介護',
          level: 5,
          experience: 12,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '9',
          name: 'チームリーダー',
          category: '管理業務',
          level: 4,
          experience: 6,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '10',
          name: '新人指導',
          category: '管理業務',
          level: 4,
          experience: 8,
          certified: false,
          lastUpdated: '2024-01-15',
        },
        {
          id: '11',
          name: '緊急時対応',
          category: '緊急対応',
          level: 5,
          experience: 10,
          certified: true,
          lastUpdated: '2024-01-15',
        },
      ],
    },
    {
      id: 10,
      name: '加藤 真理',
      position: '看護師',
      employment: '常勤',
      qualification: 'NS',
      category: '看護職員',
      experienceYears: 15,
      workPatterns: ['日勤', '遅番', '夜勤'],
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: true,
      },
      skills: [
        {
          id: '12',
          name: '医療処置',
          category: '医療処置',
          level: 5,
          experience: 15,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '13',
          name: '服薬管理',
          category: '医療処置',
          level: 5,
          experience: 12,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '14',
          name: '緊急時対応',
          category: '緊急対応',
          level: 5,
          experience: 15,
          certified: true,
          lastUpdated: '2024-01-15',
        },
        {
          id: '15',
          name: '健康管理',
          category: '医療処置',
          level: 4,
          experience: 10,
          certified: true,
          lastUpdated: '2024-01-15',
        },
      ],
    },
  ];

  const findCompatibleStaff = (
    targetStaff: Staff,
    requiredSkills: string[] = []
  ) => {
    return staffList
      .filter(staff => staff.id !== targetStaff.id)
      .map(staff => {
        const compatibility = calculateCompatibility(
          targetStaff,
          staff,
          requiredSkills
        );
        return { staff, compatibility };
      })
      .sort((a, b) => b.compatibility.total - a.compatibility.total);
  };

  const calculateCompatibility = (
    staff1: Staff,
    staff2: Staff,
    requiredSkills: string[] = []
  ) => {
    // スキルマッチング
    const staff1Skills = staff1.skills.map(s => s.name);
    const staff2Skills = staff2.skills.map(s => s.name);
    const commonSkills = staff1Skills.filter(skill =>
      staff2Skills.includes(skill)
    );
    const skillMatch =
      commonSkills.length / Math.max(staff1Skills.length, staff2Skills.length);

    // カテゴリマッチング
    const categoryMatch = staff1.category === staff2.category ? 1 : 0.5;

    // 勤務パターンマッチング
    const commonPatterns = staff1.workPatterns.filter(pattern =>
      staff2.workPatterns.includes(pattern)
    );
    const patternMatch =
      commonPatterns.length /
      Math.max(staff1.workPatterns.length, staff2.workPatterns.length);

    // 必須スキルチェック
    const requiredSkillMatch =
      requiredSkills.length > 0
        ? requiredSkills.filter(skill => staff2Skills.includes(skill)).length /
          requiredSkills.length
        : 1;

    // 経験年数の差
    const experienceDiff = Math.abs(
      staff1.experienceYears - staff2.experienceYears
    );
    const experienceMatch = Math.max(0, 1 - experienceDiff / 20);

    const total =
      (skillMatch * 0.3 +
        categoryMatch * 0.2 +
        patternMatch * 0.2 +
        requiredSkillMatch * 0.2 +
        experienceMatch * 0.1) *
      100;

    return {
      total: Math.round(total),
      skillMatch: Math.round(skillMatch * 100),
      categoryMatch: Math.round(categoryMatch * 100),
      patternMatch: Math.round(patternMatch * 100),
      requiredSkillMatch: Math.round(requiredSkillMatch * 100),
      experienceMatch: Math.round(experienceMatch * 100),
      commonSkills,
      commonPatterns,
    };
  };

  const getSkillLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-green-100 text-green-800',
    };
    const labels = {
      1: '初級',
      2: '基礎',
      3: '中級',
      4: '上級',
      5: '専門',
    };

    return (
      <Badge className={colors[level as keyof typeof colors]}>
        {labels[level as keyof typeof labels]} (Lv.{level})
      </Badge>
    );
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || staff.category === filterCategory;
    const matchesSkill =
      skillFilter === 'all' ||
      staff.skills.some(skill => skill.category === skillFilter);

    return matchesSearch && matchesCategory && matchesSkill;
  });

  const addSkillToStaff = () => {
    if (!selectedStaff || !newSkill.name || !newSkill.category) {
      toast.error('必須項目を入力してください');
      return;
    }

    // 既存の技能を検索
    const existingSkill = skills?.find(
      (skill: any) => skill.name === newSkill.name
    );
    if (!existingSkill) {
      toast.error(
        '指定された技能が存在しません。先に技能マスターに登録してください。'
      );
      return;
    }

    addSkillToUserMutation.mutate();
  };

  const handleRemoveSkill = (skillId: string) => {
    if (!selectedStaff) return;

    if (confirm('この技能を削除しますか？')) {
      removeSkillFromUserMutation.mutate();
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
              職員技能管理
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Filter className='h-5 w-5 mr-2' />
                検索・フィルター
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div>
                  <Label htmlFor='search'>職員名・職種で検索</Label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      id='search'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder='検索...'
                      className='pl-10'
                    />
                  </div>
                </div>
                <div>
                  <Label>職種カテゴリ</Label>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>すべて</SelectItem>
                      <SelectItem value='相談員'>相談員</SelectItem>
                      <SelectItem value='介護職員'>介護職員</SelectItem>
                      <SelectItem value='看護職員'>看護職員</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>技能カテゴリ</Label>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>すべて</SelectItem>
                      {skillCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-end'>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                      setSkillFilter('all');
                    }}
                    variant='outline'
                    className='w-full'
                  >
                    リセット
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <div className='space-y-4'>
              {filteredStaff.map(staff => (
                <Card
                  key={staff.id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <User className='h-5 w-5 text-gray-500' />
                        <div>
                          <h3 className='font-medium'>{staff.name}</h3>
                          <p className='text-sm text-gray-600'>
                            {staff.position} | {staff.employment} | 経験
                            {staff.experienceYears}年
                          </p>
                        </div>
                      </div>
                      <div className='flex space-x-2'>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setSelectedStaff(staff)}
                            >
                              <Eye className='h-4 w-4 mr-1' />
                              詳細
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                            <DialogHeader>
                              <DialogTitle className='flex items-center'>
                                <User className='h-5 w-5 mr-2' />
                                {staff.name} - 技能詳細
                              </DialogTitle>
                            </DialogHeader>

                            <Tabs defaultValue='skills' className='w-full'>
                              <TabsList className='grid w-full grid-cols-3'>
                                <TabsTrigger value='skills'>
                                  技能一覧
                                </TabsTrigger>
                                <TabsTrigger value='compatibility'>
                                  適合性分析
                                </TabsTrigger>
                                <TabsTrigger value='manage'>
                                  技能管理
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value='skills' className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className='text-lg'>
                                        基本情報
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-2'>
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          職種:
                                        </span>
                                        <span>{staff.position}</span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          雇用形態:
                                        </span>
                                        <span>{staff.employment}</span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          資格:
                                        </span>
                                        <span>{staff.qualification}</span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          経験年数:
                                        </span>
                                        <span>{staff.experienceYears}年</span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className='text-lg'>
                                        勤務パターン
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className='space-y-2'>
                                        <div>
                                          <span className='text-gray-600 text-sm'>
                                            対応可能シフト:
                                          </span>
                                          <div className='flex flex-wrap gap-1 mt-1'>
                                            {staff.workPatterns.map(pattern => (
                                              <Badge
                                                key={pattern}
                                                variant='outline'
                                              >
                                                {pattern}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <span className='text-gray-600 text-sm'>
                                            時間帯別対応:
                                          </span>
                                          <div className='grid grid-cols-2 gap-2 mt-1'>
                                            <div className='flex items-center space-x-2'>
                                              <div
                                                className={`w-3 h-3 rounded-full ${staff.availability.morning ? 'bg-green-500' : 'bg-gray-300'}`}
                                              ></div>
                                              <span className='text-sm'>
                                                朝
                                              </span>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                              <div
                                                className={`w-3 h-3 rounded-full ${staff.availability.afternoon ? 'bg-green-500' : 'bg-gray-300'}`}
                                              ></div>
                                              <span className='text-sm'>
                                                昼
                                              </span>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                              <div
                                                className={`w-3 h-3 rounded-full ${staff.availability.evening ? 'bg-green-500' : 'bg-gray-300'}`}
                                              ></div>
                                              <span className='text-sm'>
                                                夕
                                              </span>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                              <div
                                                className={`w-3 h-3 rounded-full ${staff.availability.night ? 'bg-green-500' : 'bg-gray-300'}`}
                                              ></div>
                                              <span className='text-sm'>
                                                夜
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className='text-lg'>
                                      保有技能
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className='space-y-3'>
                                      {staff.skills.map(skill => (
                                        <div
                                          key={skill.id}
                                          className='flex items-center justify-between p-3 border rounded-lg'
                                        >
                                          <div className='flex-1'>
                                            <div className='flex items-center space-x-2 mb-1'>
                                              <h4 className='font-medium'>
                                                {skill.name}
                                              </h4>
                                              {skill.certified && (
                                                <Badge className='bg-blue-100 text-blue-800'>
                                                  <Award className='h-3 w-3 mr-1' />
                                                  認定
                                                </Badge>
                                              )}
                                            </div>
                                            <div className='flex items-center space-x-4 text-sm text-gray-600'>
                                              <span>
                                                カテゴリ: {skill.category}
                                              </span>
                                              <span>
                                                経験: {skill.experience}年
                                              </span>
                                              <span>
                                                更新: {skill.lastUpdated}
                                              </span>
                                            </div>
                                          </div>
                                          <div className='flex items-center space-x-2'>
                                            {getSkillLevelBadge(skill.level)}
                                            <div className='flex'>
                                              {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                  key={star}
                                                  className={`h-4 w-4 ${
                                                    star <= skill.level
                                                      ? 'text-yellow-400 fill-current'
                                                      : 'text-gray-300'
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent
                                value='compatibility'
                                className='space-y-4'
                              >
                                <Card>
                                  <CardHeader>
                                    <CardTitle className='text-lg'>
                                      他職員との適合性
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className='space-y-4'>
                                      {findCompatibleStaff(staff)
                                        .slice(0, 5)
                                        .map(
                                          ({
                                            staff: compatibleStaff,
                                            compatibility,
                                          }) => (
                                            <div
                                              key={compatibleStaff.id}
                                              className='p-4 border rounded-lg'
                                            >
                                              <div className='flex items-center justify-between mb-3'>
                                                <div className='flex items-center space-x-3'>
                                                  <User className='h-5 w-5 text-gray-500' />
                                                  <div>
                                                    <h4 className='font-medium'>
                                                      {compatibleStaff.name}
                                                    </h4>
                                                    <p className='text-sm text-gray-600'>
                                                      {compatibleStaff.position}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className='text-right'>
                                                  <div className='text-2xl font-bold text-blue-600'>
                                                    {compatibility.total}%
                                                  </div>
                                                  <div className='text-sm text-gray-600'>
                                                    総合適合度
                                                  </div>
                                                </div>
                                              </div>

                                              <div className='grid grid-cols-2 md:grid-cols-5 gap-2 text-sm'>
                                                <div className='text-center'>
                                                  <div className='font-medium text-gray-900'>
                                                    {compatibility.skillMatch}%
                                                  </div>
                                                  <div className='text-gray-600'>
                                                    技能
                                                  </div>
                                                </div>
                                                <div className='text-center'>
                                                  <div className='font-medium text-gray-900'>
                                                    {
                                                      compatibility.categoryMatch
                                                    }
                                                    %
                                                  </div>
                                                  <div className='text-gray-600'>
                                                    職種
                                                  </div>
                                                </div>
                                                <div className='text-center'>
                                                  <div className='font-medium text-gray-900'>
                                                    {compatibility.patternMatch}
                                                    %
                                                  </div>
                                                  <div className='text-gray-600'>
                                                    勤務
                                                  </div>
                                                </div>
                                                <div className='text-center'>
                                                  <div className='font-medium text-gray-900'>
                                                    {
                                                      compatibility.experienceMatch
                                                    }
                                                    %
                                                  </div>
                                                  <div className='text-gray-600'>
                                                    経験
                                                  </div>
                                                </div>
                                                <div className='text-center'>
                                                  <div className='font-medium text-gray-900'>
                                                    {
                                                      compatibility.commonSkills
                                                        .length
                                                    }
                                                  </div>
                                                  <div className='text-gray-600'>
                                                    共通技能
                                                  </div>
                                                </div>
                                              </div>

                                              {compatibility.commonSkills
                                                .length > 0 && (
                                                <div className='mt-3'>
                                                  <div className='text-sm text-gray-600 mb-1'>
                                                    共通技能:
                                                  </div>
                                                  <div className='flex flex-wrap gap-1'>
                                                    {compatibility.commonSkills.map(
                                                      skill => (
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
                                              )}
                                            </div>
                                          )
                                        )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value='manage' className='space-y-4'>
                                <Card>
                                  <CardHeader>
                                    <CardTitle className='text-lg'>
                                      新しい技能を追加
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                      <div>
                                        <Label htmlFor='skillName'>
                                          技能名
                                        </Label>
                                        <Input
                                          id='skillName'
                                          value={newSkill.name}
                                          onChange={e =>
                                            setNewSkill({
                                              ...newSkill,
                                              name: e.target.value,
                                            })
                                          }
                                          placeholder='技能名を入力'
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor='skillCategory'>
                                          カテゴリ
                                        </Label>
                                        <Select
                                          value={newSkill.category}
                                          onValueChange={value =>
                                            setNewSkill({
                                              ...newSkill,
                                              category: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder='カテゴリを選択' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {skillCategories.map(category => (
                                              <SelectItem
                                                key={category}
                                                value={category}
                                              >
                                                {category}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor='skillLevel'>
                                          技能レベル
                                        </Label>
                                        <Select
                                          value={newSkill.level.toString()}
                                          onValueChange={value =>
                                            setNewSkill({
                                              ...newSkill,
                                              level: Number.parseInt(value),
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value='1'>
                                              初級 (Lv.1)
                                            </SelectItem>
                                            <SelectItem value='2'>
                                              基礎 (Lv.2)
                                            </SelectItem>
                                            <SelectItem value='3'>
                                              中級 (Lv.3)
                                            </SelectItem>
                                            <SelectItem value='4'>
                                              上級 (Lv.4)
                                            </SelectItem>
                                            <SelectItem value='5'>
                                              専門 (Lv.5)
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor='skillExperience'>
                                          経験年数
                                        </Label>
                                        <Input
                                          id='skillExperience'
                                          type='number'
                                          min='0'
                                          value={newSkill.experience}
                                          onChange={e =>
                                            setNewSkill({
                                              ...newSkill,
                                              experience:
                                                Number.parseInt(
                                                  e.target.value
                                                ) || 0,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className='mt-4 flex items-center space-x-2'>
                                      <input
                                        type='checkbox'
                                        id='certified'
                                        checked={newSkill.certified}
                                        onChange={e =>
                                          setNewSkill({
                                            ...newSkill,
                                            certified: e.target.checked,
                                          })
                                        }
                                        className='rounded'
                                      />
                                      <Label htmlFor='certified'>
                                        認定資格あり
                                      </Label>
                                    </div>
                                    <div className='mt-4'>
                                      <Button
                                        onClick={addSkillToStaff}
                                        className='w-full'
                                      >
                                        <Plus className='h-4 w-4 mr-2' />
                                        技能を追加
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          主要技能
                        </h4>
                        <div className='flex flex-wrap gap-2'>
                          {staff.skills.slice(0, 4).map(skill => (
                            <div
                              key={skill.id}
                              className='flex items-center space-x-1'
                            >
                              <Badge variant='outline' className='text-xs'>
                                {skill.name}
                              </Badge>
                              <div className='flex'>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= skill.level
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                          {staff.skills.length > 4 && (
                            <Badge variant='outline' className='text-xs'>
                              +{staff.skills.length - 4}個
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          勤務対応
                        </h4>
                        <div className='flex flex-wrap gap-1'>
                          {staff.workPatterns.map(pattern => (
                            <Badge
                              key={pattern}
                              variant='outline'
                              className='text-xs'
                            >
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Users className='h-5 w-5 mr-2' />
                  技能統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-3 bg-blue-50 rounded-lg'>
                    <div className='text-sm text-blue-600'>総職員数</div>
                    <div className='text-2xl font-bold text-blue-800'>
                      {staffList.length}名
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-gray-900'>
                      カテゴリ別職員数
                    </h4>
                    {['相談員', '介護職員', '看護職員'].map(category => {
                      const count = staffList.filter(
                        s => s.category === category
                      ).length;
                      return (
                        <div
                          key={category}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm text-gray-600'>
                            {category}
                          </span>
                          <Badge variant='outline'>{count}名</Badge>
                        </div>
                      );
                    })}
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-gray-900'>
                      技能カテゴリ別保有者数
                    </h4>
                    {skillCategories.map(category => {
                      const count = staffList.filter(staff =>
                        staff.skills.some(skill => skill.category === category)
                      ).length;
                      return (
                        <div
                          key={category}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm text-gray-600'>
                            {category}
                          </span>
                          <Badge variant='outline'>{count}名</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
