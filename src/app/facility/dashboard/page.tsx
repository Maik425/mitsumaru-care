import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, FileText, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default function FacilityDashboardPage() {
  const menuItems = [
    {
      title: 'シフト管理',
      items: [
        {
          name: 'シフト詳細設定',
          href: '/facility/shift/create',
          icon: Calendar,
        },
        {
          name: 'シフト簡単作成',
          href: '/facility/shift/edit',
          icon: FileText,
        },
        { name: '休み管理', href: '/facility/shift/holidays', icon: Calendar },
      ],
    },
    {
      title: '役割表管理',
      items: [{ name: '役割表管理', href: '/facility/roles', icon: Users }],
    },
    {
      title: '各種登録管理',
      items: [
        {
          name: 'シフト形態管理',
          href: '/facility/settings/attendance-types',
          icon: Clock,
        },
        { name: '役職登録', href: '/facility/settings/positions', icon: Users },
        { name: '技能登録', href: '/facility/settings/skills', icon: Settings },
        {
          name: '職種・配置ルール登録',
          href: '/facility/settings/job-rules',
          icon: Settings,
        },
        {
          name: '役割表登録',
          href: '/facility/settings/role-templates',
          icon: FileText,
        },
        {
          name: '勤怠管理登録',
          href: '/facility/settings/attendance-management',
          icon: Clock,
        },
        {
          name: 'ログインアカウント登録',
          href: '/facility/settings/accounts',
          icon: Users,
        },
      ],
    },
    {
      title: '勤怠確認',
      items: [{ name: '勤怠確認', href: '/facility/attendance', icon: Clock }],
    },
  ];

  return (
    <RoleBasedLayout
      title='管理者ダッシュボード'
      description='介護業務の効率化をサポートします'
    >
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          管理者ダッシュボード
        </h2>
        <p className='text-gray-600'>介護業務の効率化をサポートします</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {menuItems.map(section => (
          <Card key={section.title} className='h-fit'>
            <CardHeader>
              <CardTitle className='text-lg'>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button variant='ghost' className='w-full justify-start'>
                      <Icon className='h-4 w-4 mr-2' />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </RoleBasedLayout>
  );
}
