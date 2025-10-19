'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function SystemGeneralSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: systemSettings, refetch } =
    trpc.systemSettings.getSystemSettings.useQuery();
  const updateSystemSettingMutation =
    trpc.systemSettings.updateSystemSetting.useMutation();
  const toggleMaintenanceModeMutation =
    trpc.systemSettings.toggleMaintenanceMode.useMutation();

  useEffect(() => {
    if (systemSettings) {
      const settingsMap: Record<string, string> = {};
      systemSettings.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value || '';
      });
      setSettings(settingsMap);
    }
  }, [systemSettings]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      const changedSettings = Object.entries(settings).filter(
        ([key, value]) =>
          systemSettings?.find((s: any) => s.key === key)?.value !== value
      );

      for (const [key, value] of changedSettings) {
        await updateSystemSettingMutation.mutateAsync({
          key,
          data: { value, description: null },
          changeReason: 'システム基本設定の変更',
        });
      }

      toast.success('設定を保存しました');
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error('設定の保存に失敗しました');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceModeToggle = async (enabled: boolean) => {
    try {
      await toggleMaintenanceModeMutation.mutateAsync({
        enabled,
        reason: enabled
          ? 'メンテナンスモードを有効化'
          : 'メンテナンスモードを無効化',
      });
      toast.success(
        `メンテナンスモードを${enabled ? '有効' : '無効'}にしました`
      );
      refetch();
    } catch (error) {
      toast.error('メンテナンスモードの切り替えに失敗しました');
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const isMaintenanceMode = settings.maintenance_mode === 'true';

  return (
    <div className='space-y-6'>
      {/* システム情報 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <RefreshCw className='h-5 w-5' />
            システム情報
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='system_name'>システム名</Label>
              <Input
                id='system_name'
                value={settings.system_name || ''}
                onChange={e =>
                  handleSettingChange('system_name', e.target.value)
                }
                placeholder='システム名を入力'
              />
            </div>
            <div>
              <Label htmlFor='system_version'>システムバージョン</Label>
              <Input
                id='system_version'
                value={settings.system_version || ''}
                onChange={e =>
                  handleSettingChange('system_version', e.target.value)
                }
                placeholder='バージョンを入力'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メンテナンス設定 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            メンテナンス設定
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='maintenance_mode'>メンテナンスモード</Label>
              <p className='text-sm text-muted-foreground'>
                メンテナンスモードを有効にすると、一般ユーザーはアクセスできなくなります
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={isMaintenanceMode ? 'destructive' : 'secondary'}>
                {isMaintenanceMode ? '有効' : '無効'}
              </Badge>
              <Switch
                id='maintenance_mode'
                checked={isMaintenanceMode}
                onCheckedChange={handleMaintenanceModeToggle}
                disabled={toggleMaintenanceModeMutation.isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* システム設定 */}
      <Card>
        <CardHeader>
          <CardTitle>システム設定</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='max_file_size'>最大ファイルサイズ (バイト)</Label>
              <Input
                id='max_file_size'
                type='number'
                value={settings.max_file_size || ''}
                onChange={e =>
                  handleSettingChange('max_file_size', e.target.value)
                }
                placeholder='10485760'
              />
            </div>
            <div>
              <Label htmlFor='session_timeout'>
                セッションタイムアウト (秒)
              </Label>
              <Input
                id='session_timeout'
                type='number'
                value={settings.session_timeout || ''}
                onChange={e =>
                  handleSettingChange('session_timeout', e.target.value)
                }
                placeholder='3600'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      {hasChanges && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                未保存の変更があります
              </p>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className='flex items-center gap-2'
              >
                <Save className='h-4 w-4' />
                {isLoading ? '保存中...' : '変更を保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
