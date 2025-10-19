import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ClipboardList,
  Clock,
  Database,
  Download,
  FileText,
  HelpCircle,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';

export interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  requiredRole?: string[];
  requiredPermission?: string[];
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface NavigationConfig {
  role: string;
  title: string;
  subtitle: string;
  sections: MenuSection[];
  commonItems: MenuItem[];
}

// 一般ユーザーメニュー設定
const userMenuConfig: NavigationConfig = {
  role: 'user',
  title: 'みつまるケア',
  subtitle: '一般職画面',
  sections: [
    {
      title: 'メニュー',
      items: [
        { name: 'ダッシュボード', href: '/user/dashboard', icon: Building2 },
        { name: '勤怠申請', href: '/user/attendance', icon: ClipboardList },
        { name: '希望休申請', href: '/user/holidays', icon: Calendar },
      ],
    },
  ],
  commonItems: [{ name: 'FAQ', href: '/faq', icon: HelpCircle }],
};

// 施設管理者メニュー設定
const facilityMenuConfig: NavigationConfig = {
  role: 'facility_admin',
  title: 'みつまるケア',
  subtitle: '管理者画面',
  sections: [
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
          icon: ClipboardList,
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
  ],
  commonItems: [{ name: 'FAQ', href: '/faq', icon: HelpCircle }],
};

// システム管理者メニュー設定
const systemMenuConfig: NavigationConfig = {
  role: 'system_admin',
  title: 'みつまるケア',
  subtitle: 'システム管理者画面',
  sections: [
    {
      title: 'ユーザー管理',
      items: [
        { name: 'ユーザー管理', href: '/system/users', icon: UserCheck },
        { name: '施設管理', href: '/system/facilities', icon: Building2 },
      ],
    },
    {
      title: 'システム管理',
      items: [
        { name: 'システム設定', href: '/system/settings', icon: Settings },
        { name: '監査ログ', href: '/system/audit-logs', icon: Database },
        { name: 'ヘルスチェック', href: '/system/health', icon: BarChart3 },
        { name: 'データエクスポート', href: '/system/export', icon: Download },
        { name: '通知管理', href: '/system/notifications', icon: Bell },
      ],
    },
  ],
  commonItems: [{ name: 'FAQ', href: '/faq', icon: HelpCircle }],
};

// ロール別メニュー設定の取得
export function getNavigationConfig(role: string): NavigationConfig {
  switch (role) {
    case 'system_admin':
      return systemMenuConfig;
    case 'facility_admin':
      return facilityMenuConfig;
    case 'user':
    default:
      return userMenuConfig;
  }
}

// 権限チェック関数
export function hasPermission(
  userRole: string,
  requiredRoles?: string[],
  requiredPermissions?: string[]
): boolean {
  // システム管理者は全ての権限を持つ
  if (userRole === 'system_admin') {
    return true;
  }

  // 必要なロールが指定されている場合
  if (requiredRoles && requiredRoles.length > 0) {
    return requiredRoles.includes(userRole);
  }

  // 必要な権限が指定されている場合（将来の拡張用）
  if (requiredPermissions && requiredPermissions.length > 0) {
    // 現在はロールベースの権限管理のみ
    return false;
  }

  // デフォルトは許可
  return true;
}

// メニューアイテムのフィルタリング
export function filterMenuItems(
  items: MenuItem[],
  userRole: string
): MenuItem[] {
  return items.filter(item =>
    hasPermission(userRole, item.requiredRole, item.requiredPermission)
  );
}
