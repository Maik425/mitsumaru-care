import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoginForm } from '../../components/login-form';

describe('シンプルな認証テスト', () => {
  it('ログインフォームの要素が表示される', () => {
    render(<LoginForm />);

    // フォーム要素の確認
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
});
