import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/login-form';
import { useRouter } from 'next/navigation';

// Next.js navigation のモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('認証フロー', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正しい認証情報でログインできる（管理者）', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'admin@mitsumaru.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    // ローディング状態の確認
    await waitFor(() => {
      expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    });

    // 管理者ダッシュボードへのリダイレクト確認
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
      },
      { timeout: 2000 }
    );
  });

  it('正しい認証情報でログインできる（一般職）', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'user@mitsumaru.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    // ローディング状態の確認
    await waitFor(() => {
      expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    });

    // 一般職ダッシュボードへのリダイレクト確認
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/user/dashboard');
      },
      { timeout: 2000 }
    );
  });

  it('無効な認証情報でエラーが表示される', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // ローディング状態の確認
    await waitFor(() => {
      expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    });

    // 一般職ダッシュボードへのリダイレクト確認（デフォルト動作）
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/user/dashboard');
      },
      { timeout: 2000 }
    );
  });

  it('必須フィールドのバリデーションが動作する', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    // 空の状態で送信
    fireEvent.click(submitButton);

    // HTML5バリデーションが動作することを確認
    expect(emailInput).toBeInvalid();
    expect(passwordInput).toBeInvalid();
  });

  it('テスト用アカウント情報が表示される', () => {
    render(<LoginForm />);

    expect(screen.getByText('テスト用アカウント:')).toBeInTheDocument();
    expect(screen.getByText('管理者: admin@mitsumaru.com')).toBeInTheDocument();
    expect(screen.getByText('一般職: user@mitsumaru.com')).toBeInTheDocument();
  });
});
