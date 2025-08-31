import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  PermissionCheck,
  ShiftManagementCheck,
  AttendanceManagementCheck,
  SystemSettingsCheck,
  UserManagementCheck,
} from '../../../src/components/auth/permission-check';
import { usePermission } from '../../../src/hooks/use-permission';

// usePermissionフックのモック
jest.mock('../../../src/hooks/use-permission');
const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('PermissionCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('権限がある場合', () => {
    it('子要素が表示される', () => {
      mockUsePermission.mockReturnValue(true);

      render(
        <PermissionCheck requiredPermissions={['SHIFT_MANAGEMENT']}>
          <div>シフト管理機能</div>
        </PermissionCheck>
      );

      expect(screen.getByText('シフト管理機能')).toBeInTheDocument();
    });
  });

  describe('権限がない場合', () => {
    it('フォールバックが表示される', () => {
      mockUsePermission.mockReturnValue(false);

      render(
        <PermissionCheck
          requiredPermissions={['SHIFT_MANAGEMENT']}
          fallback={<div>権限がありません</div>}
        >
          <div>シフト管理機能</div>
        </PermissionCheck>
      );

      expect(screen.getByText('権限がありません')).toBeInTheDocument();
      expect(screen.queryByText('シフト管理機能')).not.toBeInTheDocument();
    });

    it('フォールバックがない場合は何も表示されない', () => {
      mockUsePermission.mockReturnValue(false);

      const { container } = render(
        <PermissionCheck requiredPermissions={['SHIFT_MANAGEMENT']}>
          <div>シフト管理機能</div>
        </PermissionCheck>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('複数権限のチェック', () => {
    it('複数権限のいずれかがある場合に表示される', () => {
      mockUsePermission.mockReturnValue(true);

      render(
        <PermissionCheck
          requiredPermissions={['SHIFT_MANAGEMENT', 'ATTENDANCE_MANAGEMENT']}
        >
          <div>管理機能</div>
        </PermissionCheck>
      );

      expect(screen.getByText('管理機能')).toBeInTheDocument();
    });

    it('複数権限が全てない場合は表示されない', () => {
      mockUsePermission.mockReturnValue(false);

      render(
        <PermissionCheck
          requiredPermissions={['SHIFT_MANAGEMENT', 'ATTENDANCE_MANAGEMENT']}
          fallback={<div>権限がありません</div>}
        >
          <div>管理機能</div>
        </PermissionCheck>
      );

      expect(screen.getByText('権限がありません')).toBeInTheDocument();
    });
  });
});

describe('ShiftManagementCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SHIFT_MANAGEMENT権限がある場合に子要素が表示される', () => {
    mockUsePermission.mockReturnValue(true);

    render(
      <ShiftManagementCheck>
        <div>シフト管理機能</div>
      </ShiftManagementCheck>
    );

    expect(screen.getByText('シフト管理機能')).toBeInTheDocument();
  });

  it('SHIFT_MANAGEMENT権限がない場合にフォールバックが表示される', () => {
    mockUsePermission.mockReturnValue(false);

    render(
      <ShiftManagementCheck fallback={<div>シフト管理権限がありません</div>}>
        <div>シフト管理機能</div>
      </ShiftManagementCheck>
    );

    expect(screen.getByText('シフト管理権限がありません')).toBeInTheDocument();
  });
});

describe('AttendanceManagementCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ATTENDANCE_MANAGEMENT権限がある場合に子要素が表示される', () => {
    mockUsePermission.mockReturnValue(true);

    render(
      <AttendanceManagementCheck>
        <div>勤怠管理機能</div>
      </AttendanceManagementCheck>
    );

    expect(screen.getByText('勤怠管理機能')).toBeInTheDocument();
  });

  it('ATTENDANCE_MANAGEMENT権限がない場合にフォールバックが表示される', () => {
    mockUsePermission.mockReturnValue(false);

    render(
      <AttendanceManagementCheck fallback={<div>勤怠管理権限がありません</div>}>
        <div>勤怠管理機能</div>
      </AttendanceManagementCheck>
    );

    expect(screen.getByText('勤怠管理権限がありません')).toBeInTheDocument();
  });
});

describe('SystemSettingsCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SYSTEM_SETTINGS権限がある場合に子要素が表示される', () => {
    mockUsePermission.mockReturnValue(true);

    render(
      <SystemSettingsCheck>
        <div>システム設定機能</div>
      </SystemSettingsCheck>
    );

    expect(screen.getByText('システム設定機能')).toBeInTheDocument();
  });

  it('SYSTEM_SETTINGS権限がない場合にフォールバックが表示される', () => {
    mockUsePermission.mockReturnValue(false);

    render(
      <SystemSettingsCheck fallback={<div>システム設定権限がありません</div>}>
        <div>システム設定機能</div>
      </SystemSettingsCheck>
    );

    expect(
      screen.getByText('システム設定権限がありません')
    ).toBeInTheDocument();
  });
});

describe('UserManagementCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('USER_MANAGEMENT権限がある場合に子要素が表示される', () => {
    mockUsePermission.mockReturnValue(true);

    render(
      <UserManagementCheck>
        <div>ユーザー管理機能</div>
      </UserManagementCheck>
    );

    expect(screen.getByText('ユーザー管理機能')).toBeInTheDocument();
  });

  it('USER_MANAGEMENT権限がない場合にフォールバックが表示される', () => {
    mockUsePermission.mockReturnValue(false);

    render(
      <UserManagementCheck fallback={<div>ユーザー管理権限がありません</div>}>
        <div>ユーザー管理機能</div>
      </UserManagementCheck>
    );

    expect(
      screen.getByText('ユーザー管理権限がありません')
    ).toBeInTheDocument();
  });
});
