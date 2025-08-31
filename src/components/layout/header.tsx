'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Settings, Shield } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('サインアウトエラー:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getUserRole = (permissions: string[]) => {
    if (permissions.includes('SYSTEM_SETTINGS')) {
      return 'システム管理者';
    } else if (permissions.includes('SHIFT_MANAGEMENT')) {
      return '施設管理者';
    } else {
      return '一般職員';
    }
  };

  const getRoleIcon = (permissions: string[]) => {
    if (permissions.includes('SYSTEM_SETTINGS')) {
      return <Shield className="h-4 w-4 text-red-500" />;
    } else if (permissions.includes('SHIFT_MANAGEMENT')) {
      return <Settings className="h-4 w-4 text-blue-500" />;
    } else {
      return <User className="h-4 w-4 text-green-500" />;
    }
  };

  if (!user) {
    return (
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">みつまるケア</h1>
              <span className="text-sm text-gray-500">職員専用ポータル</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">みつまるケア</h1>
              <span className="text-sm text-gray-500">職員専用ポータル</span>
            </div>

            {/* ナビゲーションメニュー */}
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                ダッシュボード
              </a>
              <a
                href="/shifts"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                シフト管理
              </a>
              <a
                href="/attendance"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                勤怠管理
              </a>
              {user.permissions.includes('SYSTEM_SETTINGS') && (
                <a
                  href="/admin"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  管理画面
                </a>
              )}
            </nav>
          </div>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <div className="flex items-center space-x-1">
                {getRoleIcon(user.permissions)}
                <span className="text-xs text-gray-500">
                  {getUserRole(user.permissions)}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.email} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getUserInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getUserRole(user.permissions)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>プロフィール</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>設定</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>
                    {isSigningOut ? 'サインアウト中...' : 'サインアウト'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
