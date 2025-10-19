'use client';

import { useMemo } from 'react';

import { ClockWidget } from './clock-widget';

import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/auth-context';
import type { AttendanceRecord } from '@/lib/dto/attendance.dto';
import { api } from '@/lib/trpc';

export function UserDashboard() {
  const { user } = useAuthContext();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthLabel = `${currentYear}年${String(currentMonth + 1).padStart(2, '0')}月`;
  const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseTimeToMinutes = (time: string) => {
    const [hours, minutes, seconds = '0'] = time.split(':');
    const totalMinutes =
      Number(hours) * 60 + Number(minutes) + Number(seconds) / 60;
    return totalMinutes;
  };

  const calculateWorkedMinutes = (record: AttendanceRecord) => {
    if (!record.actual_start_time || !record.actual_end_time) return null;
    const duration =
      parseTimeToMinutes(record.actual_end_time) -
      parseTimeToMinutes(record.actual_start_time) -
      (record.break_duration ?? 0);
    if (Number.isNaN(duration)) return null;
    return Math.max(Math.round(duration), 0);
  };

  const formatTimeDisplay = (time?: string | null) => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };

  const formatDurationDisplay = (minutes?: number | null) => {
    if (minutes == null) return '-';
    const rounded = Math.max(Math.round(minutes), 0);
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    if (hours === 0 && mins === 0) return '0分';
    if (hours === 0) return `${mins}分`;
    if (mins === 0) return `${hours}時間`;
    return `${hours}時間${mins}分`;
  };

  const monthStart = formatDateKey(new Date(currentYear, currentMonth, 1));
  const monthEnd = formatDateKey(new Date(currentYear, currentMonth + 1, 0));

  const { data: monthlyRecords = [], isLoading: isLoadingMonthlyRecords } =
    api.attendance.getAttendanceRecords.useQuery(
      {
        user_id: user?.id,
        start_date: monthStart,
        end_date: monthEnd,
        limit: 100,
        offset: 0,
      },
      {
        enabled: Boolean(user?.id),
      }
    );

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, index) => index + 1);
  }, [currentYear, currentMonth]);

  const recordByDate = useMemo(() => {
    return monthlyRecords.reduce<Record<string, AttendanceRecord>>(
      (acc, record) => {
        acc[record.date] = record;
        return acc;
      },
      {}
    );
  }, [monthlyRecords]);

  const dailyRows = useMemo(() => {
    return daysInMonth.map(day => {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = formatDateKey(date);
      const weekdayLabel = weekdayLabels[date.getDay()];
      const record = recordByDate[dateKey];

      const breakMinutes =
        typeof record?.break_duration === 'number'
          ? (record?.break_duration ?? 0)
          : null;
      const workedMinutes = record ? calculateWorkedMinutes(record) : null;

      return {
        key: dateKey,
        label: `${day}日(${weekdayLabel})`,
        actualStart: record?.actual_start_time ?? null,
        actualEnd: record?.actual_end_time ?? null,
        breakMinutes,
        workedMinutes,
      };
    });
  }, [
    calculateWorkedMinutes,
    currentMonth,
    currentYear,
    daysInMonth,
    recordByDate,
    weekdayLabels,
  ]);

  const totalWorkedMinutes = useMemo(
    () => dailyRows.reduce((sum, row) => sum + (row.workedMinutes ?? 0), 0),
    [dailyRows]
  );

  const totalBreakMinutes = useMemo(
    () => dailyRows.reduce((sum, row) => sum + (row.breakMinutes ?? 0), 0),
    [dailyRows]
  );

  return (
    <RoleBasedLayout
      title='ダッシュボード'
      description='日々の勤怠状況を確認できます'
    >
      <div className='flex flex-col gap-6'>
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            一般職ダッシュボード
          </h2>
          <p className='text-gray-600'>
            お疲れ様です！今日も一日頑張りましょう
          </p>
        </div>

        <div className='mb-6'>
          <ClockWidget />
        </div>

        {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Clock className='h-5 w-5 mr-2' />
                  勤怠管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-4'>
                  打刻申請・追加訂正申請ができます
                </p>
                <Link href='/user/attendance'>
                  <Button className='w-full'>勤怠ページへ</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Calendar className='h-5 w-5 mr-2' />
                  希望休管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-4'>
                  希望休の入力・確認ができます
                </p>
                <Link href='/user/holidays'>
                  <Button className='w-full'>希望休入力ページへ</Button>
                </Link>
              </CardContent>
            </Card>
          </div> */}

        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>今月のシフト</CardTitle>
            <p className='text-sm text-muted-foreground'>
              {monthLabel}の勤怠状況
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingMonthlyRecords ? (
              <p className='text-sm text-muted-foreground'>読み込み中です...</p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full border border-border text-sm'>
                  <thead className='bg-muted/30'>
                    <tr>
                      <th className='border border-border px-3 py-2 text-left font-medium'>
                        日付
                      </th>
                      <th className='border border-border px-3 py-2 text-left font-medium'>
                        出勤
                      </th>
                      <th className='border border-border px-3 py-2 text-left font-medium'>
                        退勤
                      </th>
                      <th className='border border-border px-3 py-2 text-right font-medium'>
                        休憩
                      </th>
                      <th className='border border-border px-3 py-2 text-right font-medium'>
                        勤務時間
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRows.map(row => (
                      <tr key={row.key}>
                        <td className='border border-border px-3 py-2'>
                          {row.label}
                        </td>
                        <td className='border border-border px-3 py-2'>
                          {formatTimeDisplay(row.actualStart)}
                        </td>
                        <td className='border border-border px-3 py-2'>
                          {formatTimeDisplay(row.actualEnd)}
                        </td>
                        <td className='border border-border px-3 py-2 text-right'>
                          {row.breakMinutes == null
                            ? '-'
                            : formatDurationDisplay(row.breakMinutes)}
                        </td>
                        <td className='border border-border px-3 py-2 text-right'>
                          {formatDurationDisplay(row.workedMinutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className='bg-muted/20 font-medium'>
                      <td className='border border-border px-3 py-2'>合計</td>
                      <td className='border border-border px-3 py-2'>-</td>
                      <td className='border border-border px-3 py-2'>-</td>
                      <td className='border border-border px-3 py-2 text-right'>
                        {formatDurationDisplay(totalBreakMinutes)}
                      </td>
                      <td className='border border-border px-3 py-2 text-right'>
                        {formatDurationDisplay(totalWorkedMinutes)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
