'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { Eye, History } from 'lucide-react';
import { useState } from 'react';

export function SystemChangeHistory() {
  const [selectedChange, setSelectedChange] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const { data: changeHistory, refetch } =
    trpc.systemSettings.getSettingChangeHistory.useQuery({
      limit: 50,
      offset: 0,
    });

  const handleViewDetails = (change: any) => {
    setSelectedChange(change);
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant='default' className='bg-green-500'>
            承認済み
          </Badge>
        );
      case 'rejected':
        return <Badge variant='destructive'>却下</Badge>;
      case 'pending':
        return <Badge variant='secondary'>承認待ち</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getSettingTypeLabel = (type: string) => {
    switch (type) {
      case 'system':
        return 'システム設定';
      case 'notification':
        return '通知設定';
      case 'security':
        return 'セキュリティ設定';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            設定変更履歴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>変更日時</TableHead>
                <TableHead>設定タイプ</TableHead>
                <TableHead>設定キー</TableHead>
                <TableHead>変更者</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changeHistory?.map((change: any) => (
                <TableRow key={change.id}>
                  <TableCell>{formatDate(change.created_at)}</TableCell>
                  <TableCell>
                    {getSettingTypeLabel(change.setting_type)}
                  </TableCell>
                  <TableCell className='font-mono text-sm'>
                    {change.setting_key}
                  </TableCell>
                  <TableCell>
                    {change.changed_by_user?.name || '不明'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(change.approval_status)}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleViewDetails(change)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 変更詳細ダイアログ */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>設定変更詳細</DialogTitle>
          </DialogHeader>
          {selectedChange && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>設定タイプ</label>
                  <p className='text-sm text-muted-foreground'>
                    {getSettingTypeLabel(selectedChange.setting_type)}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>設定キー</label>
                  <p className='text-sm text-muted-foreground font-mono'>
                    {selectedChange.setting_key}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>変更者</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedChange.changed_by_user?.name || '不明'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>変更日時</label>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(selectedChange.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium'>変更理由</label>
                <p className='text-sm text-muted-foreground'>
                  {selectedChange.change_reason || 'なし'}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>変更前の値</label>
                  <div className='p-3 bg-muted rounded-md'>
                    <code className='text-sm'>
                      {selectedChange.old_value || 'なし'}
                    </code>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium'>変更後の値</label>
                  <div className='p-3 bg-muted rounded-md'>
                    <code className='text-sm'>
                      {selectedChange.new_value || 'なし'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
