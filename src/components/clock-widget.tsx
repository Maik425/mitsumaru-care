'use client';

import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/auth-context';
import { api } from '@/lib/trpc';
import { Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ClockWidget() {
  const [currentTime, setCurrentTime] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workingTime, setWorkingTime] = useState('');

  const { user } = useAuthContext();
  const currentUserId = user?.id;

  const todayKey = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // API呼び出し（ユーザーがログインしている場合のみ）
  const {
    data: todayRecord = [],
    refetch: refetchTodayRecord,
    isLoading: isLoadingTodayRecord,
  } = api.attendance.getAttendanceRecords.useQuery(
    {
      user_id: currentUserId ?? undefined,
      date: todayKey,
      limit: 1,
    },
    {
      enabled: !!currentUserId, // ユーザーIDがある場合のみクエリを実行
    }
  );

  const currentRecord = useMemo(
    () => todayRecord.find(record => record.date === todayKey),
    [todayRecord, todayKey]
  );

  const createRecordMutation =
    api.attendance.createAttendanceRecord.useMutation({
      onSuccess: () => {
        // 出勤打刻成功後にデータを再取得
        refetchTodayRecord();
      },
    });
  const updateRecordMutation =
    api.attendance.updateAttendanceRecord.useMutation({
      onSuccess: () => {
        // 退勤打刻成功後にデータを再取得
        refetchTodayRecord();
      },
    });

  // 現在時刻を更新
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ja-JP', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 今日の勤怠記録の状態を確認
  useEffect(() => {
    if (todayRecord && todayRecord.length > 0) {
      const record = todayRecord[0];
      setIsWorking(!!record.actual_start_time && !record.actual_end_time);
    }
  }, [todayRecord]);

  // 勤務時間をリアルタイムで更新
  useEffect(() => {
    if (
      isWorking &&
      todayRecord &&
      todayRecord.length > 0 &&
      todayRecord[0].actual_start_time
    ) {
      const updateWorkingTime = () => {
        setWorkingTime(calculateWorkingTime(todayRecord[0].actual_start_time!));
      };

      updateWorkingTime(); // 即座に更新
      const interval = setInterval(updateWorkingTime, 60000); // 1分ごとに更新

      return () => clearInterval(interval);
    }
  }, [isWorking, todayRecord]);

  const todaySchedule = {
    shift: '日勤',
    startTime: currentRecord?.scheduled_start_time?.slice(0, 5) ?? '09:00',
    endTime: currentRecord?.scheduled_end_time?.slice(0, 5) ?? '18:00',
    breakTime:
      currentRecord?.break_duration != null
        ? `${currentRecord.break_duration}分`
        : '12:00-13:00',
  };

  // 勤務時間を計算する関数
  const calculateWorkingTime = (startTime: string) => {
    if (!startTime) return '--:--';

    const now = new Date();
    const start = new Date();
    const [hours, minutes, seconds] = startTime.split(':').map(Number);
    start.setHours(hours, minutes, seconds || 0, 0);

    const diffMs = now.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}時間${diffMinutes}分`;
  };

  const formatTime = (value?: string | null) => {
    if (!value) return '--:--';
    return value.slice(0, 5);
  };

  const status = useMemo(() => {
    if (isWorking) {
      return { label: '勤務中', variant: 'bg-green-100 text-green-700' };
    }
    if (currentRecord?.actual_end_time) {
      return { label: '勤務終了', variant: 'bg-slate-100 text-slate-700' };
    }
    return { label: '未勤務', variant: 'bg-amber-100 text-amber-700' };
  }, [isWorking, currentRecord?.actual_end_time]);

  const workedTotal = useMemo(() => {
    if (!currentRecord?.actual_start_time || !currentRecord.actual_end_time)
      return null;
    const startMinutes =
      parseInt(currentRecord.actual_start_time.slice(0, 2)) * 60 +
      parseInt(currentRecord.actual_start_time.slice(3, 5));
    const endMinutes =
      parseInt(currentRecord.actual_end_time.slice(0, 2)) * 60 +
      parseInt(currentRecord.actual_end_time.slice(3, 5));
    const diff = Math.max(
      endMinutes - startMinutes - (currentRecord.break_duration ?? 0),
      0
    );
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}時間${minutes}分`;
  }, [
    currentRecord?.actual_start_time,
    currentRecord?.actual_end_time,
    currentRecord?.break_duration,
  ]);

  const todayDisplay = useMemo(
    () =>
      new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
    []
  );

  const handleClockIn = async () => {
    if (!currentUserId) {
      console.error('ユーザーがログインしていません');
      return;
    }

    try {
      setIsLoading(true);
      const currentTime = new Date().toTimeString().slice(0, 8);

      if (currentRecord) {
        // 既存の記録を更新
        await updateRecordMutation.mutateAsync({
          id: currentRecord.id,
          actual_start_time: currentTime,
        });
      } else {
        // 新しい記録を作成
        await createRecordMutation.mutateAsync({
          user_id: currentUserId,
          date: todayKey,
          actual_start_time: currentTime,
        });
      }
      setIsWorking(true);
    } catch (error) {
      console.error('出勤打刻に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentUserId) {
      console.error('ユーザーがログインしていません');
      return;
    }

    try {
      setIsLoading(true);

      const { data: latestRecord } = await refetchTodayRecord();

      if (latestRecord && latestRecord.length > 0) {
        const currentTime = new Date().toTimeString().slice(0, 8);
        await updateRecordMutation.mutateAsync({
          id: latestRecord[0].id,
          actual_end_time: currentTime,
        });
        setIsWorking(false);
      } else {
        console.error('今日の勤怠記録が見つかりません');
      }
    } catch (error) {
      console.error('退勤打刻に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザーがログインしていない場合は何も表示しない
  if (!currentUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span className='flex items-center'>
              <Clock className='h-5 w-5 mr-2' />
              打刻
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-gray-600'>ログインしてください</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='space-y-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
            <Clock className='h-5 w-5' />
            本日の勤怠
          </CardTitle>
          {isLoadingTodayRecord ? (
            <Badge className='bg-muted text-muted-foreground'>読み込み中</Badge>
          ) : (
            <Badge className={status.variant}>{status.label}</Badge>
          )}
        </div>
        <p className='text-sm text-muted-foreground'>{todayDisplay}</p>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
          <div>
            <p className='text-4xl font-bold tracking-tight text-gray-900'>
              {currentTime || '--:--:--'}
            </p>
            <p className='text-sm text-muted-foreground mt-1'>現在時刻</p>
          </div>
          <div className='text-right text-xs text-muted-foreground space-y-1'>
            <p>予定シフト: {todaySchedule.shift}</p>
            <p>
              {todaySchedule.startTime} - {todaySchedule.endTime} / 休憩{' '}
              {todaySchedule.breakTime}
            </p>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='rounded-lg border border Border bg-muted/30 p-4'>
            <h3 className='text-sm font-medium text-muted-foreground mb-2'>
              実績
            </h3>
            <dl className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>出勤</dt>
                <dd>{formatTime(currentRecord?.actual_start_time)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>退勤</dt>
                <dd>{formatTime(currentRecord?.actual_end_time)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>休憩</dt>
                <dd>
                  {currentRecord?.break_duration != null
                    ? `${currentRecord.break_duration}分`
                    : '---'}
                </dd>
              </div>
              <div className='flex justify-between font-medium text-foreground pt-1 border-t mt-2'>
                <dt>勤務時間</dt>
                <dd>
                  {isWorking
                    ? workingTime
                    : (workedTotal ??
                      (currentRecord?.actual_start_time ? '算出中' : '---'))}
                </dd>
              </div>
            </dl>
          </div>

          <div className='rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm space-y-3'>
            <p className='text-muted-foreground'>
              今日の勤怠ステータスを確認して、打刻操作を行ってください。
            </p>
            <div className='space-y-2'>
              {!isWorking ? (
                <Button
                  onClick={handleClockIn}
                  disabled={isLoading}
                  className='w-full h-11 text-base'
                >
                  {isLoading ? '打刻中...' : '出勤打刻'}
                </Button>
              ) : (
                <Button
                  onClick={handleClockOut}
                  disabled={isLoading}
                  className='w-full h-11 text-base'
                  variant='destructive'
                >
                  {isLoading ? '打刻中...' : '退勤打刻'}
                </Button>
              )}
              <p className='text-xs text-muted-foreground text-center'>
                打刻後は自動で最新情報を反映します。
              </p>
            </div>
          </div>
        </div>

        {/* {currentRecord && (
          <div className='rounded-lg border bg-muted/20 p-4 text-sm space-y-2'>
            <div className='flex flex-wrap items-center gap-2 justify-between'>
              <span className='font-medium text-muted-foreground'>
                本日の記録
              </span>
              <Badge variant='outline' className={status.variant}>
                {status.label}
              </Badge>
              {currentRecord?.date && (
                <span className='text-xs text-muted-foreground'>
                  記録日: {currentRecord.date}
                </span>
              )}
            </div>
            <div className='grid gap-1 sm:grid-cols-2'>
              <span>
                出勤 {formatTime(currentRecord.actual_start_time)} / 退勤{' '}
                {formatTime(currentRecord.actual_end_time)}
              </span>
              <span>
                休憩{' '}
                {currentRecord?.break_duration != null
                  ? `${currentRecord.break_duration}分`
                  : '---'}
                ・勤務 {isWorking ? workingTime : (workedTotal ?? '---')}
              </span>
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
