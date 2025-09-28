'use client';

import { api } from '@/lib/trpc';
import { CheckCircle, Clock, Plus } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

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
import { UserShell } from '@/components/user-shell';
import { useAuthContext } from '@/contexts/auth-context';

export function UserAttendance() {
  const [isClockCorrectionOpen, setIsClockCorrectionOpen] = useState(false);
  const [isOvertimeOpen, setIsOvertimeOpen] = useState(false);
  const [isWorkTimeChangeOpen, setIsWorkTimeChangeOpen] = useState(false);

  const { user } = useAuthContext();
  const currentUserId = user?.id;

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const { data: recentRecords = [], isLoading: isLoadingRecentRecords } =
    api.attendance.getAttendanceRecords.useQuery(
      {
        user_id: currentUserId,
        limit: 30,
        offset: 0,
      },
      {
        enabled: Boolean(currentUserId),
      }
    );

  const { data: pendingRequests = [], isLoading: isLoadingPendingRequests } =
    api.attendance.getAttendanceRequests.useQuery(
      {
        user_id: currentUserId,
        status: 'pending',
        limit: 20,
      },
      {
        enabled: Boolean(currentUserId),
      }
    );

  const { data: recentRequests = [], isLoading: isLoadingRecentRequests } =
    api.attendance.getAttendanceRequests.useQuery(
      {
        user_id: currentUserId,
        limit: 20,
      },
      {
        enabled: Boolean(currentUserId),
      }
    );

  const createRequestMutation =
    api.attendance.createAttendanceRequest.useMutation({
      onSuccess: () => {
        // no refetch required here since lists already update via react-query cache
      },
    });

  const todaySchedule = {
    shift: '日勤',
    startTime: '09:00',
    endTime: '18:00',
    breakTime: '12:00-13:00',
  };

  // recentAttendanceは既にAPIから取得しているため、ダミーデータを削除

  // pendingRequestsは既にAPIから取得しているため、ダミーデータを削除

  const handleClockCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      console.error('ユーザーがログインしていません');
      return;
    }
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
    if (!currentUserId) {
      console.error('ユーザーがログインしていません');
      return;
    }
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
    if (!currentUserId) {
      console.error('ユーザーがログインしていません');
      return;
    }
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
      case 'rejected':
        return (
          <Badge className='bg-red-100 text-red-800'>
            <Clock className='h-3 w-3 mr-1' />
            否認
          </Badge>
        );
      case 'correction_requested':
        return (
          <Badge className='bg-blue-100 text-blue-800'>
            <Clock className='h-3 w-3 mr-1' />
            修正依頼
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTimeDisplay = (time?: string | null) => {
    if (!time) return '未打刻';
    return time.slice(0, 5);
  };

  const recentSummaries = useMemo(() => {
    return recentRecords.map(record => {
      const workedMinutes =
        record.actual_start_time && record.actual_end_time
          ? Math.max(
              Math.round(
                parseInt(record.actual_end_time.slice(0, 2)) * 60 +
                  parseInt(record.actual_end_time.slice(3, 5)) -
                  (parseInt(record.actual_start_time.slice(0, 2)) * 60 +
                    parseInt(record.actual_start_time.slice(3, 5))) -
                  (record.break_duration ?? 0)
              ),
              0
            )
          : null;

      return {
        ...record,
        workedMinutes,
      };
    });
  }, [recentRecords]);

  return (
    <UserShell
      title='勤怠管理'
      description='打刻申請と最近の勤怠を確認できます'
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Plus className='h-5 w-5 mr-2' />
                申請・訂正
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Card className='border border-dashed'>
                  <CardHeader>
                    <CardTitle className='text-base'>今日の予定</CardTitle>
                  </CardHeader>
                  <CardContent className='grid gap-1 text-sm text-muted-foreground'>
                    <span>
                      <strong>シフト:</strong> {todaySchedule.shift}
                    </span>
                    <span>
                      <strong>勤務時間:</strong> {todaySchedule.startTime} -{' '}
                      {todaySchedule.endTime}
                    </span>
                    <span>
                      <strong>休憩:</strong> {todaySchedule.breakTime}
                    </span>
                  </CardContent>
                </Card>

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

                <Dialog open={isOvertimeOpen} onOpenChange={setIsOvertimeOpen}>
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
                    <form onSubmit={handleOvertimeSubmit} className='space-y-4'>
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
                          <Label htmlFor='overtimeEndTime'>残業終了時刻</Label>
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

              {/* {pendingRequests.length > 0 && (
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
              )} */}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                最近の申請履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecentRequests ? (
                <p className='text-sm text-muted-foreground'>
                  読み込み中です...
                </p>
              ) : recentRequests.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  申請履歴はまだありません
                </p>
              ) : (
                <div className='space-y-3'>
                  {recentRequests.map(request => (
                    <div
                      key={request.id}
                      className='rounded border border-border p-3 text-sm'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <span className='font-medium text-foreground'>
                          {request.target_date}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className='text-muted-foreground capitalize'>
                        種類: {request.type.replace(/_/g, ' ')}
                      </p>
                      <p className='text-muted-foreground mt-1'>
                        理由: {request.reason}
                      </p>
                      <p className='text-xs text-muted-foreground mt-2'>
                        提出:{' '}
                        {new Date(request.created_at).toLocaleString('ja-JP')}
                      </p>
                      {request.review_notes ? (
                        <p className='text-xs text-muted-foreground'>
                          コメント: {request.review_notes}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserShell>
  );
}
