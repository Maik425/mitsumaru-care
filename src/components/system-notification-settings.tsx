'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Bell, Edit, Mail, MessageSquare, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function SystemNotificationSettings() {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isEmailTestDialogOpen, setIsEmailTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('テストユーザー');

  const { data: notificationSettings, refetch: refetchSettings } =
    trpc.systemSettings.getNotificationSettings.useQuery();
  const { data: notificationTemplates, refetch: refetchTemplates } =
    trpc.systemSettings.getNotificationTemplates.useQuery();

  const updateNotificationSettingMutation =
    trpc.systemSettings.updateNotificationSetting.useMutation();
  const createNotificationTemplateMutation =
    trpc.systemSettings.createNotificationTemplate.useMutation();
  const updateNotificationTemplateMutation =
    trpc.systemSettings.updateNotificationTemplate.useMutation();
  const deleteNotificationTemplateMutation =
    trpc.systemSettings.deleteNotificationTemplate.useMutation();
  const testEmailConnectionQuery =
    trpc.systemSettings.testEmailConnection.useQuery(undefined, {
      enabled: false, // 手動で実行するため
    });
  const sendTestEmailMutation = trpc.systemSettings.sendTestEmail.useMutation();

  const handleNotificationSettingToggle = async (
    id: string,
    enabled: boolean
  ) => {
    try {
      await updateNotificationSettingMutation.mutateAsync({
        id,
        data: { is_enabled: enabled, template_id: null, schedule_config: null },
      });
      toast.success('通知設定を更新しました');
      refetchSettings();
    } catch (error) {
      toast.error('通知設定の更新に失敗しました');
      console.error('Error updating notification setting:', error);
    }
  };

  const handleTemplateSubmit = async (data: any) => {
    try {
      if (editingTemplate) {
        await updateNotificationTemplateMutation.mutateAsync({
          id: editingTemplate.id,
          data,
        });
        toast.success('テンプレートを更新しました');
      } else {
        await createNotificationTemplateMutation.mutateAsync(data);
        toast.success('テンプレートを作成しました');
      }
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      refetchTemplates();
    } catch (error) {
      toast.error('テンプレートの保存に失敗しました');
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return;

    try {
      await deleteNotificationTemplateMutation.mutateAsync({ id });
      toast.success('テンプレートを削除しました');
      refetchTemplates();
    } catch (error) {
      toast.error('テンプレートの削除に失敗しました');
      console.error('Error deleting template:', error);
    }
  };

  const getDeliveryMethodIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'sms':
        return <MessageSquare className='h-4 w-4' />;
      default:
        return <Bell className='h-4 w-4' />;
    }
  };

  const handleEmailConnectionTest = async () => {
    try {
      const result = await testEmailConnectionQuery.refetch();
      if (result.data?.success) {
        toast.success(result.data.message);
      } else {
        toast.error(result.data?.message || 'SMTP接続テストに失敗しました');
      }
    } catch (error) {
      toast.error('SMTP接続テストに失敗しました');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('テストメールアドレスを入力してください');
      return;
    }

    try {
      const result = await sendTestEmailMutation.mutateAsync({
        recipientEmail: testEmail,
        recipientName: testName,
      });

      if (result.success) {
        const messageId = 'messageId' in result ? result.messageId : undefined;
        toast.success(
          `テストメールが送信されました${messageId ? ` (Message ID: ${messageId})` : ''}`
        );
        setIsEmailTestDialogOpen(false);
        setTestEmail('');
        setTestName('テストユーザー');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('テストメールの送信に失敗しました');
    }
  };

  return (
    <div className='space-y-6'>
      {/* 通知設定一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            通知設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {notificationSettings?.map((setting: any) => (
              <div
                key={setting.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  {getDeliveryMethodIcon(setting.delivery_method)}
                  <div>
                    <h4 className='font-medium'>{setting.notification_type}</h4>
                    <p className='text-sm text-muted-foreground'>
                      {setting.delivery_method}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={setting.is_enabled ? 'default' : 'secondary'}>
                    {setting.is_enabled ? '有効' : '無効'}
                  </Badge>
                  <Switch
                    checked={setting.is_enabled}
                    onCheckedChange={enabled =>
                      handleNotificationSettingToggle(setting.id, enabled)
                    }
                    disabled={updateNotificationSettingMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* メール送信テスト */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            メール送信テスト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Button
                onClick={handleEmailConnectionTest}
                disabled={testEmailConnectionQuery.isFetching}
                variant='outline'
              >
                {testEmailConnectionQuery.isFetching
                  ? 'テスト中...'
                  : 'SMTP接続テスト'}
              </Button>
              <Dialog
                open={isEmailTestDialogOpen}
                onOpenChange={setIsEmailTestDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button disabled={sendTestEmailMutation.isPending}>
                    {sendTestEmailMutation.isPending
                      ? '送信中...'
                      : 'テストメール送信'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>テストメール送信</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='test-email'>受信者メールアドレス</Label>
                      <Input
                        id='test-email'
                        type='email'
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                        placeholder='test@example.com'
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor='test-name'>受信者名</Label>
                      <Input
                        id='test-name'
                        value={testName}
                        onChange={e => setTestName(e.target.value)}
                        placeholder='テストユーザー'
                      />
                    </div>
                    <div className='flex justify-end gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsEmailTestDialogOpen(false)}
                      >
                        キャンセル
                      </Button>
                      <Button
                        onClick={handleSendTestEmail}
                        disabled={sendTestEmailMutation.isPending}
                      >
                        {sendTestEmailMutation.isPending ? '送信中...' : '送信'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className='text-sm text-muted-foreground'>
              SMTP接続テストでGmail認証を確認し、テストメール送信で実際の通知機能をテストできます。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 通知テンプレート管理 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              通知テンプレート
            </span>
            <Dialog
              open={isTemplateDialogOpen}
              onOpenChange={setIsTemplateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingTemplate(null)}
                  className='flex items-center gap-2'
                >
                  <Plus className='h-4 w-4' />
                  テンプレート追加
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'テンプレート編集' : 'テンプレート作成'}
                  </DialogTitle>
                </DialogHeader>
                <NotificationTemplateForm
                  template={editingTemplate}
                  onSubmit={handleTemplateSubmit}
                  onCancel={() => {
                    setIsTemplateDialogOpen(false);
                    setEditingTemplate(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {notificationTemplates?.map((template: any) => (
              <div
                key={template.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div>
                  <h4 className='font-medium'>{template.name}</h4>
                  <p className='text-sm text-muted-foreground'>
                    {template.template_type}
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {template.subject}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? '有効' : '無効'}
                  </Badge>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setEditingTemplate(template);
                      setIsTemplateDialogOpen(true);
                    }}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 通知テンプレートフォーム
function NotificationTemplateForm({
  template,
  onSubmit,
  onCancel,
}: {
  template?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
    template_type: template?.template_type || '',
    is_active: template?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>テンプレート名</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor='template_type'>テンプレートタイプ</Label>
        <Select
          value={formData.template_type}
          onValueChange={value =>
            setFormData({ ...formData, template_type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='テンプレートタイプを選択' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='email'>メール</SelectItem>
            <SelectItem value='sms'>SMS</SelectItem>
            <SelectItem value='push'>プッシュ通知</SelectItem>
            <SelectItem value='in_app'>アプリ内通知</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor='subject'>件名</Label>
        <Input
          id='subject'
          value={formData.subject}
          onChange={e => setFormData({ ...formData, subject: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor='body'>本文</Label>
        <Textarea
          id='body'
          value={formData.body}
          onChange={e => setFormData({ ...formData, body: e.target.value })}
          rows={6}
          required
        />
      </div>
      <div className='flex items-center space-x-2'>
        <Switch
          id='is_active'
          checked={formData.is_active}
          onCheckedChange={checked =>
            setFormData({ ...formData, is_active: checked })
          }
        />
        <Label htmlFor='is_active'>有効</Label>
      </div>
      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          キャンセル
        </Button>
        <Button type='submit'>{template ? '更新' : '作成'}</Button>
      </div>
    </form>
  );
}
