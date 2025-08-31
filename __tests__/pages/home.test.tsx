import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../../app/page';

describe('HomePage', () => {
  it('welcome messageが表示される', () => {
    render(<HomePage />);

    expect(screen.getByText('みつまるケア')).toBeInTheDocument();
    expect(screen.getByText('介護業務効率化サービス')).toBeInTheDocument();
  });

  it('ログインフォームの要素が表示される', () => {
    render(<HomePage />);

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
    render(<HomePage />);

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

  it('正しいページ構造を持つ', () => {
    render(<HomePage />);

    // ヘッダー
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('みつまるケア')).toBeInTheDocument();

    // 入力フィールド
    expect(
      screen.getByPlaceholderText('example@mitsumaru.com')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('パスワードを入力')).toBeInTheDocument();
  });
});
