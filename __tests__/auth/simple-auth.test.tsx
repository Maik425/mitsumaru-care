import { render, screen } from '@testing-library/react';
import { LoginForm } from '../../components/login-form';

describe('シンプルな認証テスト', () => {
  it('ログインフォームが正しく表示される', () => {
    render(<LoginForm />);

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
    render(<LoginForm />);

    expect(screen.getByText('テスト用アカウント:')).toBeInTheDocument();
    expect(screen.getByText('管理者: admin@mitsumaru.com')).toBeInTheDocument();
    expect(screen.getByText('一般職: user@mitsumaru.com')).toBeInTheDocument();
  });
});
