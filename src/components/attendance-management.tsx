'use client';

import {
  ArrowLeft,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  UserCheck,
} from 'lucide-react';
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

export function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState('2024-02-01');
  const [filterStatus, setFilterStatus] = useState('all');

  const currentlyWorkingStaff = [
    {
      id: 1,
      name: '田中 太郎',
      position: '介護福祉士',
      shift: '日勤',
      clockInTime: '08:55',
      scheduledEnd: '18:00',
      workingHours: '4時間35分',
      location: '1階フロア',
      status: 'working',
    },
    {
      id: 2,
      name: '佐藤 花子',
      position: '看護師',
      shift: '早番',
      clockInTime: '07:05',
      scheduledEnd: '16:00',
      workingHours: '6時間25分',
      location: '2階フロア',
      status: 'working',
    },
    {
      id: 3,
      name: '鈴木 次郎',
      position: '介護士',
      shift: '遅番',
      clockInTime: '10:45',
      scheduledEnd: '20:00',
      workingHours: '2時間45分',
      location: '3階フロア',
      status: 'working',
    },
    {
      id: 4,
      name: '高橋 美咲',
      position: 'ケアマネージャー',
      shift: '日勤',
      clockInTime: '09:00',
      scheduledEnd: '18:00',
      workingHours: '4時間30分',
      location: '事務室',
      status: 'break',
    },
  ];

  const attendanceRecords = [
    {
      id: 1,
      name: '田中 太郎',
      date: '2024-02-01',
      shift: '日勤',
      scheduledStart: '09:00',
      scheduledEnd: '18:00',
      actualStart: '08:55',
      actualEnd: '18:10',
      status: 'approved',
      breakTime: '60分',
      overtime: '10分',
      notes: '',
    },
    {
      id: 2,
      name: '佐藤 花子',
      date: '2024-02-01',
      shift: '早番',
      scheduledStart: '07:00',
      scheduledEnd: '16:00',
      actualStart: '07:05',
      actualEnd: '16:00',
      status: 'pending',
      breakTime: '60分',
      overtime: '0分',
      notes: '電車遅延のため5分遅刻',
    },
    {
      id: 3,
      name: '鈴木 次郎',
      date: '2024-02-01',
      shift: '遅番',
      scheduledStart: '11:00',
      scheduledEnd: '20:00',
      actualStart: '10:45',
      actualEnd: '20:30',
      status: 'correction_requested',
      breakTime: '60分',
      overtime: '30分',
      notes: '緊急対応のため残業',
    },
  ];

  const pendingRequests = [
    {
      id: 1,
      name: '高橋 美咲',
      type: 'correction',
      date: '2024-01-30',
      requestDate: '2024-02-01',
      reason: '打刻忘れ',
      details: '退勤時の打刻を忘れました。18:00に退勤しています。',
      status: 'pending',
    },
    {
      id: 2,
      name: '山田 健一',
      type: 'overtime',
      date: '2024-01-31',
      requestDate: '2024-02-01',
      reason: '緊急対応',
      details: '利用者の体調不良により30分残業しました。',
      status: 'pending',
    },
  ];

  const staffMonthlyStats = [
    {
      id: 1,
      name: '田中 太郎',
      position: '介護福祉士',
      totalWorkHours: '168時間30分',
      totalOvertimeHours: '12時間15分',
      publicHolidays: 8,
      workDays: 20,
      absentDays: 0,
      remainingPaidLeave: 15,
    },
    {
      id: 2,
      name: '佐藤 花子',
      position: '看護師',
      totalWorkHours: '160時間00分',
      totalOvertimeHours: '8時間30分',
      publicHolidays: 8,
      workDays: 19,
      absentDays: 1,
      remainingPaidLeave: 12,
    },
    {
      id: 3,
      name: '鈴木 次郎',
      position: '介護士',
      totalWorkHours: '172時間45分',
      totalOvertimeHours: '15時間20分',
      publicHolidays: 8,
      workDays: 21,
      absentDays: 0,
      remainingPaidLeave: 18,
    },
    {
      id: 4,
      name: '高橋 美咲',
      position: 'ケアマネージャー',
      totalWorkHours: '165時間15分',
      totalOvertimeHours: '10時間45分',
      publicHolidays: 8,
      workDays: 20,
      absentDays: 0,
      remainingPaidLeave: 14,
    },
    {
      id: 5,
      name: '山田 健一',
      position: '介護福祉士',
      totalWorkHours: '158時間20分',
      totalOvertimeHours: '6時間50分',
      publicHolidays: 8,
      workDays: 19,
      absentDays: 1,
      remainingPaidLeave: 16,
    },
  ];

  const getWorkingStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return (
          <Badge className='bg-green-100 text-green-800'>
            <UserCheck className='h-3 w-3 mr-1' />
            勤務中
          </Badge>
        );
      case 'break':
        return (
          <Badge className='bg-blue-100 text-blue-800'>
            <Clock className='h-3 w-3 mr-1' />
            休憩中
          </Badge>
        );
      default:
        return null;
    }
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
      case 'pending':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>
            <Clock className='h-3 w-3 mr-1' />
            承認待ち
          </Badge>
        );
      case 'correction_requested':
        return (
          <Badge className='bg-orange-100 text-orange-800'>
            <AlertTriangle className='h-3 w-3 mr-1' />
            訂正申請
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (filterStatus === 'all') return true;
    return record.status === filterStatus;
  });

  const sortedRecords = filteredRecords.sort((a, b) => {
    // 承認済み以外を上に、承認済みを下に表示
    if (a.status === 'approved' && b.status !== 'approved') return 1;
    if (a.status !== 'approved' && b.status === 'approved') return -1;
    return 0;
  });

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
                  {currentlyWorkingStaff.length}名
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
                    {currentlyWorkingStaff.map(staff => (
                      <tr key={staff.id} className='border-b hover:bg-gray-50'>
                        <td className='py-2 px-3'>
                          <div className='flex items-center space-x-2'>
                            <User className='h-4 w-4 text-gray-500' />
                            <span className='font-medium'>{staff.name}</span>
                          </div>
                        </td>
                        <td className='py-2 px-3 text-gray-600'>
                          {staff.position}
                        </td>
                        <td className='py-2 px-3 text-center'>{staff.shift}</td>
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
                          {getWorkingStatusBadge(staff.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center p-3 bg-green-50 rounded'>
                  <p className='text-2xl font-bold text-green-600'>
                    {
                      currentlyWorkingStaff.filter(s => s.status === 'working')
                        .length
                    }
                  </p>
                  <p className='text-sm text-green-600'>勤務中</p>
                </div>
                <div className='text-center p-3 bg-blue-50 rounded'>
                  <p className='text-2xl font-bold text-blue-600'>
                    {
                      currentlyWorkingStaff.filter(s => s.status === 'break')
                        .length
                    }
                  </p>
                  <p className='text-sm text-blue-600'>休憩中</p>
                </div>
                <div className='text-center p-3 bg-purple-50 rounded'>
                  <p className='text-2xl font-bold text-purple-600'>
                    {currentlyWorkingStaff.length}
                  </p>
                  <p className='text-sm text-purple-600'>総出勤者数</p>
                </div>
                <div className='text-center p-3 bg-orange-50 rounded'>
                  <p className='text-2xl font-bold text-orange-600'>
                    {new Date().toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className='text-sm text-orange-600'>現在時刻</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='mb-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Calendar className='h-5 w-5 mr-2' />
                フィルター
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-4'>
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
                  <Label htmlFor='status'>ステータス</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className='w-48'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>すべて</SelectItem>
                      <SelectItem value='pending'>承認待ち</SelectItem>
                      <SelectItem value='approved'>承認済み</SelectItem>
                      <SelectItem value='correction_requested'>
                        訂正申請
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>勤怠記録 - 2024年2月1日</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {sortedRecords.map(record => (
                    <div
                      key={record.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <User className='h-5 w-5 text-gray-500' />
                          <div>
                            <h3 className='font-medium'>{record.name}</h3>
                            <p className='text-sm text-gray-600'>
                              {record.shift}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(record.status)}
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <p className='text-gray-600'>予定時間</p>
                          <p className='font-medium'>
                            {record.scheduledStart} - {record.scheduledEnd}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>実際の時間</p>
                          <p className='font-medium'>
                            {record.actualStart} - {record.actualEnd}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>休憩時間</p>
                          <p className='font-medium'>{record.breakTime}</p>
                        </div>
                        <div>
                          <p className='text-gray-600'>残業時間</p>
                          <p className='font-medium'>{record.overtime}</p>
                        </div>
                      </div>

                      {record.notes && (
                        <div className='mt-3 p-2 bg-gray-50 rounded'>
                          <p className='text-sm text-gray-600'>
                            {record.notes}
                          </p>
                        </div>
                      )}

                      {record.status === 'pending' && (
                        <div className='mt-3 flex space-x-2'>
                          <Button
                            size='sm'
                            className='bg-green-600 hover:bg-green-700'
                          >
                            承認
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                          >
                            却下
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>申請・訂正依頼</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {pendingRequests.map(request => (
                    <div
                      key={request.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <User className='h-5 w-5 text-gray-500' />
                          <div>
                            <h3 className='font-medium'>{request.name}</h3>
                            <p className='text-sm text-gray-600'>
                              {request.type === 'correction'
                                ? '勤怠訂正'
                                : '残業申請'}{' '}
                              - {request.date}
                            </p>
                          </div>
                        </div>
                        <Badge className='bg-yellow-100 text-yellow-800'>
                          <Clock className='h-3 w-3 mr-1' />
                          承認待ち
                        </Badge>
                      </div>

                      <div className='mb-3'>
                        <p className='text-sm text-gray-600 mb-1'>理由</p>
                        <p className='text-sm font-medium'>{request.reason}</p>
                      </div>

                      <div className='mb-3 p-2 bg-gray-50 rounded'>
                        <p className='text-sm text-gray-600'>
                          {request.details}
                        </p>
                      </div>

                      <div className='flex space-x-2'>
                        <Button
                          size='sm'
                          className='bg-green-600 hover:bg-green-700'
                        >
                          承認
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                        >
                          却下
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Users className='h-5 w-5 mr-2' />
                  職員一覧 - 2024年2月 月次統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          職員名
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          職種
                        </th>
                        <th className='text-center py-3 px-4 font-medium text-gray-900'>
                          総出勤時間
                        </th>
                        <th className='text-center py-3 px-4 font-medium text-gray-900'>
                          総残業時間
                        </th>
                        <th className='text-center py-3 px-4 font-medium text-gray-900'>
                          公休数
                        </th>
                        <th className='text-center py-3 px-4 font-medium text-gray-900'>
                          出勤数
                        </th>
                        <th className='text-center py-3 px-4 font-medium text-gray-900'>
                          欠勤数
                        </th>
                        <th className='text-center py-3 px-4 font-medium text-gray-900'>
                          残有給数
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffMonthlyStats.map(staff => (
                        <tr
                          key={staff.id}
                          className='border-b hover:bg-gray-50'
                        >
                          <td className='py-3 px-4'>
                            <div className='flex items-center space-x-3'>
                              <User className='h-4 w-4 text-gray-500' />
                              <span className='font-medium'>{staff.name}</span>
                            </div>
                          </td>
                          <td className='py-3 px-4 text-gray-600'>
                            {staff.position}
                          </td>
                          <td className='py-3 px-4 text-center font-medium text-blue-600'>
                            {staff.totalWorkHours}
                          </td>
                          <td className='py-3 px-4 text-center font-medium text-orange-600'>
                            {staff.totalOvertimeHours}
                          </td>
                          <td className='py-3 px-4 text-center'>
                            {staff.publicHolidays}日
                          </td>
                          <td className='py-3 px-4 text-center font-medium text-green-600'>
                            {staff.workDays}日
                          </td>
                          <td className='py-3 px-4 text-center'>
                            <span
                              className={
                                staff.absentDays > 0
                                  ? 'font-medium text-red-600'
                                  : 'text-gray-600'
                              }
                            >
                              {staff.absentDays}日
                            </span>
                          </td>
                          <td className='py-3 px-4 text-center font-medium text-purple-600'>
                            {staff.remainingPaidLeave}日
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center p-3 bg-blue-50 rounded'>
                    <p className='text-xl font-bold text-blue-600'>
                      824時間50分
                    </p>
                    <p className='text-sm text-blue-600'>総出勤時間</p>
                  </div>
                  <div className='text-center p-3 bg-orange-50 rounded'>
                    <p className='text-xl font-bold text-orange-600'>
                      53時間20分
                    </p>
                    <p className='text-sm text-orange-600'>総残業時間</p>
                  </div>
                  <div className='text-center p-3 bg-green-50 rounded'>
                    <p className='text-xl font-bold text-green-600'>99日</p>
                    <p className='text-sm text-green-600'>総出勤日数</p>
                  </div>
                  <div className='text-center p-3 bg-purple-50 rounded'>
                    <p className='text-xl font-bold text-purple-600'>75日</p>
                    <p className='text-sm text-purple-600'>総残有給数</p>
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
