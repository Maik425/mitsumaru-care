import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../../components/login-form';
import { useAuth } from '../../src/hooks/use-auth';

// useAuthフックのモック
jest.mock('../../src/hooks/use-auth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('LoginForm (Integrated)', () => {
  let mockSignIn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSignIn = jest.fn();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn(),
      signIn: mockSignIn,
      signOut: jest.fn(),
    });
  });

  it('ログインフォームが正しく表示される', () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    expect(
      screen.getByText('ログイン', { selector: '[data-slot="card-title"]' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ログイン' })
    ).toBeInTheDocument();
  });

  it('テスト用アカウント情報が表示される', () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    expect(screen.getByText('テスト用アカウント:')).toBeInTheDocument();
    expect(
      screen.getByText('システム管理者: admin@mitsumaru.com')
    ).toBeInTheDocument();
    expect(
      screen.getByText('施設管理者: facility-admin@mitsumaru.com')
    ).toBeInTheDocument();
    expect(
      screen.getByText('一般職員: staff@mitsumaru.com')
    ).toBeInTheDocument();
  });

  it('有効な入力でログインが実行される', async () => {
    mockSignIn.mockResolvedValue({
      success: true,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        employeeNumber: 'EMP001',
        permissions: ['SHIFT_VIEW'],
      },
    });

    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  it('ログイン成功時にエラーが表示されない', async () => {
    mockSignIn.mockResolvedValue({
      success: true,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        employeeNumber: 'EMP001',
        permissions: ['SHIFT_VIEW'],
      },
    });

    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    // エラーメッセージが表示されないことを確認
    expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
  });

  it('ログイン失敗時にエラーメッセージが表示される', async () => {
    mockSignIn.mockResolvedValue({
      success: false,
      error: '認証に失敗しました',
    });

    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeInTheDocument();
    });
  });

  it('ログイン中はボタンが無効化される', async () => {
    mockSignIn.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // ログイン中はボタンが無効化される
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('ログイン中...')).toBeInTheDocument();

    // 入力フィールドも無効化される
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('空の入力で送信した場合、HTML5バリデーションが動作する', () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    // HTML5バリデーションが動作する（required属性）
    const emailInput = screen.getByLabelText(
      'メールアドレス'
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      'パスワード'
    ) as HTMLInputElement;

    expect(emailInput.validity.valid).toBe(false);
    expect(passwordInput.validity.valid).toBe(false);
  });
});
