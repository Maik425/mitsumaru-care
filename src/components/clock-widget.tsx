'use client';

import { useAuthContext } from '@/contexts/auth-context';
import { api } from '@/lib/trpc';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ClockWidget() {
  const [currentTime, setCurrentTime] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workingTime, setWorkingTime] = useState('');

  const { user } = useAuthContext();
  const currentUserId = user?.id;

  // API呼び出し（ユーザーがログインしている場合のみ）
  const { data: todayRecord, refetch: refetchTodayRecord } =
    api.attendance.getAttendanceRecords.useQuery(
      {
        user_id: currentUserId!,
        date: new Date().toISOString().split('T')[0],
        limit: 1,
      },
      {
        enabled: !!currentUserId, // ユーザーIDがある場合のみクエリを実行
      }
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
    startTime: '09:00',
    endTime: '18:00',
    breakTime: '12:00-13:00',
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

  const handleClockIn = async () => {
    if (!currentUserId) {
      console.error('ユーザーがログインしていません');
      return;
    }

    try {
      setIsLoading(true);
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

      // 最新の勤怠記録を取得
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
          <CardTitle className='flex items-center'>
            <Clock className='h-5 w-5 mr-2' />
            打刻
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
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Clock className='h-5 w-5 mr-2' />
          打刻
        </CardTitle>
      </CardHeader>
      <CardContent className='text-center'>
        <div className='mb-6'>
          <p className='text-3xl font-bold text-gray-900 mb-2'>
            {currentTime || '--:--:--'}
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
              disabled={isLoading}
              className='w-full h-12 text-lg bg-green-600 hover:bg-green-700 disabled:opacity-50'
            >
              {isLoading ? '打刻中...' : '出勤打刻'}
            </Button>
          ) : (
            <Button
              onClick={handleClockOut}
              disabled={isLoading}
              className='w-full h-12 text-lg bg-red-600 hover:bg-red-700 disabled:opacity-50'
            >
              {isLoading ? '打刻中...' : '退勤打刻'}
            </Button>
          )}
        </div>

        {todayRecord && todayRecord.length > 0 && (
          <div
            className={`mt-4 p-4 border rounded-lg ${
              isWorking
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between mb-2'>
              <p
                className={`font-semibold text-lg ${
                  isWorking ? 'text-green-800' : 'text-gray-800'
                }`}
              >
                {isWorking ? '勤務中' : '勤務終了'}
              </p>
              {isWorking && (
                <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
              )}
            </div>
            <div className='space-y-1'>
              <p
                className={`text-sm ${
                  isWorking ? 'text-green-700' : 'text-gray-700'
                }`}
              >
                <span className='font-medium'>出勤時刻:</span>{' '}
                {todayRecord[0].actual_start_time || '--:--'}
              </p>
              {todayRecord[0].actual_end_time && (
                <p
                  className={`text-sm ${
                    isWorking ? 'text-green-700' : 'text-gray-700'
                  }`}
                >
                  <span className='font-medium'>退勤時刻:</span>{' '}
                  {todayRecord[0].actual_end_time}
                </p>
              )}
              {isWorking && todayRecord[0].actual_start_time && (
                <p className='text-sm text-green-700'>
                  <span className='font-medium'>勤務時間:</span> {workingTime}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
