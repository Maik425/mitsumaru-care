'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { SystemChangeHistory } from './system-change-history';
import { SystemGeneralSettings } from './system-general-settings';
import { SystemNotificationSettings } from './system-notification-settings';
import { SystemSecuritySettings } from './system-security-settings';

export function SystemSettingsManagement() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='general'>基本設定</TabsTrigger>
          <TabsTrigger value='notifications'>通知設定</TabsTrigger>
          <TabsTrigger value='security'>セキュリティ</TabsTrigger>
          <TabsTrigger value='history'>変更履歴</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-4'>
          <SystemGeneralSettings />
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <SystemNotificationSettings />
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <SystemSecuritySettings />
        </TabsContent>

        <TabsContent value='history' className='space-y-4'>
          <SystemChangeHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
