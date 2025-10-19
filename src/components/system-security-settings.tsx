'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { Clock, Lock, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function SystemSecuritySettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: securitySettings, refetch } =
    trpc.systemSettings.getSecuritySettings.useQuery();
  const updateSecuritySettingMutation =
    trpc.systemSettings.updateSecuritySetting.useMutation();

  useEffect(() => {
    if (securitySettings) {
      const settingsMap: Record<string, string> = {};
      securitySettings.forEach((setting: any) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsMap);
    }
  }, [securitySettings]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleBooleanSettingChange = (key: string, value: boolean) => {
    handleSettingChange(key, value.toString());
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      const changedSettings = Object.entries(settings).filter(
        ([key, value]) =>
          securitySettings?.find((s: any) => s.setting_key === key)?.value !==
          value
      );

      for (const [key, value] of changedSettings) {
        await updateSecuritySettingMutation.mutateAsync({
          key,
          data: { value: value, description: null },
          changeReason: 'セキュリティ設定の変更',
        });
      }

      toast.success('セキュリティ設定を保存しました');
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error('セキュリティ設定の保存に失敗しました');
      console.error('Error saving security settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordPolicySettings =
    securitySettings?.filter(
      (s: any) => s.setting_type === 'password_policy'
    ) || [];
  const sessionSettings =
    securitySettings?.filter((s: any) => s.setting_type === 'session') || [];
  const accessControlSettings =
    securitySettings?.filter((s: any) => s.setting_type === 'access_control') ||
    [];

  return (
    <div className='space-y-6'>
      {/* パスワードポリシー */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            パスワードポリシー
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='password_min_length'>最小文字数</Label>
              <Input
                id='password_min_length'
                type='number'
                value={settings.password_min_length || ''}
                onChange={e =>
                  handleSettingChange('password_min_length', e.target.value)
                }
                placeholder='8'
              />
            </div>
            <div>
              <Label htmlFor='password_expiry_days'>有効期限 (日)</Label>
              <Input
                id='password_expiry_days'
                type='number'
                value={settings.password_expiry_days || ''}
                onChange={e =>
                  handleSettingChange('password_expiry_days', e.target.value)
                }
                placeholder='90'
              />
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='password_require_uppercase'>大文字を含む</Label>
                <p className='text-sm text-muted-foreground'>
                  パスワードに大文字を含める必要があります
                </p>
              </div>
              <Switch
                id='password_require_uppercase'
                checked={settings.password_require_uppercase === 'true'}
                onCheckedChange={checked =>
                  handleBooleanSettingChange(
                    'password_require_uppercase',
                    checked
                  )
                }
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='password_require_lowercase'>小文字を含む</Label>
                <p className='text-sm text-muted-foreground'>
                  パスワードに小文字を含める必要があります
                </p>
              </div>
              <Switch
                id='password_require_lowercase'
                checked={settings.password_require_lowercase === 'true'}
                onCheckedChange={checked =>
                  handleBooleanSettingChange(
                    'password_require_lowercase',
                    checked
                  )
                }
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='password_require_numbers'>数字を含む</Label>
                <p className='text-sm text-muted-foreground'>
                  パスワードに数字を含める必要があります
                </p>
              </div>
              <Switch
                id='password_require_numbers'
                checked={settings.password_require_numbers === 'true'}
                onCheckedChange={checked =>
                  handleBooleanSettingChange(
                    'password_require_numbers',
                    checked
                  )
                }
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='password_require_symbols'>記号を含む</Label>
                <p className='text-sm text-muted-foreground'>
                  パスワードに記号を含める必要があります
                </p>
              </div>
              <Switch
                id='password_require_symbols'
                checked={settings.password_require_symbols === 'true'}
                onCheckedChange={checked =>
                  handleBooleanSettingChange(
                    'password_require_symbols',
                    checked
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* セッション管理 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            セッション管理
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='session_timeout_minutes'>
                セッションタイムアウト (分)
              </Label>
              <Input
                id='session_timeout_minutes'
                type='number'
                value={settings.session_timeout_minutes || ''}
                onChange={e =>
                  handleSettingChange('session_timeout_minutes', e.target.value)
                }
                placeholder='60'
              />
            </div>
            <div>
              <Label htmlFor='max_login_attempts'>最大ログイン試行回数</Label>
              <Input
                id='max_login_attempts'
                type='number'
                value={settings.max_login_attempts || ''}
                onChange={e =>
                  handleSettingChange('max_login_attempts', e.target.value)
                }
                placeholder='5'
              />
            </div>
            <div>
              <Label htmlFor='lockout_duration_minutes'>
                ロックアウト時間 (分)
              </Label>
              <Input
                id='lockout_duration_minutes'
                type='number'
                value={settings.lockout_duration_minutes || ''}
                onChange={e =>
                  handleSettingChange(
                    'lockout_duration_minutes',
                    e.target.value
                  )
                }
                placeholder='15'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクセス制御 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            アクセス制御
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='ip_whitelist_enabled'>IPホワイトリスト</Label>
                <p className='text-sm text-muted-foreground'>
                  特定のIPアドレスからのアクセスのみを許可します
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={
                    settings.ip_whitelist_enabled === 'true'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {settings.ip_whitelist_enabled === 'true' ? '有効' : '無効'}
                </Badge>
                <Switch
                  id='ip_whitelist_enabled'
                  checked={settings.ip_whitelist_enabled === 'true'}
                  onCheckedChange={checked =>
                    handleBooleanSettingChange('ip_whitelist_enabled', checked)
                  }
                />
              </div>
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
