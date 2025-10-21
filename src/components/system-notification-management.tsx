'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';
import {
  BarChart3,
  Bell,
  Edit,
  Eye,
  Mail,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

export function SystemNotificationManagement() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [selectedNotification, setSelectedNotification] = useState<
    string | null
  >(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const { toast } = useToast();

  // 通知一覧
  const { data: notifications, refetch: refetchNotifications } =
    trpc.notification.notifications.list.useQuery({
      page: 1,
      limit: 50,
    });

  // テンプレート一覧
  const { data: templates, refetch: refetchTemplates } =
    trpc.notification.templates.list.useQuery({
      page: 1,
      limit: 50,
    });

  // 通知統計
  const { data: stats } = trpc.notification.stats.summary.useQuery();

  // 通知作成
  const createNotification = trpc.notification.notifications.create.useMutation(
    {
      onSuccess: () => {
        toast({ title: '通知を作成しました' });
        refetchNotifications();
        setIsCreateDialogOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: 'エラー',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // 通知送信
  const sendNotification = trpc.notification.notifications.send.useMutation({
    onSuccess: () => {
      toast({ title: '通知を送信しました' });
      refetchNotifications();
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // テンプレート作成
  const createTemplate = trpc.notification.templates.create.useMutation({
    onSuccess: () => {
      toast({ title: 'テンプレートを作成しました' });
      refetchTemplates();
      setIsTemplateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateNotification = (formData: FormData) => {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const type = formData.get('type') as
      | 'system'
      | 'user'
      | 'facility'
      | 'role';
    const priority = formData.get('priority') as
      | 'low'
      | 'normal'
      | 'high'
      | 'urgent';
    const templateId = formData.get('templateId') as string;

    createNotification.mutate({
      title,
      content,
      type,
      priority,
      templateId: templateId || undefined,
    });
  };

  const handleSendNotification = (notificationId: string) => {
    sendNotification.mutate({
      notificationId,
      immediate: true,
    });
  };

  const handleCreateTemplate = (formData: FormData) => {
    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const type = formData.get('type') as 'email' | 'system' | 'sms';

    createTemplate.mutate({
      name,
      subject,
      body,
      type,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: '下書き' },
      scheduled: { variant: 'outline' as const, label: '予約済み' },
      sending: { variant: 'default' as const, label: '送信中' },
      sent: { variant: 'default' as const, label: '送信済み' },
      failed: { variant: 'destructive' as const, label: '失敗' },
      cancelled: { variant: 'secondary' as const, label: 'キャンセル' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, label: '低' },
      normal: { variant: 'default' as const, label: '通常' },
      high: { variant: 'destructive' as const, label: '高' },
      urgent: { variant: 'destructive' as const, label: '緊急' },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>通知管理</h1>
          <p className='text-muted-foreground'>
            システム全体の通知を管理します
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            通知作成
          </Button>
          <Button
            variant='outline'
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <Settings className='h-4 w-4 mr-2' />
            テンプレート管理
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>総通知数</CardTitle>
              <Bell className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.totalNotifications}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>送信済み</CardTitle>
              <Send className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.sentNotifications}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                テンプレート数
              </CardTitle>
              <Settings className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalTemplates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>アクティブ</CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.activeTemplates}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='notifications'>通知一覧</TabsTrigger>
          <TabsTrigger value='templates'>テンプレート</TabsTrigger>
          <TabsTrigger value='settings'>設定</TabsTrigger>
        </TabsList>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>通知一覧</CardTitle>
              <CardDescription>システム全体の通知を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>優先度</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>作成日時</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications?.notifications.map((notification: any) => (
                    <TableRow key={notification.id}>
                      <TableCell className='font-medium'>
                        {notification.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {notification.type === 'system' && 'システム'}
                          {notification.type === 'user' && 'ユーザー'}
                          {notification.type === 'facility' && '施設'}
                          {notification.type === 'role' && 'ロール'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(notification.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(notification.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(notification.createdAt).toLocaleString(
                          'ja-JP'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              setSelectedNotification(notification.id)
                            }
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          {notification.status === 'draft' && (
                            <Button
                              size='sm'
                              onClick={() =>
                                handleSendNotification(notification.id)
                              }
                            >
                              <Send className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='templates' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>通知テンプレート</CardTitle>
              <CardDescription>
                再利用可能な通知テンプレートを管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>作成日時</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.templates.map((template: any) => (
                    <TableRow key={template.id}>
                      <TableCell className='font-medium'>
                        {template.name}
                      </TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {template.type === 'email' && (
                            <Mail className='h-3 w-3 mr-1' />
                          )}
                          {template.type === 'system' && (
                            <Bell className='h-3 w-3 mr-1' />
                          )}
                          {template.type === 'sms' && (
                            <MessageSquare className='h-3 w-3 mr-1' />
                          )}
                          {template.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={template.isActive ? 'default' : 'secondary'}
                        >
                          {template.isActive ? 'アクティブ' : '非アクティブ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(template.createdAt).toLocaleString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button size='sm' variant='outline'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button size='sm' variant='outline'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>通知システムの設定を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  通知設定の詳細な管理機能は今後実装予定です。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 通知作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>通知作成</DialogTitle>
            <DialogDescription>新しい通知を作成します</DialogDescription>
          </DialogHeader>
          <form action={handleCreateNotification} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>タイトル</Label>
                <Input id='title' name='title' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='type'>タイプ</Label>
                <Select name='type' required>
                  <SelectTrigger>
                    <SelectValue placeholder='タイプを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='system'>システム全体</SelectItem>
                    <SelectItem value='user'>特定ユーザー</SelectItem>
                    <SelectItem value='facility'>施設別</SelectItem>
                    <SelectItem value='role'>ロール別</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='priority'>優先度</Label>
                <Select name='priority' required>
                  <SelectTrigger>
                    <SelectValue placeholder='優先度を選択' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>低</SelectItem>
                    <SelectItem value='normal'>通常</SelectItem>
                    <SelectItem value='high'>高</SelectItem>
                    <SelectItem value='urgent'>緊急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='templateId'>テンプレート</Label>
                <Select name='templateId'>
                  <SelectTrigger>
                    <SelectValue placeholder='テンプレートを選択（任意）' />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.templates.map((template: any) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='content'>内容</Label>
              <Textarea id='content' name='content' rows={6} required />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsCreateDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type='submit' disabled={createNotification.isPending}>
                {createNotification.isPending ? '作成中...' : '作成'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* テンプレート作成ダイアログ */}
      <Dialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>テンプレート作成</DialogTitle>
            <DialogDescription>
              新しい通知テンプレートを作成します
            </DialogDescription>
          </DialogHeader>
          <form action={handleCreateTemplate} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='template-name'>名前</Label>
                <Input id='template-name' name='name' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='template-type'>タイプ</Label>
                <Select name='type' required>
                  <SelectTrigger>
                    <SelectValue placeholder='タイプを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='email'>メール</SelectItem>
                    <SelectItem value='system'>システム内</SelectItem>
                    <SelectItem value='sms'>SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='template-subject'>件名</Label>
              <Input id='template-subject' name='subject' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='template-body'>本文</Label>
              <Textarea id='template-body' name='body' rows={6} required />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsTemplateDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type='submit' disabled={createTemplate.isPending}>
                {createTemplate.isPending ? '作成中...' : '作成'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
