'use client';

import { api } from '@/lib/trpc';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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
import { useAuthContext } from '@/contexts/auth-context';
import type { CurrentlyWorkingStaffRecord } from '@/data/attendance';

export function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');

  const { user } = useAuthContext();
  const currentFacilityId = user?.facility_id;

  // API呼び出し
  const { data: currentlyWorkingStaff } =
    api.attendance.getCurrentlyWorkingStaff.useQuery(
      {
        facility_id: currentFacilityId,
      },
      {
        enabled: Boolean(currentFacilityId),
      }
    );
  api.attendance.getAttendanceRecords.useQuery({
    date: selectedDate,
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 50,
  });
  api.attendance.getAttendanceRequests.useQuery({
    status: 'pending',
    limit: 50,
  });

  const typedWorkingStaff = useMemo<CurrentlyWorkingStaffRecord[]>(
    () => currentlyWorkingStaff ?? [],
    [currentlyWorkingStaff]
  );

  const totalWorking = typedWorkingStaff.filter(
    staff => staff.status === 'working'
  ).length;
  const totalBreak = typedWorkingStaff.filter(
    staff => staff.status === 'break'
  ).length;
  const totalStaff = typedWorkingStaff.length;
  const totalInactive = Math.max(totalStaff - totalWorking - totalBreak, 0);
  const currentTime = new Date().toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusBadge: Record<
    CurrentlyWorkingStaffRecord['status'],
    { label: string; className: string }
  > = {
    working: { label: '勤務中', className: 'bg-green-100 text-green-800' },
    break: { label: '休憩中', className: 'bg-blue-100 text-blue-800' },
    inactive: { label: '退勤済み', className: 'bg-gray-100 text-gray-700' },
  };

  const getStatusBadge = (status: CurrentlyWorkingStaffRecord['status']) => {
    const config = statusBadge[status];
    return <Badge className={config.className}>{config.label}</Badge>;
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
              勤怠確認
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <UserCheck className='h-5 w-5 mr-2' />
                出勤中の職員一覧
                <Badge className='ml-2 bg-green-100 text-green-800'>
                  {typedWorkingStaff.length}名
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-2 px-3 font-medium text-gray-900'>
                        職員名
                      </th>
                      <th className='text-left py-2 px-3 font-medium text-gray-900'>
                        職種
                      </th>
                      <th className='text-center py-2 px-3 font-medium text-gray-900'>
                        シフト
                      </th>
                      <th className='text-center py-2 px-3 font-medium text-gray-900'>
                        出勤時刻
                      </th>
                      <th className='text-center py-2 px-3 font-medium text-gray-900'>
                        予定終了
                      </th>
                      <th className='text-center py-2 px-3 font-medium text-gray-900'>
                        勤務時間
                      </th>
                      <th className='text-center py-2 px-3 font-medium text-gray-900'>
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {typedWorkingStaff.map(staff => (
                      <tr
                        key={staff.userId}
                        className='border-b hover:bg-gray-50'
                      >
                        <td className='py-2 px-3'>
                          <div className='flex items-center space-x-2'>
                            <User className='h-4 w-4 text-gray-500' />
                            <span className='font-medium'>{staff.name}</span>
                          </div>
                        </td>
                        <td className='py-2 px-3 text-gray-600'>
                          {staff.position}
                        </td>
                        <td className='py-2 px-3 text-center'>
                          {staff.shiftName}
                        </td>
                        <td className='py-2 px-3 text-center font-medium text-green-600'>
                          {staff.clockInTime}
                        </td>
                        <td className='py-2 px-3 text-center'>
                          {staff.scheduledEnd}
                        </td>
                        <td className='py-2 px-3 text-center font-medium text-blue-600'>
                          {staff.workingHours}
                        </td>
                        <td className='py-2 px-3 text-center'>
                          {getStatusBadge(staff.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center p-3 bg-green-50 rounded'>
                  <p className='text-2xl font-bold text-green-600'>
                    {totalWorking}
                  </p>
                  <p className='text-sm text-green-800'>勤務中</p>
                </div>
                <div className='text-center p-3 bg-blue-50 rounded'>
                  <p className='text-2xl font-bold text-blue-600'>
                    {totalBreak}
                  </p>
                  <p className='text-sm text-blue-800'>休憩中</p>
                </div>
                <div className='text-center p-3 bg-gray-50 rounded'>
                  <p className='text-2xl font-bold text-gray-700'>
                    {totalInactive}
                  </p>
                  <p className='text-sm text-gray-600'>退勤済み</p>
                </div>
                <div className='text-center p-3 bg-purple-50 rounded'>
                  <p className='text-2xl font-bold text-purple-600'>
                    {totalStaff}
                  </p>
                  <p className='text-sm text-purple-800'>対象職員数</p>
                </div>
              </div>

              <div className='mt-4 text-sm text-muted-foreground text-right'>
                更新時刻: {currentTime}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 日付選択とフィルター */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Calendar className='h-5 w-5 mr-2' />
              勤怠記録
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date'>日付</Label>
                <Input
                  id='date'
                  type='date'
                  value={selectedDate}
                  onChange={event => setSelectedDate(event.target.value)}
                  className='w-full'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='status'>ステータス</Label>
                <Select
                  value={filterStatus}
                  onValueChange={value =>
                    setFilterStatus(
                      value as 'all' | 'pending' | 'approved' | 'rejected'
                    )
                  }
                >
                  <SelectTrigger id='status'>
                    <SelectValue placeholder='すべて' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>すべて</SelectItem>
                    <SelectItem value='pending'>承認待ち</SelectItem>
                    <SelectItem value='approved'>承認済み</SelectItem>
                    <SelectItem value='rejected'>却下</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Clock className='h-5 w-5 mr-2' />
                当日日次確認
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                このセクションは将来的に詳細な日次確認機能を実装する際のプレースホルダーです。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                申請状況サマリー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                現在の勤怠申請ステータスの概要がここに表示されます。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
