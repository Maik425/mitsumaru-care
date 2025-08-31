import { render, screen } from '@testing-library/react';
import HomePage from '../../app/page';

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />);

    expect(screen.getByText(/みつまるケア/)).toBeInTheDocument();
    expect(screen.getByText(/介護業務効率化サービス/)).toBeInTheDocument();
  });

  it('displays login form', () => {
    render(<HomePage />);

    // ログインフォームが表示されることを確認
    expect(screen.getByText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByText(/パスワード/)).toBeInTheDocument();
  });

  it('shows test account information', () => {
    render(<HomePage />);

    // テスト用アカウント情報が表示されることを確認
    expect(screen.getByText(/テスト用アカウント/)).toBeInTheDocument();
    expect(screen.getByText(/管理者: admin@mitsumaru.com/)).toBeInTheDocument();
    expect(screen.getByText(/一般職: user@mitsumaru.com/)).toBeInTheDocument();
  });

  it('has correct page structure', () => {
    render(<HomePage />);

    // ページの構造が正しいことを確認
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/みつまるケア/)).toBeInTheDocument();
  });
});
