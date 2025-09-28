'use client';

import { api } from '@/lib/trpc';
import { ArrowLeft, Calendar, CheckCircle, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';

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
import { Textarea } from '@/components/ui/textarea';

export function UserAttendance() {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('ja-JP', { hour12: false })
  );
  const [isWorking, setIsWorking] = useState(false);
  const [isClockCorrectionOpen, setIsClockCorrectionOpen] = useState(false);
  const [isOvertimeOpen, setIsOvertimeOpen] = useState(false);
  const [isWorkTimeChangeOpen, setIsWorkTimeChangeOpen] = useState(false);

  // 現在のユーザーID（実際の実装では認証コンテキストから取得）
  const currentUserId = '00000000-0000-0000-0000-000000000004'; // ダミーID

  // API呼び出し
  const { data: todayRecord } = api.attendance.getAttendanceRecords.useQuery({
    user_id: currentUserId,
    date: new Date().toISOString().split('T')[0],
    limit: 1,
  });

  const { data: recentRecords = [] } =
    api.attendance.getAttendanceRecords.useQuery({
      user_id: currentUserId,
      limit: 10,
    });

  const { data: pendingRequests = [] } =
    api.attendance.getAttendanceRequests.useQuery({
      user_id: currentUserId,
      status: 'pending',
      limit: 10,
    });

  const createRecordMutation =
    api.attendance.createAttendanceRecord.useMutation();
  const updateRecordMutation =
    api.attendance.updateAttendanceRecord.useMutation();
  const createRequestMutation =
    api.attendance.createAttendanceRequest.useMutation();

  // 現在時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ja-JP', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 今日の勤怠記録の状態を確認
  useEffect(() => {
    if (todayRecord && todayRecord.length > 0) {
      const record = todayRecord[0];
      setIsWorking(!!record.actual_start_time && !record.actual_end_time);
    }
  }, [todayRecord]);

  const todaySchedule = {
    shift: '日勤',
    startTime: '09:00',
    endTime: '18:00',
    breakTime: '12:00-13:00',
  };

  // recentAttendanceは既にAPIから取得しているため、ダミーデータを削除

  // pendingRequestsは既にAPIから取得しているため、ダミーデータを削除

  const handleClockIn = async () => {
    try {
      const currentTime = new Date().toTimeString().slice(0, 8);
      const today = new Date().toISOString().split('T')[0];

      if (todayRecord && todayRecord.length > 0) {
        // 既存の記録を更新
        await updateRecordMutation.mutateAsync({
          id: todayRecord[0].id,
          actual_start_time: currentTime,
        });
      } else {
        // 新しい記録を作成
        await createRecordMutation.mutateAsync({
          user_id: currentUserId,
          date: today,
          actual_start_time: currentTime,
        });
      }
      setIsWorking(true);
    } catch (error) {
      console.error('Failed to clock in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      if (todayRecord && todayRecord.length > 0) {
        const currentTime = new Date().toTimeString().slice(0, 8);
        await updateRecordMutation.mutateAsync({
          id: todayRecord[0].id,
          actual_end_time: currentTime,
        });
        setIsWorking(false);
      }
    } catch (error) {
      console.error('Failed to clock out:', error);
    }
  };

  const handleClockCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await createRequestMutation.mutateAsync({
        user_id: currentUserId,
        type: 'clock_correction',
        target_date: formData.get('date') as string,
        requested_start_time: formData.get('startTime') as string,
        requested_end_time: formData.get('endTime') as string,
        reason: formData.get('reason') as string,
      });
      setIsClockCorrectionOpen(false);
    } catch (error) {
      console.error('Failed to submit clock correction request:', error);
    }
  };

  const handleOvertimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await createRequestMutation.mutateAsync({
        user_id: currentUserId,
        type: 'overtime',
        target_date: formData.get('date') as string,
        requested_start_time: formData.get('startTime') as string,
        requested_end_time: formData.get('endTime') as string,
        reason: formData.get('reason') as string,
      });
      setIsOvertimeOpen(false);
    } catch (error) {
      console.error('Failed to submit overtime request:', error);
    }
  };

  const handleWorkTimeChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await createRequestMutation.mutateAsync({
        user_id: currentUserId,
        type: 'work_time_change',
        target_date: formData.get('date') as string,
        original_start_time: formData.get('originalStartTime') as string,
        original_end_time: formData.get('originalEndTime') as string,
        requested_start_time: formData.get('newStartTime') as string,
        requested_end_time: formData.get('newEndTime') as string,
        reason: formData.get('reason') as string,
      });
      setIsWorkTimeChangeOpen(false);
    } catch (error) {
      console.error('Failed to submit work time change request:', error);
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
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16'>
            <Link href='/user/dashboard'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className='text-xl font-semibold text-gray-900 ml-4'>
              勤怠管理
            </h1>
          </div>
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Clock className='h-5 w-5 mr-2' />
                  打刻
                </CardTitle>
              </CardHeader>
              <CardContent className='text-center'>
                <div className='mb-6'>
                  <p className='text-3xl font-bold text-gray-900 mb-2'>
                    {currentTime}
                  </p>
                  <p className='text-gray-600'>
                    {new Date().toLocaleDateString('ja-JP')}
                  </p>
                </div>

                <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
                  <h3 className='font-medium text-blue-900 mb-2'>本日の予定</h3>
                  <div className='text-sm text-blue-700'>
                    <p>
                      <strong>シフト:</strong> {todaySchedule.shift}
                    </p>
                    <p>
                      <strong>勤務時間:</strong> {todaySchedule.startTime} -{' '}
                      {todaySchedule.endTime}
                    </p>
                    <p>
                      <strong>休憩時間:</strong> {todaySchedule.breakTime}
                    </p>
                  </div>
                </div>

                <div className='space-y-3'>
                  {!isWorking ? (
                    <Button
                      onClick={handleClockIn}
                      className='w-full h-12 text-lg bg-green-600 hover:bg-green-700'
                    >
                      出勤打刻
                    </Button>
                  ) : (
                    <Button
                      onClick={handleClockOut}
                      className='w-full h-12 text-lg bg-red-600 hover:bg-red-700'
                    >
                      退勤打刻
                    </Button>
                  )}
                </div>

                {isWorking && (
                  <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded'>
                    <p className='text-green-800 font-medium'>勤務中</p>
                    <p className='text-sm text-green-600'>出勤時刻: 09:00</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span className='flex items-center'>
                    <Plus className='h-5 w-5 mr-2' />
                    申請・訂正
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <Dialog
                    open={isClockCorrectionOpen}
                    onOpenChange={setIsClockCorrectionOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start bg-transparent'
                      >
                        打刻忘れ訂正申請
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>打刻忘れ訂正申請</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleClockCorrectionSubmit}
                        className='space-y-4'
                      >
                        <div>
                          <Label htmlFor='date'>対象日</Label>
                          <Input id='date' name='date' type='date' required />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <Label htmlFor='startTime'>出勤時刻</Label>
                            <Input
                              id='startTime'
                              name='startTime'
                              type='time'
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor='endTime'>退勤時刻</Label>
                            <Input
                              id='endTime'
                              name='endTime'
                              type='time'
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor='reason'>理由</Label>
                          <Textarea
                            id='reason'
                            name='reason'
                            placeholder='打刻忘れの理由を入力してください'
                            required
                          />
                        </div>
                        <div className='flex justify-end space-x-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setIsClockCorrectionOpen(false)}
                          >
                            キャンセル
                          </Button>
                          <Button type='submit'>申請する</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isOvertimeOpen}
                    onOpenChange={setIsOvertimeOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start bg-transparent'
                      >
                        残業申請
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>残業申請</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleOvertimeSubmit}
                        className='space-y-4'
                      >
                        <div>
                          <Label htmlFor='overtimeDate'>対象日</Label>
                          <Input
                            id='overtimeDate'
                            name='date'
                            type='date'
                            required
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <Label htmlFor='overtimeStartTime'>
                              残業開始時刻
                            </Label>
                            <Input
                              id='overtimeStartTime'
                              name='startTime'
                              type='time'
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor='overtimeEndTime'>
                              残業終了時刻
                            </Label>
                            <Input
                              id='overtimeEndTime'
                              name='endTime'
                              type='time'
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor='overtimeReason'>理由</Label>
                          <Textarea
                            id='overtimeReason'
                            name='reason'
                            placeholder='残業の理由を入力してください'
                            required
                          />
                        </div>
                        <div className='flex justify-end space-x-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setIsOvertimeOpen(false)}
                          >
                            キャンセル
                          </Button>
                          <Button type='submit'>申請する</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isWorkTimeChangeOpen}
                    onOpenChange={setIsWorkTimeChangeOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start bg-transparent'
                      >
                        勤務時間変更申請
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-lg'>
                      <DialogHeader>
                        <DialogTitle>勤務時間変更申請</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleWorkTimeChangeSubmit}
                        className='space-y-4'
                      >
                        <div>
                          <Label htmlFor='changeDate'>対象日</Label>
                          <Input
                            id='changeDate'
                            name='date'
                            type='date'
                            required
                          />
                        </div>
                        <div>
                          <Label className='text-sm font-medium'>
                            元の勤務時間
                          </Label>
                          <div className='grid grid-cols-2 gap-4 mt-1'>
                            <div>
                              <Label
                                htmlFor='originalStartTime'
                                className='text-xs text-gray-600'
                              >
                                開始時刻
                              </Label>
                              <Input
                                id='originalStartTime'
                                name='originalStartTime'
                                type='time'
                                required
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor='originalEndTime'
                                className='text-xs text-gray-600'
                              >
                                終了時刻
                              </Label>
                              <Input
                                id='originalEndTime'
                                name='originalEndTime'
                                type='time'
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className='text-sm font-medium'>
                            変更後の勤務時間
                          </Label>
                          <div className='grid grid-cols-2 gap-4 mt-1'>
                            <div>
                              <Label
                                htmlFor='newStartTime'
                                className='text-xs text-gray-600'
                              >
                                開始時刻
                              </Label>
                              <Input
                                id='newStartTime'
                                name='newStartTime'
                                type='time'
                                required
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor='newEndTime'
                                className='text-xs text-gray-600'
                              >
                                終了時刻
                              </Label>
                              <Input
                                id='newEndTime'
                                name='newEndTime'
                                type='time'
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor='changeReason'>理由</Label>
                          <Textarea
                            id='changeReason'
                            name='reason'
                            placeholder='勤務時間変更の理由を入力してください'
                            required
                          />
                        </div>
                        <div className='flex justify-end space-x-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setIsWorkTimeChangeOpen(false)}
                          >
                            キャンセル
                          </Button>
                          <Button type='submit'>申請する</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {pendingRequests.length > 0 && (
                  <div className='mt-4'>
                    <h4 className='font-medium mb-2'>申請中の項目</h4>
                    {pendingRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className='p-3 bg-yellow-50 border border-yellow-200 rounded'
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-medium text-yellow-800'>
                              {request.reason}
                            </p>
                            <p className='text-sm text-yellow-600'>
                              {request.target_date}
                            </p>
                          </div>
                          <Badge className='bg-yellow-100 text-yellow-800'>
                            <Clock className='h-3 w-3 mr-1' />
                            承認待ち
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Calendar className='h-5 w-5 mr-2' />
                  最近の勤怠記録
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {recentRecords.map((record: any) => (
                    <div
                      key={record.id}
                      className='p-3 border border-gray-200 rounded'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div>
                          <p className='font-medium'>{record.date}</p>
                          <p className='text-sm text-gray-600'>勤怠記録</p>
                        </div>
                        {getStatusBadge(record.status)}
                      </div>
                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <p className='text-gray-600'>
                            出勤: {record.actual_start_time || '未打刻'}
                          </p>
                          <p className='text-gray-600'>
                            退勤: {record.actual_end_time || '未打刻'}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>
                            残業: {record.overtime_duration}分
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>今月の勤怠サマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-3 bg-blue-50 rounded'>
                    <p className='text-2xl font-bold text-blue-600'>22</p>
                    <p className='text-sm text-blue-600'>出勤日数</p>
                  </div>
                  <div className='text-center p-3 bg-green-50 rounded'>
                    <p className='text-2xl font-bold text-green-600'>176</p>
                    <p className='text-sm text-green-600'>総労働時間</p>
                  </div>
                  <div className='text-center p-3 bg-orange-50 rounded'>
                    <p className='text-2xl font-bold text-orange-600'>8</p>
                    <p className='text-sm text-orange-600'>残業時間</p>
                  </div>
                  <div className='text-center p-3 bg-red-50 rounded'>
                    <p className='text-2xl font-bold text-red-600'>1</p>
                    <p className='text-sm text-red-600'>遅刻回数</p>
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
