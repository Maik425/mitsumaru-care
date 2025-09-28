'use client';

import { api } from '@/lib/trpc';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  User,
  UserCheck,
  Users,
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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [filterStatus, setFilterStatus] = useState('all');

  // API呼び出し
  const { data: currentlyWorkingStaff = [] } =
    api.attendance.getCurrentlyWorkingStaff.useQuery({});
  const { data: attendanceRecords = [] } =
    api.attendance.getAttendanceRecords.useQuery({
      date: selectedDate,
      status: filterStatus === 'all' ? undefined : (filterStatus as any),
      limit: 50,
    });
  const { data: attendanceRequests = [] } =
    api.attendance.getAttendanceRequests.useQuery({
      status: 'pending',
      limit: 50,
    });

  const approveRecordMutation =
    api.attendance.updateAttendanceRecord.useMutation();
  const rejectRecordMutation =
    api.attendance.updateAttendanceRecord.useMutation();
  const approveRequestMutation =
    api.attendance.updateAttendanceRequest.useMutation();
  const rejectRequestMutation =
    api.attendance.updateAttendanceRequest.useMutation();

  // ハンドラー関数
  const handleApproveRecord = async (recordId: string) => {
    try {
      await approveRecordMutation.mutateAsync({
        id: recordId,
        status: 'approved',
        approved_by: 'current-user-id', // 実際の実装では認証されたユーザーIDを使用
      });
    } catch (error) {
      console.error('Failed to approve record:', error);
    }
  };

  const handleRejectRecord = async (recordId: string) => {
    try {
      await rejectRecordMutation.mutateAsync({
        id: recordId,
        status: 'rejected',
        approved_by: 'current-user-id', // 実際の実装では認証されたユーザーIDを使用
      });
    } catch (error) {
      console.error('Failed to reject record:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequestMutation.mutateAsync({
        id: requestId,
        status: 'approved',
        reviewed_by: 'current-user-id', // 実際の実装では認証されたユーザーIDを使用
      });
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequestMutation.mutateAsync({
        id: requestId,
        status: 'rejected',
        reviewed_by: 'current-user-id', // 実際の実装では認証されたユーザーIDを使用
      });
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  // 勤務時間を計算する関数
  const calculateWorkingHours = (startTime: string, endTime?: string) => {
    if (!startTime) return '0時間0分';

    const start = new Date(`2000-01-01T${startTime}`);
    const end = endTime ? new Date(`2000-01-01T${endTime}`) : new Date();
    const current = new Date(
      `2000-01-01T${new Date().toTimeString().slice(0, 8)}`
    );

    const actualEnd = endTime ? end : current;
    const diffMinutes = (actualEnd.getTime() - start.getTime()) / (1000 * 60);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.floor(diffMinutes % 60);

    return `${hours}時間${minutes}分`;
  };

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

  const filteredRecords = attendanceRecords.filter((record: any) => {
    if (filterStatus === 'all') return true;
    return record.status === filterStatus;
  });

  const sortedRecords = filteredRecords.sort((a: any, b: any) => {
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
                    {currentlyWorkingStaff.map((staff: any) => (
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
                      currentlyWorkingStaff.filter(
                        (s: any) => s.status === 'working'
                      ).length
                    }
                  </p>
                  <p className='text-sm text-green-600'>勤務中</p>
                </div>
                <div className='text-center p-3 bg-blue-50 rounded'>
                  <p className='text-2xl font-bold text-blue-600'>
                    {
                      currentlyWorkingStaff.filter(
                        (s: any) => s.status === 'break'
                      ).length
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
                  {attendanceRecords.map((record: any) => (
                    <div
                      key={record.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <User className='h-5 w-5 text-gray-500' />
                          <div>
                            <h3 className='font-medium'>
                              職員ID: {record.user_id}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {record.date}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(record.status)}
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <p className='text-gray-600'>予定時間</p>
                          <p className='font-medium'>
                            {record.scheduled_start_time || '未設定'} -{' '}
                            {record.scheduled_end_time || '未設定'}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>実際の時間</p>
                          <p className='font-medium'>
                            {record.actual_start_time || '未打刻'} -{' '}
                            {record.actual_end_time || '未打刻'}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>休憩時間</p>
                          <p className='font-medium'>
                            {record.break_duration}分
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>残業時間</p>
                          <p className='font-medium'>
                            {record.overtime_duration}分
                          </p>
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
                            onClick={() => handleApproveRecord(record.id)}
                          >
                            承認
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                            onClick={() => handleRejectRecord(record.id)}
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
                  {attendanceRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <User className='h-5 w-5 text-gray-500' />
                          <div>
                            <h3 className='font-medium'>
                              職員ID: {request.user_id}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {request.type === 'clock_correction'
                                ? '打刻忘れ訂正'
                                : request.type === 'overtime'
                                  ? '残業申請'
                                  : '勤務時間変更申請'}{' '}
                              - {request.target_date}
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

                      {(request.original_start_time ||
                        request.requested_start_time) && (
                        <div className='mb-3 p-2 bg-gray-50 rounded'>
                          <p className='text-sm text-gray-600'>
                            {request.original_start_time &&
                              request.original_end_time && (
                                <span>
                                  元の時間: {request.original_start_time} -{' '}
                                  {request.original_end_time}
                                </span>
                              )}
                            {request.requested_start_time &&
                              request.requested_end_time && (
                                <span className='block'>
                                  申請時間: {request.requested_start_time} -{' '}
                                  {request.requested_end_time}
                                </span>
                              )}
                          </p>
                        </div>
                      )}

                      <div className='flex space-x-2'>
                        <Button
                          size='sm'
                          className='bg-green-600 hover:bg-green-700'
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          承認
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                          onClick={() => handleRejectRequest(request.id)}
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
                  月次統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center p-8 text-gray-500'>
                  <p>月次統計機能は準備中です</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
