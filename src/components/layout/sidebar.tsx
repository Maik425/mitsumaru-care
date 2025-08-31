'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation, NavigationItem } from '@/src/hooks/use-navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  Home,
  Calendar,
  Clock,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getIcon = (id: string) => {
  switch (id) {
    case 'dashboard':
      return <Home className="h-4 w-4" />;
    case 'shifts':
      return <Calendar className="h-4 w-4" />;
    case 'attendance':
      return <Clock className="h-4 w-4" />;
    case 'roles':
      return <Users className="h-4 w-4" />;
    case 'admin':
      return <Settings className="h-4 w-4" />;
    default:
      return null;
  }
};

interface SidebarItemProps {
  item: NavigationItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  level?: number;
}

function SidebarItem({
  item,
  isExpanded,
  onToggle,
  level = 0,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const isExpandedItem = isExpanded;

  return (
    <div>
      <div className="flex items-center">
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mr-1"
            onClick={() => onToggle(item.id)}
          >
            {isExpandedItem ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        <Link
          href={item.href}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full',
            isActive
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            level > 0 && 'ml-6'
          )}
        >
          {getIcon(item.id)}
          <span>{item.label}</span>
        </Link>
      </div>

      {hasChildren && isExpandedItem && (
        <div className="mt-1 space-y-1">
          {item.children!.map(child => (
            <SidebarItem
              key={child.id}
              item={child}
              isExpanded={isExpanded}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { navigationItems } = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (navigationItems.length === 0) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <p>ナビゲーションが利用できません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
      </div>

      <nav className="space-y-1">
        {navigationItems.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isExpanded={expandedItems.has(item.id)}
            onToggle={toggleExpanded}
          />
        ))}
      </nav>
    </div>
  );
}
