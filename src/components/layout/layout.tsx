'use client';

import React, { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* モバイルサイドバートグル */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-md"
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex">
        {/* デスクトップサイドバー */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* モバイルサイドバー */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
              <div className="flex h-16 items-center justify-between px-4 border-b">
                <h2 className="text-lg font-semibold">メニュー</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 lg:ml-0">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
