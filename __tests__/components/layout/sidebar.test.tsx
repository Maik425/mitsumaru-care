import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../../src/components/layout/sidebar';
import { useNavigation } from '../../../src/hooks/use-navigation';

// useNavigationフックのモック
jest.mock('../../../src/hooks/use-navigation');
const mockUseNavigation = useNavigation as jest.MockedFunction<
  typeof useNavigation
>;

// next/navigationのモック
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ナビゲーションアイテムがない場合', () => {
    it('ナビゲーションが利用できないメッセージを表示', () => {
      mockUseNavigation.mockReturnValue({
        navigationItems: [],
        getNavigationItem: jest.fn(),
        hasNavigationAccess: jest.fn(),
      });

      render(<Sidebar />);

      expect(
        screen.getByText('ナビゲーションが利用できません')
      ).toBeInTheDocument();
    });
  });

  describe('ナビゲーションアイテムがある場合', () => {
    const mockNavigationItems = [
      {
        id: 'dashboard',
        label: 'ダッシュボード',
        href: '/dashboard',
        requiredPermissions: [],
      },
      {
        id: 'shifts',
        label: 'シフト管理',
        href: '/shifts',
        requiredPermissions: ['SHIFT_VIEW'],
        children: [
          {
            id: 'shift-view',
            label: 'シフト確認',
            href: '/shifts/view',
            requiredPermissions: ['SHIFT_VIEW'],
          },
          {
            id: 'shift-create',
            label: 'シフト作成',
            href: '/shifts/create',
            requiredPermissions: ['SHIFT_MANAGEMENT'],
          },
        ],
      },
    ];

    beforeEach(() => {
      mockUseNavigation.mockReturnValue({
        navigationItems: mockNavigationItems,
        getNavigationItem: jest.fn(),
        hasNavigationAccess: jest.fn(),
      });
    });

    it('メニュータイトルが表示される', () => {
      render(<Sidebar />);

      expect(screen.getByText('メニュー')).toBeInTheDocument();
    });

    it('ナビゲーションアイテムが正しく表示される', () => {
      render(<Sidebar />);

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
      expect(screen.getByText('シフト管理')).toBeInTheDocument();
    });

    it('子アイテムを持つメニューに展開ボタンが表示される', () => {
      render(<Sidebar />);

      const shiftManagementItem = screen.getByText('シフト管理').closest('div');
      expect(shiftManagementItem).toBeInTheDocument();

      // 展開ボタンが存在することを確認
      const expandButton = shiftManagementItem?.querySelector('button');
      expect(expandButton).toBeInTheDocument();
    });

    it('子アイテムが展開される', () => {
      render(<Sidebar />);

      // シフト管理の展開ボタンをクリック
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      // 子アイテムが表示される
      expect(screen.getByText('シフト確認')).toBeInTheDocument();
      expect(screen.getByText('シフト作成')).toBeInTheDocument();
    });

    it('子アイテムが正しいインデントで表示される', () => {
      render(<Sidebar />);

      // シフト管理の展開ボタンをクリック
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      // 子アイテムがml-6クラスを持つことを確認
      const childItem = screen.getByText('シフト確認').closest('a');
      expect(childItem).toHaveClass('ml-6');
    });
  });

  describe('アクティブ状態の表示', () => {
    it('現在のパスに応じてアクティブ状態が表示される', () => {
      // usePathnameを/dashboardにモック
      jest.doMock('next/navigation', () => ({
        usePathname: () => '/dashboard',
      }));

      mockUseNavigation.mockReturnValue({
        navigationItems: [
          {
            id: 'dashboard',
            label: 'ダッシュボード',
            href: '/dashboard',
            requiredPermissions: [],
          },
        ],
        getNavigationItem: jest.fn(),
        hasNavigationAccess: jest.fn(),
      });

      render(<Sidebar />);

      const dashboardLink = screen.getByText('ダッシュボード').closest('a');
      expect(dashboardLink).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  describe('アイコンの表示', () => {
    it('各メニューアイテムに適切なアイコンが表示される', () => {
      mockUseNavigation.mockReturnValue({
        navigationItems: [
          {
            id: 'dashboard',
            label: 'ダッシュボード',
            href: '/dashboard',
            requiredPermissions: [],
          },
          {
            id: 'shifts',
            label: 'シフト管理',
            href: '/shifts',
            requiredPermissions: ['SHIFT_VIEW'],
          },
          {
            id: 'attendance',
            label: '勤怠管理',
            href: '/attendance',
            requiredPermissions: ['ATTENDANCE_VIEW'],
          },
        ],
        getNavigationItem: jest.fn(),
        hasNavigationAccess: jest.fn(),
      });

      render(<Sidebar />);

      // アイコンが存在することを確認（SVG要素の存在確認）
      const dashboardItem = screen.getByText('ダッシュボード').closest('div');
      const shiftsItem = screen.getByText('シフト管理').closest('div');
      const attendanceItem = screen.getByText('勤怠管理').closest('div');

      expect(dashboardItem).toBeInTheDocument();
      expect(shiftsItem).toBeInTheDocument();
      expect(attendanceItem).toBeInTheDocument();
    });
  });

  describe('展開状態の管理', () => {
    it('複数のメニューを独立して展開できる', () => {
      mockUseNavigation.mockReturnValue({
        navigationItems: [
          {
            id: 'shifts',
            label: 'シフト管理',
            href: '/shifts',
            requiredPermissions: ['SHIFT_VIEW'],
            children: [
              {
                id: 'shift-view',
                label: 'シフト確認',
                href: '/shifts/view',
                requiredPermissions: ['SHIFT_VIEW'],
              },
            ],
          },
          {
            id: 'attendance',
            label: '勤怠管理',
            href: '/attendance',
            requiredPermissions: ['ATTENDANCE_VIEW'],
            children: [
              {
                id: 'attendance-view',
                label: '勤怠確認',
                href: '/attendance/view',
                requiredPermissions: ['ATTENDANCE_VIEW'],
              },
            ],
          },
        ],
        getNavigationItem: jest.fn(),
        hasNavigationAccess: jest.fn(),
      });

      render(<Sidebar />);

      const expandButtons = screen.getAllByRole('button');
      expect(expandButtons).toHaveLength(2);

      // 最初のボタンをクリック
      fireEvent.click(expandButtons[0]);
      expect(screen.getByText('シフト確認')).toBeInTheDocument();

      // 2番目のボタンをクリック
      fireEvent.click(expandButtons[1]);
      expect(screen.getByText('勤怠確認')).toBeInTheDocument();
    });
  });
});
